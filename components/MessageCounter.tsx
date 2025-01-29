interface MessageCounterProps {
  remainingMessages: number;
  isPremium: boolean;
}

export function MessageCounter({ remainingMessages, isPremium }: MessageCounterProps) {
  return (
    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between">
      <span>
        {remainingMessages} messages remaining today
      </span>
      {!isPremium && (
        <span className="text-xs text-purple-500">
          Upgrade for unlimited access
        </span>
      )}
    </div>
  );
} 