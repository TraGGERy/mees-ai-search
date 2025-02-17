// pages/success.tsx (or any other file)
"use client";  // Mark the component as client-side only

import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CanceledPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-lg text-center space-y-4">
        <XCircle className="w-16 h-16 mx-auto text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Payment Canceled</h1>
        <p className="text-gray-600">
          Your payment was canceled. No charges were made.
        </p>
        <Button 
          onClick={() => router.push('/settings')}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}
