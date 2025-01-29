import { Badge } from "@/components/ui/badge";
import { defaultPersonaLimits } from "@/db/schema";
import { Sparkles } from 'lucide-react';

export function PersonaBadge({ personaId, className }: { personaId: string, className?: string }) {
  const isPremium = defaultPersonaLimits.premium.personas.includes(personaId as any);

  return (
    <Badge 
      variant={isPremium ? "default" : "secondary"}
      className={`
        ${className} 
        text-xs
        px-2.5 
        h-6
        flex 
        items-center 
        gap-1
        rounded-full
        font-medium
        ${isPremium 
          ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500 text-white shadow-sm' 
          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
        }
      `}
    >
      {isPremium && <Sparkles className="h-3 w-3" />}
      {isPremium ? 'PRO' : 'FREE'}
    </Badge>
  );
} 