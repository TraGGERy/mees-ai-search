import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  // Initialize with null to avoid hydration mismatch
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0)
  
  // Multilingual greetings
  const greetings = [
    { language: 'English', text: 'Hi! Search or ask anything here.' },
    { language: 'Chinese', text: '你好！在这里搜索或提问。' },
    { language: 'Spanish', text: '¡Hola! Busca o pregunta cualquier cosa aquí.' },
    { language: 'Korean', text: '안녕하세요! 여기에서 검색하거나 질문하세요.' }
  ];
  
  useEffect(() => {
    // Set time immediately on client-side to avoid hydration mismatch
    setCurrentTime(new Date());
    
    // Update time every minute
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Cycle through greetings every 3 seconds
    const greetingTimer = setInterval(() => {
      setCurrentGreetingIndex(prevIndex => 
        prevIndex === greetings.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    
    return () => {
      clearInterval(timeTimer);
      clearInterval(greetingTimer);
    };
  }, [greetings.length]);
  
  // Format date and time only on client-side after initial render
  const formattedTime = currentTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
  const formattedDate = currentTime?.toLocaleDateString([], { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) || '';
  
  // Example questions
  const exampleQuestions = [
    "What's the weather like today?",
    "How do I make pasta from scratch?",
  ];

  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-4 rounded-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{formattedTime}</h2>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium min-h-[28px] transition-opacity duration-300">
              {greetings[currentGreetingIndex].text}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {greetings[currentGreetingIndex].language}
            </p>
          </div>
          
        </div>
      </div>
    </div>
  )
}
