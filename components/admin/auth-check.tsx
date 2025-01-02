'use client';

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export function AdminAuthCheck({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  
  if (!user || !user.emailAddresses.some(email => email.emailAddress.endsWith('@yourdomain.com'))) {
    redirect('/');
  }

  return <>{children}</>;
} 