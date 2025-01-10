"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { db } from "@/db/db";
import { userSubscriptions, userTries } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
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
        toast.error("Please sign in to use this model.");
        return;
      }
      onModelChange(id);
      return;
    }

    // If the user is signed in, check subscription
    const isPremium = selectedModel.id === "gpt-4o" || selectedModel.provider === "Anthropic";

    if (subscriptionStatus === "paid") {
      // Paid users can use any model
      onModelChange(id);
    } else {
      // Not paid - check daily tries for premium models
      if (isPremium) {
        if (dailyTries <= 0) {
          toast.error("🔒 You've used all your free premium tries for today!");
          setShowModal(true);
          return;
        }
        // Decrement daily tries
        try {
          await db
            .update(userTries)
            .set({
              dailyTriesRemaining: dailyTries - 1,
              lastResetDate: new Date(), // optional to set
            })
            .where(eq(userTries.userId, user?.id as string));
          setDailyTries((prev) => prev - 1);

          onModelChange(id);
          toast.success(`${dailyTries - 1} free tries remaining for today!`);
        } catch (error) {
          console.error("Failed to update daily tries:", error);
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
    return acc;
  }, {} as Record<string, Model[]>);

  return (
    <>
      <div className="absolute -top-8 left-2">
        <Select
          name="model"
          value={selectedModelId}
          onValueChange={handleModelChange}
        >
          <SelectTrigger className="mr-2 h-7 text-xs border-none shadow-none focus:ring-0">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {Object.entries(groupedModels).map(([provider, modelList]) => (
              <SelectGroup key={provider}>
                <SelectLabel className="text-xs sticky top-0 bg-background z-10">
                  {provider}
                </SelectLabel>
                {modelList.map((model) => {
                  const id = createModelId(model);
                  const isPremium = model.id === "gpt-4o" || model.provider === "Anthropic";
                  // For display, a model is locked if user is not logged in or out of tries
                  const locked =
                    (!isSignedIn && model.id !== "gpt-4o-mini") || // logged out can only use mini
                    (subscriptionStatus !== "paid" && isPremium && dailyTries <= 0);

                  return (
                    <SelectItem key={id} value={id} className={`py-2 ${locked ? "text-gray-400" : ""}`}>
                      <div className="flex items-center space-x-1">
                        <Image
                          src={`/providers/logos/${model.providerId}.svg`}
                          alt={model.provider}
                          width={18}
                          height={18}
                          className="bg-white rounded-full border"
                        />
                        <span className="text-xs font-medium">
                          {locked ? "🔒" : "⚡"} {model.name}
                          {(isPremium && subscriptionStatus !== "paid" && isSignedIn) && (
                            <span className="ml-1 text-xs text-gray-600">
                              ({dailyTries} left today)
                            </span>
                          )}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-auto text-gray-700 shadow-xl relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 text-lg hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-2">Upgrade Required 🔒</h3>
            <p className="mb-4 text-sm">
              You have used all your free daily tries. Please upgrade to access premium models without limitation.
            </p>
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={handleDeclineUpgrade}
                className="w-full px-6 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
              >
                Continue with GPT-4o mini
              </button>
              <button
                onClick={handleUpgrade}
                className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Upgrade to Pro Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
