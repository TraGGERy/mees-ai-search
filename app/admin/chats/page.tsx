"use client";
import { useState, useEffect } from "react";
import { getAllChats as getAllChatsAction, deleteChat } from "@/lib/actions/chat";

function ChatTable({ chats, onDelete, deletingId }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">Title</th>
            <th className="px-4 py-2 border-b">User ID</th>
            <th className="px-4 py-2 border-b">Created At</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chats.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8">No chats found.</td></tr>
          ) : (
            chats.map((chat) => (
              <tr key={chat.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-2 font-mono text-xs break-all max-w-xs">{chat.id}</td>
                <td className="px-4 py-2">{chat.title || "Untitled"}</td>
                <td className="px-4 py-2">{chat.userId}</td>
                <td className="px-4 py-2">{chat.createdAt ? new Date(chat.createdAt).toLocaleString() : "-"}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onDelete(chat.id)}
                    disabled={deletingId === chat.id}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50"
                    aria-label={`Delete chat ${chat.id}`}
                  >
                    {deletingId === chat.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminChatsPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "tashaverah" && password === "tragger0824!%") {
      setLoggedIn(true);
      setError("");
    } else {
      setError("Invalid username or password");
    }
  };

  useEffect(() => {
    if (loggedIn) {
      setLoading(true);
      setFetchError(null);
      getAllChatsAction(page, pageSize)
        .then((data) => {
          setChats(data.chats);
          setTotal(data.total);
          setLoading(false);
        })
        .catch((err) => {
          setFetchError("Failed to load chats. Please try again.");
          setLoading(false);
        });
    }
  }, [loggedIn, page, pageSize]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteChat(id);
      setChats((prev) => prev.filter((chat) => chat.id !== id));
      setTotal((prev) => prev - 1);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    setShowDeleteAllModal(false);
    setDeletingAll(true);
    try {
      for (const chat of chats) {
        await deleteChat(chat.id);
      }
      setChats([]);
      setTotal(0);
    } finally {
      setDeletingAll(false);
    }
  };

  const renderPagination = () => (
    <nav className="flex items-center justify-center gap-2 mt-4" aria-label="Pagination">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1 || loading}
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50"
        aria-label="Previous page"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          disabled={p === page || loading}
          className={`px-3 py-1 rounded font-semibold ${p === page ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"} disabled:opacity-50`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages || loading}
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50"
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );

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
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Access the admin chat dashboard</p>
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
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat Management</h1>
          <p className="text-muted-foreground">
            View and manage all user chats. You can delete individual chats or all chats.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setShowDeleteAllModal(true)}
            disabled={deletingAll || loading || chats.length === 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow disabled:opacity-50"
            aria-label="Delete all chats"
          >
            {deletingAll ? "Deleting All..." : "Delete All Chats"}
          </button>
        </div>
        {fetchError && <div className="text-red-500 text-center font-medium animate-pulse">{fetchError}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></span>
            <span className="text-gray-700 dark:text-gray-200">Loading chats...</span>
          </div>
        ) : (
          <ChatTable chats={chats} onDelete={handleDelete} deletingId={deletingId} />
        )}
        {renderPagination()}
      </div>
      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Delete All Chats</h2>
            <p className="mb-6">Are you sure you want to delete <span className="font-semibold">ALL</span> chats on this page? This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                disabled={deletingAll}
              >
                {deletingAll ? "Deleting..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 