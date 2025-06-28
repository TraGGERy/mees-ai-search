
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-3xl font-bold">You are Offline</h1>
        
        <p className="text-lg text-muted-foreground">
          It looks like you are not connected to the internet. 
          Some features may be limited while offline.
        </p>
        
        <div className="flex flex-col space-y-4">
          <Link href="/" passHref>
            <Button className="w-full">Go to Home Page</Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}