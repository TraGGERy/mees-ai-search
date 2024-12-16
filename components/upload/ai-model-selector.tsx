"use client";

import { RadioGroup, RadioGroupItem } from "@/components/updic/ui/radio-group";
import { Label } from "@/components/updic/ui/label";
import { Brain, Stars, Sparkles } from "lucide-react";

interface AIModelSelectorProps {
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

export default function AIModelSelector({ selectedModel, onModelSelect }: AIModelSelectorProps) {
  const models = [
    {
      id: "gpt4",
      name: "ChatGPT 4-mini",
      description: "Balanced performance and accuracy",
      icon: Brain
    },
    {
      id: "claude",
      name: "Anthropic Claude",
      description: "Advanced reasoning and analysis",
      icon: Stars
    },
    {
      id: "gemini",
      name: "Google Gemini",
      description: "Cutting-edge multimodal analysis",
      icon: Sparkles
    }
  ];

  return (
    <RadioGroup
      value={selectedModel}
      onValueChange={onModelSelect}
      className="grid gap-4"
    >
      {models.map((model) => {
        const Icon = model.icon;
        return (
          <Label
            key={model.id}
            className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer transition-colors
              ${selectedModel === model.id ? "border-purple-500 bg-purple-500/10" : "hover:border-purple-500/50"}`}
          >
            <RadioGroupItem value={model.id} id={model.id} className="sr-only" />
            <Icon className="h-6 w-6 text-purple-500" />
            <div className="flex-1">
              <h3 className="font-medium">{model.name}</h3>
              <p className="text-sm text-muted-foreground">{model.description}</p>
            </div>
          </Label>
        );
      })}
    </RadioGroup>
  );
}