"use client";

import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject line is required"),
  content: z.string().min(1, "Content is required"),
});

type Template = {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: "feature" | "newsletter" | "promotion";
  lastUsed?: string;
  timesUsed: number;
};

// Mock data - replace with actual data from your API
const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Feature Announcement",
    subject: "Exciting New Feature: {{featureName}}",
    content: "We're excited to announce {{featureName}}! {{featureDescription}}",
    type: "feature",
    lastUsed: "2024-03-15T10:00:00Z",
    timesUsed: 5,
  },
  {
    id: "2",
    name: "Weekly Newsletter",
    subject: "Your Weekly AI Search Update",
    content: "Here are this week's top updates: {{content}}",
    type: "newsletter",
    lastUsed: "2024-03-14T09:00:00Z",
    timesUsed: 12,
  },
];

export function EmailTemplates() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof templateSchema>) => {
    setIsLoading(true);
    try {
      // TODO: Implement template creation/update
      console.log("Saving template:", values);
      toast({
        title: "Success",
        description: "Template saved successfully",
      });
      form.reset();
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    form.reset({
      name: template.name,
      subject: template.subject,
      content: template.content,
    });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter template name" {...field} />
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
                <FormLabel>Subject Line</FormLabel>
                <FormControl>
                  <Input placeholder="Enter subject line" {...field} />
                </FormControl>
                <FormDescription>
                  Use {"{{featureName}}"} or {"{{content}}"} for dynamic content
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter email content"
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Use {"{{featureName}}"} or {"{{content}}"} for dynamic content
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading
                ? "Saving..."
                : selectedTemplate
                ? "Update Template"
                : "Create Template"}
            </Button>
            {selectedTemplate && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedTemplate(null);
                  form.reset();
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader className="flex-none">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">{template.subject}</CardDescription>
                </div>
                <Badge className="w-fit">{template.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <pre className="whitespace-pre-wrap text-sm overflow-x-auto">
                {template.content}
              </pre>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
              <div className="text-sm text-muted-foreground">
                Used {template.timesUsed} times
                {template.lastUsed &&
                  ` • Last used ${new Date(
                    template.lastUsed
                  ).toLocaleDateString()}`}
              </div>
              <Button variant="outline" onClick={() => handleEdit(template)} className="w-full sm:w-auto">
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 