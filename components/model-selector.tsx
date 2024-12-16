"use client"; // Client-side only component

import { useAuth, useUser } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Model, models } from "@/lib/types/models";
import { createModelId } from "@/lib/utils";
import { toast } from "sonner";
import { db } from "@/db/db";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (id: string) => void;
}

export function ModelSelector({ selectedModelId, onModelChange }: ModelSelectorProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [lockedModelId, setLockedModelId] = useState<string | null>(null);

  // Set the default model to GPT-4o mini
  useEffect(() => {
    if (!selectedModelId) {
      const defaultModelId = createModelId(models.find((model) => model.id === "gpt-4o-mini")!);
      onModelChange(defaultModelId);
    }
  }, [selectedModelId, onModelChange]);

  useEffect(() => {
    if (user) {
      const fetchSubscriptionData = async () => {
        try {
          const subscription = await db
            .select({ subscriptionStatus: userSubscriptions.subscriptionStatus })
            .from(userSubscriptions)
            .where(eq(userSubscriptions.clerkUserId, user.id))
            .limit(1);

          setSubscriptionStatus(subscription[0]?.subscriptionStatus || "inactive");
        } catch (error) {
          console.error("Error fetching subscription status:", error);
        }
      };

      fetchSubscriptionData();
    }
  }, [user]);

  const handleModelChange = (id: string) => {
    const selectedModel = models.find((model) => createModelId(model) === id);

    if (
      (selectedModel?.id === "gpt-4o" || selectedModel?.provider === "Anthropic") &&
      subscriptionStatus !== "paid"
    ) {
      setLockedModelId(id); // Set the locked model ID
      toast.error("🔒 This model requires an active Pro Plan subscription.");
      setShowModal(true);
    } else {
      onModelChange(id);
    }
  };

  const handleDeclineUpgrade = () => {
    if (lockedModelId) {
      const fallbackModelId = createModelId(models.find((model) => model.id === "gpt-4o-mini")!);
      onModelChange(fallbackModelId);
      setShowModal(false);
    }
  };

  const handleUpgrade = () => {
    toast.info("Redirecting to the upgrade page...");
    window.location.href = "/pricing"; // Redirect user to pricing/upgrade page
  };

  const closeModal = () => setShowModal(false);

  const groupedModels = models.reduce((groups, model) => {
    const provider = model.provider;
    if (!groups[provider]) groups[provider] = [];
    groups[provider].push(model);
    return groups;
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
            {Object.entries(groupedModels).map(([provider, models]) => (
              <SelectGroup key={provider}>
                <SelectLabel className="text-xs sticky top-0 bg-background z-10">
                  {provider}
                </SelectLabel>
                {models.map((model) => {
                  const isLocked =
                    (model.id === "gpt-4o" || model.provider === "Anthropic") &&
                    subscriptionStatus !== "paid";

                  return (
                    <SelectItem
                      key={createModelId(model)}
                      value={createModelId(model)}
                      className={`py-2 ${isLocked ? "text-gray-400" : ""}`}
                    >
                      <div className="flex items-center space-x-1">
                        <Image
                          src={`/providers/logos/${model.providerId}.svg`}
                          alt={model.provider}
                          width={18}
                          height={18}
                          className="bg-white rounded-full border"
                        />
                        <span className="text-xs font-medium">
                          {isLocked ? "🔒" : "⚡"} {model.name}
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

      {/* Modal for subscription upgrade */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-auto text-gray-700 shadow-xl">
            <div className="relative">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 text-lg hover:text-gray-700"
              >
                ✕
              </button>
              <h3 className="text-lg font-semibold mb-2">Upgrade Required 🔒</h3>
              <p className="mb-4 text-sm">
                To access premium models like GPT-4o and Anthropic, please upgrade to the Pro Plan.
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
        </div>
      )}
    </>
  );
}
