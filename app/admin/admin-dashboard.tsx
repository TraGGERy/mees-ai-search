"use client";

import { type ReactNode, useState, useEffect } from "react";
import { db } from "@/db/db";
import {
  articles,
  subscribedUsers,
  userSubscriptions,
  subscriptionEvents,
  chatNeon,
  comments,
  userTries,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/updic/ui/table";
import { Loader2, Trash2, Edit2, Plus, Download, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/updic/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface TableConfig {
  name: string;
  columns: string[];
  dateColumns: string[];
  truncateColumns: string[];
  primaryKey: string;
}

const TABLE_CONFIG: Record<string, TableConfig> = {
  articles: {
    name: "Articles",
    columns: ['id', 'title', 'source', 'category', 'date', 'url', 'imageUrl', 'summary'],
    dateColumns: ['date'],
    truncateColumns: ['summary', 'url', 'imageUrl'],
    primaryKey: 'id'
  },
  subscribedUsers: {
    name: "Subscribed Users",
    columns: ['id', 'userId', 'email', 'type', 'subscriptionStatus', 'currentPlan', 'nextInvoiceDate', 'InvoicePdfUrl'],
    dateColumns: ['nextInvoiceDate'],
    truncateColumns: ['InvoicePdfUrl'],
    primaryKey: 'userId'
  },
  userSubscriptions: {
    name: "User Subscriptions",
    columns: ['id', 'clerkUserId', 'stripeUserId', 'email', 'type', 'subscriptionStatus', 'currentPlan', 'nextInvoiceDate', 'invoicePdfUrl'],
    dateColumns: ['nextInvoiceDate'],
    truncateColumns: ['invoicePdfUrl'],
    primaryKey: 'clerkUserId'
  },
  subscriptionEvents: {
    name: "Subscription Events",
    columns: ['id', 'eventId', 'email', 'eventPayload'],
    dateColumns: [],
    truncateColumns: ['eventPayload'],
    primaryKey: 'eventId'
  },
  chatNeon: {
    name: "Chat History",
    columns: ['id', 'chatId', 'userId', 'title', 'createdAt', 'path', 'messages'],
    dateColumns: ['createdAt'],
    truncateColumns: ['messages', 'path'],
    primaryKey: 'chatId'
  },
  comments: {
    name: "Comments",
    columns: ['id', 'searchId', 'userId', 'commentText', 'createdAt'],
    dateColumns: ['createdAt'],
    truncateColumns: ['commentText'],
    primaryKey: 'id'
  },
  userTries: {
    name: "User Tries",
    columns: ['userId', 'dailyTriesRemaining', 'lastResetDate'],
    dateColumns: ['lastResetDate'],
    truncateColumns: [],
    primaryKey: 'userId'
  }
};

export default function AdminPage(): ReactNode {
  const [activeTable, setActiveTable] = useState<keyof typeof TABLE_CONFIG>("articles");
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const table = getTableByName(activeTable);
      if (!table) throw new Error("Invalid table");

      let query = db.select().from(table);
      const result = await query;
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTable]);

  const getTableByName = (name: keyof typeof TABLE_CONFIG) => {
    switch (name) {
      case 'articles':
        return articles;
      case 'subscribedUsers':
        return subscribedUsers;
      case 'userSubscriptions':
        return userSubscriptions;
      case 'subscriptionEvents':
        return subscriptionEvents;
      case 'chatNeon':
        return chatNeon;
      case 'comments':
        return comments;
      case 'userTries':
        return userTries;
      default:
        throw new Error(`Invalid table name: ${name}`);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      switch (activeTable) {
        case 'userTries':
          await db.delete(userTries).where(eq(userTries.userId, String(id)));
          break;
        case 'subscribedUsers':
          await db.delete(subscribedUsers).where(eq(subscribedUsers.userId, String(id)));
          break;
        case 'userSubscriptions':
          await db.delete(userSubscriptions).where(eq(userSubscriptions.clerkUserId, String(id)));
          break;
        case 'subscriptionEvents':
          await db.delete(subscriptionEvents).where(eq(subscriptionEvents.eventId, String(id)));
          break;
        case 'chatNeon':
          await db.delete(chatNeon).where(eq(chatNeon.chatId, String(id)));
          break;
        case 'comments':
          await db.delete(comments).where(eq(comments.id, Number(id)));
          break;
        case 'articles':
          await db.delete(articles).where(eq(articles.id, Number(id)));
          break;
      }
      toast.success("Record deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  const handleExport = () => {
    try {
      const filteredData = data.filter(record =>
        Object.values(record).some(value =>
          String(value || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      const csv = [
        TABLE_CONFIG[activeTable].columns.join(','),
        ...filteredData.map(record =>
          TABLE_CONFIG[activeTable].columns.map(col => {
            const value = record[col];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
            return String(value).replace(/,/g, ';');
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTable}-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const filteredData = data.filter(record =>
    Object.values(record).some(value =>
      String(value || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md pl-8"
        />
      </div>

      <Tabs value={activeTable} onValueChange={(v) => setActiveTable(v as keyof typeof TABLE_CONFIG)}>
        <TabsList className="grid grid-cols-7 mb-4">
          {Object.entries(TABLE_CONFIG).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="text-sm">
              {config.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {TABLE_CONFIG[activeTable].columns.map((column) => (
                      <TableHead key={column} className="whitespace-nowrap">
                        {column.charAt(0).toUpperCase() + column.slice(1)}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record) => (
                    <TableRow key={record[TABLE_CONFIG[activeTable].primaryKey]}>
                      {TABLE_CONFIG[activeTable].columns.map((column) => (
                        <TableCell 
                          key={column} 
                          className={`max-w-[200px] ${
                            TABLE_CONFIG[activeTable].truncateColumns.includes(column) 
                              ? 'truncate' 
                              : ''
                          }`}
                        >
                          {formatCellContent(record[column], column, TABLE_CONFIG[activeTable])}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRecord(record)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(record[TABLE_CONFIG[activeTable].primaryKey])}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No records found
                </div>
              )}
            </div>
          )}
        </Card>
      </Tabs>
    </div>
  );
}

function formatCellContent(value: any, column: string, tableConfig: TableConfig) {
  if (value === null || value === undefined) return '-';
  
  if (tableConfig.dateColumns.includes(column)) {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  }
  
  if (tableConfig.truncateColumns.includes(column)) {
    const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return strValue.length > 50 ? strValue.slice(0, 50) + '...' : strValue;
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '[Complex Object]';
    }
  }
  
  return String(value);
}