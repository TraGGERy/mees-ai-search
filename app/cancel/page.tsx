// pages/success.tsx (or any other file)
"use client";  // Mark the component as client-side only

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // New hook from next/navigation

const Success = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/"); // Redirect to home after 3 seconds
    }, 3000);

    return () => clearTimeout(timer); // Cleanup on component unmount
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1>OOPS Payment Cancelled!</h1>
      <p>Redirecting to home page...</p>
    </div>
  );
};

export default Success;
