"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { db } from "@/db/db";
import { subscribedUsers, userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Define TypeScript interfaces
interface DatabaseOperationState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface SubscribedUser {
  userId: string;
  type: string;
  subscriptionStatus: string | null;
  currentPlan: string | null;
  nextInvoiceDate: Date | null;
  InvoicePdfUrl: string | null;
  email: string;
}

const Success = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isEmailMatched, setIsEmailMatched] = useState<boolean | null>(null);
  const [paymentEmail, setPaymentEmail] = useState<string>("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [dbState, setDbState] = useState<DatabaseOperationState>({
    loading: false,
    error: null,
    success: false,
  });

  const handlePaymentSuccess = async (emailToVerify: string) => {
    console.log("Attempting verification for email:", emailToVerify);

    setDbState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToVerify,
          userId: user?.id,
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        if (response.status === 404) {
          setShowEmailForm(true);
        }
        throw new Error(data.error || 'Failed to verify payment');
      }

      setIsEmailMatched(true);
      setDbState(prev => ({ ...prev, loading: false, success: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error during payment processing:", errorMessage);
      setIsEmailMatched(false);
      setDbState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  // Handle database operations
  useEffect(() => {
    let mounted = true;

    if (isLoaded && !dbState.success && user?.primaryEmailAddress?.emailAddress) {
      handlePaymentSuccess(user.primaryEmailAddress.emailAddress);
    }

    return () => { mounted = false; };
  }, [isLoaded, user, dbState.success]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentEmail) {
      handlePaymentSuccess(paymentEmail);
    }
  };

  // Handle redirect after successful operation
  useEffect(() => {
    if (isEmailMatched && dbState.success) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isEmailMatched, dbState.success, router]);

  // Loading state
  if (!isLoaded || dbState.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="loading-spinner" />
        <p className="mt-4">
          {!isLoaded ? "Loading user data..." : "Verifying payment..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
      
      {showEmailForm ? (
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="mb-4 text-yellow-600 dark:text-yellow-400">
            Please confirm the email address used for payment
          </p>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input
              type="email"
              value={paymentEmail}
              onChange={(e) => setPaymentEmail(e.target.value)}
              placeholder="Enter payment email"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Verify Email
            </button>
          </form>
        </div>
      ) : (
        <>
          {dbState.success && <p className="text-green-600">Redirecting to home page...</p>}
          {dbState.error ? (
            <div className="text-red-600 mb-4">
              <p>Error: {dbState.error}</p>
              <button
                onClick={() => setDbState(prev => ({ ...prev, success: false }))}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : null}

          {isEmailMatched === null ? (
            <p>Checking email match...</p>
          ) : isEmailMatched ? (
            <div className="text-green-600">
              <p>Your email is successfully matched with your payment!</p>
            </div>
          ) : (
            <div className="text-red-600">
              <p>Your email does not match the one used for payment.</p>
              <p>Please contact support for assistance.</p>
            </div>
          )}

          {user && (
            <div className="mt-4">
              <p>Welcome, {user.firstName}!</p>
              <p>Email: {user.primaryEmailAddress?.emailAddress?.replace(/(?<=.{3}).(?=.*@)/g, '*')}</p>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #6b46c1;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Success;
