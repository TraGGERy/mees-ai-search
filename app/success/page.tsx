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
  const [dbState, setDbState] = useState<DatabaseOperationState>({
    loading: false,
    error: null,
    success: false,
  });

  // Handle database operations
  useEffect(() => {
    let mounted = true;

    const handlePaymentSuccess = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const email = user.primaryEmailAddress.emailAddress;
      console.log("Attempting verification for email:", email); // Debug log

      setDbState(prev => ({ ...prev, loading: true, error: null }));

      try {
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            const response = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                userId: user.id,
              }),
            });

            const data = await response.json();
            console.log("API Response:", data); // Debug log

            if (!response.ok) {
              throw new Error(data.error || 'Failed to verify payment');
            }

            if (mounted) {
              setIsEmailMatched(true);
              setDbState(prev => ({ ...prev, loading: false, success: true }));
            }
            break;

          } catch (error) {
            console.error(`Attempt ${retryCount + 1} failed:`, error); // Debug log
            retryCount++;
            if (retryCount === maxRetries) {
              throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      } catch (error) {
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("Final error during payment processing:", errorMessage);
          setIsEmailMatched(false);
          setDbState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage
          }));
        }
      }
    };

    if (isLoaded && !dbState.success) {
      handlePaymentSuccess();
    }

    return () => {
      mounted = false;
    };
  }, [isLoaded, user, dbState.success]);

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
      
      {dbState.success ? (
        <p className="text-green-600">Redirecting to home page...</p>
      ) : null}

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
