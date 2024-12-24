"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated');
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  return null;
} 