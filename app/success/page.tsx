"use client"; // Client-side only component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js Router hook
import { useUser } from "@clerk/nextjs"; // Import Clerk's useUser hook
import { db } from "@/db/db"; // Your database instance
import { subscribedUsers } from "@/db/schema"; // Your subscribedUsers schema
import { userSubscriptions } from "@/db/schema"; // Your userSubscriptions schema
import { eq } from "drizzle-orm"; // For querying the database

const Success = () => {
  const { user, isLoaded } = useUser(); // Get the current Clerk user and loading state
  const router = useRouter();
  const [isEmailMatched, setIsEmailMatched] = useState<boolean | null>(null); // State to track email match status

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!user || !user.primaryEmailAddress) return; // If no user or no email, exit

      const email = user.primaryEmailAddress.emailAddress; // Get the user's email

      try {
        // Query the subscribedUsers table for a user with the same email
        const existingUser = await db
          .select()
          .from(subscribedUsers)
          .where(eq(subscribedUsers.email, email)) // Use the correct email field
          .limit(1);

        if (existingUser.length > 0) {
          // If the email exists in subscribedUsers, insert the data into userSubscriptions
          const {
            userId,
            type,
            subscriptionStatus,
            currentPlan,
            nextInvoiceDate,
            InvoicePdfUrl,
          } = existingUser[0]; // Extract data from existing user

          // Insert this data into the userSubscriptions table
          await db.insert(userSubscriptions).values({
            clerkUserId: user.id, // Store Clerk user ID
            stripeUserId: userId, // Store Stripe user ID
            email: email, // Store email
            type: type || "payment_success", // Event type (default to "payment_success")
            subscriptionStatus: subscriptionStatus || null,
            currentPlan: currentPlan || null,
            nextInvoiceDate: nextInvoiceDate || null,
            invoicePdfUrl: InvoicePdfUrl || null,
          });

          setIsEmailMatched(true); // Email matched, set success
        } else {
          setIsEmailMatched(false); // Email does not match any records
        }
      } catch (error) {
        console.error("Error during payment processing:", error);
        setIsEmailMatched(false); // Handle errors by setting status to false
      }
    };

    if (isLoaded) {
      handlePaymentSuccess();
    }
  }, [isLoaded, user]); // Re-run when the user data is loaded

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/"); // Redirect to home page after 3 seconds
    }, 5000);

    return () => clearTimeout(timer); // Cleanup on component unmount
  }, [router]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="loading-spinner" />
      </div>
    ); // Show loading state if user data is not loaded yet
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1>Payment Successful!</h1>
      <p>Redirecting to home page...</p>

      {isEmailMatched === null ? (
        <p>Checking email match...</p>
      ) : isEmailMatched ? (
        <div>
          <p>Your email is successfully matched with your payment!</p>
        </div>
      ) : (
        <div>
          <p>Your email does not match the one used for payment. Please contact the admin to fix this.</p>
        </div>
      )}

      {user && (
        <div>
          <p>Welcome, {user.firstName}!</p>
          <p>Your email: {user.primaryEmailAddress?.emailAddress}</p> {/* Show user's email */}
        </div>
      )}
    </div>
  );
};

export default Success;

// Add CSS for the Loading Spinner
<style jsx>{`
  /* Loading Spinner CSS */
  .loading-spinner {
    border: 4px solid #f3f3f3; /* Light gray background */
    border-top: 4px solid #6b46c1; /* Purple color */
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 2s linear infinite;
  }

  /* Keyframes for spinning animation */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`}</style>
