"use client";

import { useState } from "react";
import { toast } from "sonner"; // Assuming Sonner is installed for toast notifications
import { db } from "@/db/db";
import { articles } from "@/db/schema";

const AUTH_KEY = "Catherine"; // The key required for authentication

export default function ArticleForm() {
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    url: "",
    imageUrl: "",
    source: "",
    category: "",
    date: "",
    key: "", // Adding a key field for authentication
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.key !== AUTH_KEY) {
      toast.error("Invalid key. You are not authorized to save this article.");
      return;
    }

    setIsSaving(true);

    try {
      // Save the article to the database
      await db.insert(articles).values({
        title: formData.title,
        summary: formData.summary,
        url: formData.url,
        imageUrl: formData.imageUrl || null,
        source: formData.source,
        category: formData.category || null,
        date: formData.date ? new Date(formData.date) : undefined, // Use provided date or default
      });

      toast.success("Article has been saved!");

      // Clear the form
      setFormData({
        title: "",
        summary: "",
        url: "",
        imageUrl: "",
        source: "",
        category: "",
        date: "",
        key: "",
      });
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Failed to save the article. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-lg pt-24">
      <h1 className="text-2xl font-bold mb-6">Add a New Article</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
            Image URL (optional)
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">
            Source
          </label>
          <input
            type="text"
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category (optional)
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date (optional)
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="key" className="block text-sm font-medium text-gray-700">
            Authorization Key
          </label>
          <input
            type="password"
            id="key"
            name="key"
            value={formData.key}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm ${
            isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {isSaving ? "Saving..." : "Save Article"}
        </button>
      </form>
    </div>
  );
}
