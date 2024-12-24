"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CancelPage = () => {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    try {
      const countdown = setInterval(() => {
        setSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      const redirectTimer = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => {
        clearTimeout(redirectTimer);
        clearInterval(countdown);
      };
    } catch (error) {
      console.error("Error in redirect setup:", error);
      // Fallback direct navigation
      window.location.href = "/";
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
      <p className="text-gray-600">
        Redirecting to home page in {secondsLeft} seconds...
      </p>
    </div>
  );
};

export default CancelPage;
