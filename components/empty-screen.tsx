import { Card } from "@/components/ui/card";
import { Clapperboard, Carrot, TreesIcon as Lungs, Smartphone } from "lucide-react";

const exampleMessages = [
  {
    heading: "James Bond",
    message: "The next James Bond",
    icon: Clapperboard,
  },
  {
    heading: "Seasonal Veggies",
    message: "Vegetables in season",
    icon: Carrot,
  },
  {
    heading: "Breathwork",
    message: "Breathwork benefits",
    icon: Lungs,
  },
  {
    heading: "New iPhone",
    message: "New iPhone rumours",
    icon: Smartphone,
  },
];

export function EmptyScreen({
  submitMessage,
  className,
}: {
  submitMessage: (message: string) => void;
  className?: string;
}) {
  return (
    <div className={`top-8 p-4 ${className}`}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {exampleMessages.map((message, index) => (
          <Card
            key={index}
            onClick={() => submitMessage(message.message)}
            className="group flex items-center p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-purple-600/10 group-hover:bg-purple-600/20">
              <message.icon className="h-5 w-5 text-purple-500" />
            </div>
            <span className="ml-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
              {message.heading}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
