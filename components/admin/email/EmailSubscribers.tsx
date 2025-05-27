"use client"

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Subscriber = {
  id: string;
  email: string;
  name: string;
  subscribed: boolean;
  preferences: {
    newFeatures: boolean;
    productUpdates: boolean;
    promotions: boolean;
    systemNotifications: boolean;
  };
  lastEmailSent?: string;
  lastEmailOpened?: string;
  dateSubscribed: string;
};

export function EmailSubscribers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubscribers = useCallback(async () => {
    try {
      const response = await fetch("/api/email/subscribers");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch subscribers");
      }
      const data = await response.json();
      setSubscribers(data);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch subscribers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const filteredSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Email", "Name", "Status", "Subscribed Date"];
    const csvContent = [
      headers.join(","),
      ...filteredSubscribers.map((sub) => [
        sub.email,
        sub.name,
        sub.subscribed ? "Subscribed" : "Unsubscribed",
        new Date(sub.dateSubscribed).toLocaleDateString(),
      ].join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleUnsubscribe = async (subscriberId: string) => {
    try {
      // TODO: Implement unsubscribe API call
      setSubscribers(
        subscribers.map((sub) =>
          sub.id === subscriberId ? { ...sub, subscribed: false } : sub
        )
      );
      toast({
        title: "Success",
        description: "User unsubscribed successfully",
      });
    } catch (error) {
      console.error("Error unsubscribing user:", error);
      toast({
        title: "Error",
        description: "Failed to unsubscribe user",
        variant: "destructive",
      });
    }
  };

  const handleResubscribe = async (subscriberId: string) => {
    try {
      // TODO: Implement resubscribe API call
      setSubscribers(
        subscribers.map((sub) =>
          sub.id === subscriberId ? { ...sub, subscribed: true } : sub
        )
      );
      toast({
        title: "Success",
        description: "User resubscribed successfully",
      });
    } catch (error) {
      console.error("Error resubscribing user:", error);
      toast({
        title: "Error",
        description: "Failed to resubscribe user",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
          <Input
            placeholder="Search subscribers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-[300px]"
          />
          <p className="text-sm text-muted-foreground">
            {filteredSubscribers.length} subscribers found
          </p>
        </div>
        <Button onClick={handleExportCSV} className="w-full md:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[200px]">Preferences</TableHead>
              <TableHead className="min-w-[120px]">Last Email</TableHead>
              <TableHead className="min-w-[120px]">Subscribed Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="font-medium">{subscriber.email}</TableCell>
                <TableCell>{subscriber.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={subscriber.subscribed ? "default" : "secondary"}
                  >
                    {subscriber.subscribed ? "Subscribed" : "Unsubscribed"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {subscriber.preferences.newFeatures && (
                      <Badge variant="outline">Features</Badge>
                    )}
                    {subscriber.preferences.productUpdates && (
                      <Badge variant="outline">Updates</Badge>
                    )}
                    {subscriber.preferences.promotions && (
                      <Badge variant="outline">Promos</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {subscriber.lastEmailSent
                    ? new Date(subscriber.lastEmailSent).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {new Date(subscriber.dateSubscribed).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {subscriber.subscribed ? (
                        <DropdownMenuItem
                          onClick={() => handleUnsubscribe(subscriber.id)}
                        >
                          Unsubscribe
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleResubscribe(subscriber.id)}
                        >
                          Resubscribe
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>View History</DropdownMenuItem>
                      <DropdownMenuItem>Edit Preferences</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}