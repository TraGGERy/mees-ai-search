"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { db } from "@/db/db";
import { userSubscriptions, userTries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Model, models } from "@/lib/types/models";
import { createModelId } from "@/lib/utils";

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (id: string) => void;
}

export function ModelSelector({ selectedModelId, onModelChange }: ModelSelectorProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [dailyTries, setDailyTries] = useState<number>(5);
  const [showModal, setShowModal] = useState(false);

  // Fetch subscription status and daily tries if the user is logged in
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 1. Check subscription status
        const sub = await db
          .select({
            subscriptionStatus: userSubscriptions.subscriptionStatus,
          })
          .from(userSubscriptions)
          .where(eq(userSubscriptions.clerkUserId, user.id))
          .limit(1);

        const status = sub[0]?.subscriptionStatus || "inactive";
        setSubscriptionStatus(status);

        // 2. Load or create user tries
        const [record] = await db
          .select()
          .from(userTries)
          .where(eq(userTries.userId, user.id));

        if (!record) {
          // If no record, create one with 5 tries
          await db.insert(userTries).values({
            userId: user.id,
            dailyTriesRemaining: 5,
            lastResetDate: new Date(),
          });
          setDailyTries(5);
          return;
        }

        // 3. Check if last reset was more than 24 hours ago
        const now = new Date();
        const lastReset = new Date(record.lastResetDate);
        const hoursSinceReset = (now.getTime() - lastReset.getTime()) / 36e5;

        if (hoursSinceReset >= 24) {
          // Reset tries to 5 if it's been ≥ 24 hours
          await db
            .update(userTries)
            .set({
              dailyTriesRemaining: 5,
              lastResetDate: new Date(),
            })
            .where(eq(userTries.userId, user.id));
          setDailyTries(5);
        } else {
          // Otherwise load existing tries
          setDailyTries(record.dailyTriesRemaining);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // fallback
        setSubscriptionStatus("inactive");
        setDailyTries(5);
      }
    };

    fetchData();
  }, [user]);

  // Handle user changing the model
  const handleModelChange = async (id: string) => {
    const selectedModel = models.find((m) => createModelId(m) === id);
    if (!selectedModel) return;

    // If not signed in, allow only GPT-4o mini
    if (!isSignedIn) {
      if (selectedModel.id !== "gpt-4o-mini") {
        toast.error("Please sign in to use this model");
        return;
      }
      onModelChange(id);
      return;
    }

    // If the user is signed in, check subscription
    const isPremium = selectedModel.id === "gpt-4o" || selectedModel.provider === "Anthropic" || selectedModel.provider === "Google Generative AI";

    if (subscriptionStatus === "paid") {
      // Paid users can use any model
      onModelChange(id);
    } else {
      // Not paid - check daily tries for premium models
      if (isPremium) {
        if (dailyTries <= 0) {
          toast.error("🔒 You&apos;ve used all your free premium tries for today!");
          setShowModal(true);
          // Automatically switch to GPT-4o mini
          const fallbackModel = createModelId(models.find(m => m.id === "gpt-4o-mini")!);
          onModelChange(fallbackModel);
          return;
        }

        // Decrement daily tries
        try {
          await db
            .update(userTries)
            .set({
              dailyTriesRemaining: dailyTries - 1,
            })
            .where(eq(userTries.userId, user?.id as string));

          setDailyTries((prev) => prev - 1);
          onModelChange(id);
          
          if (dailyTries - 1 > 0) {
            toast.success(`✨ ${dailyTries - 1} premium tries remaining today!`);
          } else {
            toast.warning("⚠️ Last premium try used! Consider upgrading to Pro.");
            // After the last try is used, switch to GPT-4o mini
            const fallbackModel = createModelId(models.find(m => m.id === "gpt-4o-mini")!);
            setTimeout(() => {
              onModelChange(fallbackModel);
            }, 1500); // Small delay to show the warning toast first
          }
        } catch (error) {
          console.error("Failed to update daily tries:", error);
          toast.error("Failed to update remaining tries. Please try again.");
        }
      } else {
        // Non-premium model (like GPT-4o mini)
        onModelChange(id);
      }
    }
  };

  // Simple fallback to GPT-4o mini if user declines
  const handleDeclineUpgrade = () => {
    const fallbackModel = createModelId(models.find((m) => m.id === "gpt-4o-mini")!);
    onModelChange(fallbackModel);
    setShowModal(false);
  };

  const handleUpgrade = () => {
    window.location.href = "/pricing";
  };

  const closeModal = () => setShowModal(false);

  // Group models by provider
  const groupedModels = models.reduce((acc, model) => {
    const provider = model.provider;
    acc[provider] = acc[provider] || [];
    acc[provider].push(model);
    return acc as Record<string, Model[]>;
  }, {} as Record<string, Model[]>);

  const getModelIcon = (model: Model): string => {
    // Speed models
    if (model.isSpeed) {
      return "⚡"; // Lightning bolt for speed
    }
    
    // Special cases based on provider/name
    switch (model.name) {
      case 'Quality (GPT)':
        return "🧠"; // Brain for GPT quality
      case 'Quality (Claude)':
        return "🎭"; // Theatre mask for Claude's versatility
      case 'Quantum Leap':
        return "🌌"; // Galaxy for quantum capabilities
      case 'Lightning Strike':
        return "⚡"; // Lightning for speed
      case 'Code Whisperer':
        return "👨‍💻"; // Developer for coding focus
      default:
        return "🤖"; // Robot as fallback
    }
  };

  return (
    <>
      <div className="absolute -top-8 left-2">
        <Select
          name="model"
          value={selectedModelId}
          onValueChange={handleModelChange}
        >
          <SelectTrigger className="mr-2 w-[200px] h-8 text-sm border border-input/50 bg-background/50 hover:bg-accent/50 backdrop-blur-sm transition-colors">
            {selectedModelId ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {getModelIcon(models.find(m => createModelId(m) === selectedModelId)!)}
                </span>
                <SelectValue>
                  {models.find(m => createModelId(m) === selectedModelId)?.name || "Select AI Model"}
                </SelectValue>
              </div>
            ) : (
              <SelectValue placeholder="Select AI Model" />
            )}
          </SelectTrigger>
          <SelectContent 
            className="w-[300px] max-h-[300px] overflow-y-auto border-input/50 bg-background/95 backdrop-blur-md"
            position="popper"
            sideOffset={5}
          >
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
              {!isSignedIn && (
                <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                  💡 Sign in to unlock all models and features
                </div>
              )}
              {isSignedIn && subscriptionStatus !== "paid" && (
                <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                  ✨ {dailyTries} premium tries remaining today
                </div>
              )}
            </div>
            
            <div className="relative">
              {Object.entries(groupedModels).map(([provider, modelList], index) => (
                <SelectGroup key={provider}>
                  <SelectLabel className="text-xs bg-background/95 backdrop-blur-sm font-semibold px-3 py-2 border-b">
                    {provider}
                  </SelectLabel>
                  {modelList.map((model) => {
                    const id = createModelId(model);
                    const isPremium = model.id === "gpt-4o" || model.provider === "Anthropic";
                    const locked =
                      (!isSignedIn && model.id !== "gpt-4o-mini") ||
                      (subscriptionStatus !== "paid" && isPremium && dailyTries <= 0);

                    return (
                      <SelectItem 
                        key={id} 
                        value={id} 
                        className={`py-2.5 px-3 hover:bg-accent/50 transition-colors ${
                          locked ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getModelIcon(model)}</span>
                            <span className="text-sm font-medium flex items-center gap-2">
                              {model.name}
                              {model.isPro && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                                  Pro
                                </span>
                              )}
                              {model.isCopilot && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                                  Copilot
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {model.description}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              ))}
              <div className="h-2" />
            </div>
          </SelectContent>
        </Select>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-background border rounded-xl p-6 max-w-sm mx-auto shadow-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Upgrade to Pro 🚀</h3>
                <p className="text-sm text-muted-foreground">
                  You&apos;ve used all your free premium tries for today. Upgrade to Pro for unlimited access to all models.
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleUpgrade}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Upgrade to Pro
                </button>
                <button
                  onClick={handleDeclineUpgrade}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Continue with Free Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getModelDescription(modelId: string): string {
  const descriptions: Record<string, string> = {
    'gpt-4o': 'Advanced GPT-4 for complex tasks',
    'gpt-4o-mini': 'Fast, efficient GPT-4 for everyday use',
    'claude-3-5-sonnet-latest': 'Balanced Claude model for reliable performance',
    'claude-3-5-haiku-20241022': 'Fast Claude model for quick responses',
    'gemini-1.5-pro-002': 'Powerful Gemini model for diverse tasks',
    'gemini-2.0-flash-exp': 'Experimental Gemini model with latest features',
  };
  
  return descriptions[modelId] || 'AI language model';
}
