"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Trash2, Pencil, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject is required"),
  template: z.string().min(1, "Template is required"),
  audience: z.string().min(1, "Audience is required"),
  scheduledFor: z.string().optional(),
  content: z.string().optional(),
});

type Campaign = {
  id: string;
  name: string;
  subject: string;
  template: string;
  audience: string;
  status: "draft" | "scheduled" | "sending" | "sent";
  content?: string;
  scheduledFor?: string;
  sentAt?: string;
  recipients: number;
  opens: number;
  clicks: number;
  bounceRate: number;
  createdAt: string;
  updatedAt: string;
};

export function EmailCampaigns() {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      subject: "",
      template: "",
      audience: "",
      scheduledFor: "",
      content: "",
    },
  });

  const editForm = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      subject: "",
      template: "",
      audience: "",
      scheduledFor: "",
      content: "",
    },
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (editingCampaign) {
      editForm.reset({
        name: editingCampaign.name,
        subject: editingCampaign.subject,
        template: editingCampaign.template,
        audience: editingCampaign.audience,
        scheduledFor: editingCampaign.scheduledFor || "",
        content: editingCampaign.content || "",
      });
    }
  }, [editingCampaign, editForm]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/email/campaigns");
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof campaignSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/email/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create campaign");
      }

      const newCampaign = await response.json();
      setCampaigns([...campaigns, newCampaign]);
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
      form.reset();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (values: z.infer<typeof campaignSchema>) => {
    if (!editingCampaign) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/email/campaigns", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingCampaign.id,
          ...values,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update campaign");
      }

      setCampaigns(
        campaigns.map((campaign) =>
          campaign.id === editingCampaign.id
            ? { ...campaign, ...values, updatedAt: new Date().toISOString() }
            : campaign
        )
      );

      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingCampaign(null);
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/email/campaigns?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete campaign");
      }

      setCampaigns(campaigns.filter(campaign => campaign.id !== id));
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const handleSend = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/email/campaigns/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to send campaign");
      }

      const result = await response.json();
      
      // Update the campaign in the local state
      setCampaigns(
        campaigns.map((campaign) =>
          campaign.id === id
            ? {
                ...campaign,
                status: "sent",
                sentAt: new Date().toISOString(),
                recipients: result.result.total,
                bounceRate: result.result.failed / result.result.total * 100,
              }
            : campaign
        )
      );

      toast({
        title: "Success",
        description: `Campaign sent successfully to ${result.result.total} recipients`,
      });
    } catch (error) {
      console.error("Error sending campaign:", error);
      toast({
        title: "Error",
        description: "Failed to send campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter campaign name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Template</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="feature-announcement">
                        Feature Announcement
                      </SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all-users">All Users</SelectItem>
                      <SelectItem value="subscribed-users">
                        Subscribed Users
                      </SelectItem>
                      <SelectItem value="active-users">Active Users</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule (Optional)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    Leave empty to send immediately
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Email Content (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter email content"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? "Creating..." : "Create Campaign"}
          </Button>
        </form>
      </Form>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[200px]">Subject</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[150px]">Schedule</TableHead>
              <TableHead className="min-w-[100px] text-right">Recipients</TableHead>
              <TableHead className="min-w-[100px] text-right">Opens</TableHead>
              <TableHead className="min-w-[100px] text-right">Clicks</TableHead>
              <TableHead className="w-[150px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.subject}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      campaign.status === "sent"
                        ? "success"
                        : campaign.status === "scheduled"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {campaign.scheduledFor
                    ? format(new Date(campaign.scheduledFor), "MMM d, yyyy h:mm a")
                    : campaign.sentAt
                    ? format(new Date(campaign.sentAt), "MMM d, yyyy h:mm a")
                    : "-"}
                </TableCell>
                <TableCell className="text-right">{campaign.recipients}</TableCell>
                <TableCell className="text-right">{campaign.opens}</TableCell>
                <TableCell className="text-right">{campaign.clicks}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Dialog
                      open={isEditDialogOpen && editingCampaign?.id === campaign.id}
                      onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) {
                          setEditingCampaign(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCampaign(campaign)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Campaign</DialogTitle>
                        </DialogHeader>
                        <Form {...editForm}>
                          <form
                            onSubmit={editForm.handleSubmit(handleEdit)}
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={editForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Campaign Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editForm.control}
                                name="subject"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Subject</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editForm.control}
                                name="template"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Template</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a template" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="feature-announcement">
                                          Feature Announcement
                                        </SelectItem>
                                        <SelectItem value="newsletter">
                                          Newsletter
                                        </SelectItem>
                                        <SelectItem value="promotion">
                                          Promotion
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editForm.control}
                                name="audience"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Target Audience</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select audience" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="all-users">
                                          All Users
                                        </SelectItem>
                                        <SelectItem value="subscribed-users">
                                          Subscribed Users
                                        </SelectItem>
                                        <SelectItem value="active-users">
                                          Active Users
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editForm.control}
                                name="scheduledFor"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Schedule (Optional)</FormLabel>
                                    <FormControl>
                                      <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Leave empty to send immediately
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={editForm.control}
                                name="content"
                                render={({ field }) => (
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>Email Content (Optional)</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        className="min-h-[100px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsEditDialogOpen(false);
                                  setEditingCampaign(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    {campaign.status !== "sent" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSend(campaign.id)}
                        disabled={isLoading}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 