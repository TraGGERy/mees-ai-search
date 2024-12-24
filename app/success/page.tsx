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

      setDbState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Query the subscribedUsers table
        const existingUser = await db
          .select()
          .from(subscribedUsers)
          .where(eq(subscribedUsers.email, email))
          .limit(1);

        if (!mounted) return;

        if (existingUser.length > 0) {
          const userData = existingUser[0] as SubscribedUser;

          // Insert into userSubscriptions with retry mechanism
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              await db.insert(userSubscriptions).values({
                clerkUserId: user.id,
                stripeUserId: userData.userId,
                email: email,
                type: userData.type || "payment_success",
                subscriptionStatus: userData.subscriptionStatus,
                currentPlan: userData.currentPlan,
                nextInvoiceDate: userData.nextInvoiceDate,
                invoicePdfUrl: userData.InvoicePdfUrl,
              });
              
              if (mounted) {
                setIsEmailMatched(true);
                setDbState(prev => ({ ...prev, loading: false, success: true }));
              }
              break; // Success, exit retry loop
              
            } catch (insertError) {
              retryCount++;
              if (retryCount === maxRetries) {
                throw insertError; // Throw error after max retries
              }
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        } else {
          if (mounted) {
            setIsEmailMatched(false);
            setDbState(prev => ({
              ...prev,
              loading: false,
              error: "No matching email found"
            }));
          }
        }
      } catch (error) {
        if (mounted) {
          console.error("Error during payment processing:", error);
          setIsEmailMatched(false);
          setDbState(prev => ({
            ...prev,
            loading: false,
            error: "Failed to process payment verification"
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
