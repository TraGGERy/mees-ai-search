"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    // Verify the session on the server side
    const verifySession = async () => {
      try {
        const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setStatus('success');
          // Add 3 second delay before redirect
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        router.push('/');
      }
    };

    verifySession();
  }, [sessionId, router]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg text-gray-600 font-medium">Processing your payment...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Thank you for your purchase!</h1>
      <p className="text-xl mb-4">Your payment was successful.</p>
      <p className="text-gray-600">
        You will receive an email confirmation shortly.
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg text-gray-600 font-medium">Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
