"use client";
import { useState } from "react";
import AdminChatsPage from "./chats/page";
import { EmailDashboard } from "@/components/admin/email/EmailDashboard";

export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"chats" | "email">("chats");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "tashaverah" && password === "tragger0824!%") {
      setLoggedIn(true);
      setError("");
    } else {
      setError("Invalid username or password");
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-purple-100 to-blue-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 backdrop-blur-md">
          <div className="flex flex-col items-center mb-4">
            <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-3 rounded-full shadow-lg mb-2">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="url(#paint0_linear_1_2)"/>
                <path d="M8 12L11 15L16 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366F1"/>
                    <stop offset="1" stopColor="#A21CAF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white tracking-tight">Admin Login</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Access the admin dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-purple-600 dark:focus:border-purple-600 text-gray-900 dark:text-white transition"
                autoComplete="username"
                required
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-purple-600 dark:focus:border-purple-600 text-gray-900 dark:text-white transition"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-purple-600"
            >
              Login
            </button>
          </form>
        </div>
        <footer className="mt-8 text-xs text-gray-400 dark:text-gray-600 text-center select-none">
          &copy; {new Date().getFullYear()} Mees AI Admin. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-blue-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container mx-auto py-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage chats, emails, and more from one place.
            </p>
          </div>
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 mb-6">
            <button
              className={`px-6 py-2 font-semibold rounded-t-lg focus:outline-none transition-all duration-150 ${tab === "chats" ? "bg-white dark:bg-gray-900 border-x border-t border-b-0 border-gray-200 dark:border-gray-800 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
              onClick={() => setTab("chats")}
              aria-selected={tab === "chats"}
              aria-controls="chats-panel"
              role="tab"
            >
              Chats
            </button>
            <button
              className={`px-6 py-2 font-semibold rounded-t-lg focus:outline-none transition-all duration-150 ${tab === "email" ? "bg-white dark:bg-gray-900 border-x border-t border-b-0 border-gray-200 dark:border-gray-800 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
              onClick={() => setTab("email")}
              aria-selected={tab === "email"}
              aria-controls="email-panel"
              role="tab"
            >
              Email
            </button>
          </div>
          {/* Tab Panels */}
          <div id="chats-panel" role="tabpanel" hidden={tab !== "chats"}>
            {tab === "chats" && <AdminChatsPage />}
          </div>
          <div id="email-panel" role="tabpanel" hidden={tab !== "email"}>
            {tab === "email" && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 