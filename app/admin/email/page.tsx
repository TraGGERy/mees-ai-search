import { Metadata } from "next";
import { EmailDashboard } from "@/components/admin/email/EmailDashboard";

export const metadata: Metadata = {
  title: "Email Management | Admin Dashboard",
  description: "Manage email communications and campaigns",
};

export default function EmailAdminPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">
            Manage email communications, campaigns, and templates
          </p>
        </div>
        <EmailDashboard />
      </div>
    </div>
  );
} 