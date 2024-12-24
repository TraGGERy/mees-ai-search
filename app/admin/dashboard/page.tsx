"use client";

import { AdminAuthCheck } from "@/components/admin/auth-check";
import AdminPage from "../admin-dashboard"; // Your existing admin component with all the table logic

export default function DashboardPage() {
  return (
    <AdminAuthCheck>
      <AdminPage />
    </AdminAuthCheck>
  );
} 