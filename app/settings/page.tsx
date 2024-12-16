"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Settings, User, CreditCard, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/setui/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/setui/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/setui/ui/select";
import { Switch } from "@/components/setui/ui/switch";
import { Label } from "@/components/setui/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/setui/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { currentUser } from '@clerk/nextjs/server';
import { SignInButton, SignOutButton, useAuth , useUser} from '@clerk/nextjs'
import { db } from "@/db/db";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useRouter } from 'next/navigation'; // For redirection
import { chatNeon } from "@/db/schema";


export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const { user } = useUser(); // Fetches the current Clerk user
  const [email, setEmail] = useState<string | null>(null); // For email from the database
  const [subscriptionData, setSubscriptionData] = useState<{
    currentPlan: string;
    subscriptionStatus: string;
    nextInvoiceDate: string | null;
    invoicePdfUrl: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { signOut } = useAuth()

  useEffect(() => {
    if (user) {
      const fetchEmail = async () => {
        try {
          const clerkUserId = user.id;

          // Query the database for the user's email
          const subscription = await db
            .select({ email: userSubscriptions.email })
            .from(userSubscriptions)
            .where(eq(userSubscriptions.clerkUserId , clerkUserId))
            .limit(1);

          setEmail(subscription[0]?.email || "Email not found");
        } catch (error) {
          console.error("Error fetching user email:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchEmail();
    }
  }, [user]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) return;

      try {
        // Fetch data directly from the database
        const subscription = await db
          .select({
            currentPlan: userSubscriptions.currentPlan,
            subscriptionStatus: userSubscriptions.subscriptionStatus,
            nextInvoiceDate: userSubscriptions.nextInvoiceDate,
            invoicePdfUrl: userSubscriptions.invoicePdfUrl,
          })
          .from(userSubscriptions)
          .where(eq(userSubscriptions.clerkUserId, user.id))
          .limit(1);

        if (subscription.length > 0) {
          const {
            currentPlan,
            subscriptionStatus,
            nextInvoiceDate,
            invoicePdfUrl,
          } = subscription[0];

          setSubscriptionData({
            currentPlan: currentPlan || "No Plan",
            subscriptionStatus: subscriptionStatus || "Inactive",
            nextInvoiceDate: nextInvoiceDate ? nextInvoiceDate.toISOString() : null,
            invoicePdfUrl: invoicePdfUrl || null,
          });
        } else {
          setSubscriptionData({
            currentPlan: "No Plan",
            subscriptionStatus: "Inactive",
            nextInvoiceDate: null,
            invoicePdfUrl: null,
          });
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        setSubscriptionData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  const handleDownloadInvoice = () => {
    if (subscriptionData?.invoicePdfUrl) {
      window.open(subscriptionData.invoicePdfUrl, "_blank");
    } else {
      alert("Invoice URL is not available.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/'); // Redirect to the main page
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };


  const handleDeleteAccount = async () => {
    if (!user?.id) {
      console.error('No user ID found');
      return;
    }

    try {
      // Delete user data from the database
      await db.delete(userSubscriptions).where(eq(userSubscriptions.clerkUserId, user.id));
      await db.delete(chatNeon).where(eq(chatNeon.userId, user.id));

      // Log out and redirect to the main page
      await signOut();
      router.push('/'); // Redirect to the main page after logout
      console.log('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

 

  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-8">
        <h1></h1>
        <br></br>
        <br></br>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-4 h-auto">
          <TabsTrigger value="general" className="flex items-center gap-2 py-3">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="pro" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Mees AI Pro
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your general preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Appearance</Label>
                  <p className="text-sm text-muted-foreground">
                    Customize how Mees AI looks on your device.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="theme-toggle">Dark mode</Label>
                  <Switch
                    id="theme-toggle"
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred language.
                  </p>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View and manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={`${user?.firstName} ${user?.lastName}'s profile`}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{`${user?.firstName || "John"} ${
                  user?.lastName || "Doe"
                }`}</h3>
                <p className="text-sm text-muted-foreground">{email || "john.doe@example.com"}</p>
              </div>
            </div>

            <Alert>
              <AlertTitle>Email Verified</AlertTitle>
              <AlertDescription>
                Your email address has been verified, and your account is active.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

       
    <TabsContent value="pro">
      <Card>
        <CardHeader>
          <CardTitle>Mees AI Pro Subscription</CardTitle>
          <CardDescription>Manage your subscription and billing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold">Current Plan</h3>
                <p className="text-sm text-muted-foreground">
                  {subscriptionData?.currentPlan || "No Plan Selected"}
                </p>
              </div>
              <Button variant="outline" onClick={handleDownloadInvoice}>
                Download Invoice
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Status</span>
                <span
                  className={
                    subscriptionData?.subscriptionStatus === "paid"
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {subscriptionData?.subscriptionStatus || "Inactive"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Next billing date</span>
                <span>
                  {subscriptionData?.nextInvoiceDate
                    ? new Date(subscriptionData.nextInvoiceDate).toLocaleDateString()
                    : "Not Available"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Amount</span>
                <span>$29.99/month</span> {/* Hardcoded for now */}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>

    <TabsContent value="system">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Manage your system preferences and account actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Log Out Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full bg-purple-900 text-white-900">
                  Log Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Log Out</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to log out?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirm Log Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete Account Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. It will permanently delete your account and remove
                    your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirm Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

      </Tabs>
    </div>
  );
}

