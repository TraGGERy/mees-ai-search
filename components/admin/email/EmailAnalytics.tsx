"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Mock data - replace with actual data from your API
const mockEmailStats = {
  totalSent: 15000,
  totalOpens: 8250,
  totalClicks: 3000,
  bounceRate: 0.5,
  unsubscribeRate: 0.2,
};

const mockTimelineData = [
  { date: "2024-03-01", sent: 1000, opens: 600, clicks: 200 },
  { date: "2024-03-02", sent: 1200, opens: 700, clicks: 250 },
  { date: "2024-03-03", sent: 800, opens: 500, clicks: 180 },
  { date: "2024-03-04", sent: 1500, opens: 900, clicks: 400 },
  { date: "2024-03-05", sent: 1100, opens: 650, clicks: 220 },
];

const mockCampaignPerformance = [
  {
    name: "Feature Launch",
    sent: 5000,
    opens: 3000,
    clicks: 1200,
    openRate: 60,
    clickRate: 24,
  },
  {
    name: "Weekly Newsletter",
    sent: 4000,
    opens: 2400,
    clicks: 800,
    openRate: 60,
    clickRate: 20,
  },
  {
    name: "Product Update",
    sent: 3000,
    opens: 1500,
    clicks: 600,
    openRate: 50,
    clickRate: 20,
  },
];

export function EmailAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Email Performance</h2>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockEmailStats.totalSent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((mockEmailStats.totalOpens / mockEmailStats.totalSent) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +5% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((mockEmailStats.totalClicks / mockEmailStats.totalSent) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +3% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockEmailStats.bounceRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              -0.2% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Activity Timeline</CardTitle>
          <CardDescription>
            Track email engagement over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTimelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="#8884d8"
                  name="Sent"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="opens"
                  stroke="#82ca9d"
                  name="Opens"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#ffc658"
                  name="Clicks"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>
            Compare performance across different campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCampaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="openRate" name="Open Rate %" fill="#8884d8" />
                <Bar dataKey="clickRate" name="Click Rate %" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 