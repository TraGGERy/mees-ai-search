"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams ? searchParams.get('session_id') : null;
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
        <p>Loading...</p>
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
