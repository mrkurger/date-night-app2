"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Eye, Users, MessageCircle, Heart, TrendingUp, DollarSign } from "lucide-react"

// Mock data for analytics
const viewsData = [
  { date: "2023-05-01", views: 120, uniqueVisitors: 85, favorites: 12 },
  { date: "2023-05-02", views: 132, uniqueVisitors: 95, favorites: 15 },
  { date: "2023-05-03", views: 101, uniqueVisitors: 70, favorites: 8 },
  { date: "2023-05-04", views: 134, uniqueVisitors: 90, favorites: 14 },
  { date: "2023-05-05", views: 190, uniqueVisitors: 120, favorites: 25 },
  { date: "2023-05-06", views: 230, uniqueVisitors: 160, favorites: 30 },
  { date: "2023-05-07", views: 280, uniqueVisitors: 200, favorites: 35 },
  { date: "2023-05-08", views: 250, uniqueVisitors: 180, favorites: 28 },
  { date: "2023-05-09", views: 220, uniqueVisitors: 170, favorites: 22 },
  { date: "2023-05-10", views: 210, uniqueVisitors: 150, favorites: 20 },
  { date: "2023-05-11", views: 270, uniqueVisitors: 190, favorites: 32 },
  { date: "2023-05-12", views: 290, uniqueVisitors: 210, favorites: 38 },
  { date: "2023-05-13", views: 310, uniqueVisitors: 230, favorites: 42 },
  { date: "2023-05-14", views: 320, uniqueVisitors: 240, favorites: 45 },
]

const engagementData = [
  { name: "Profile Views", value: 2857 },
  { name: "Messages", value: 432 },
  { name: "Favorites", value: 361 },
  { name: "Bookings", value: 89 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

const trafficSourceData = [
  { name: "Search", value: 45 },
  { name: "Direct", value: 25 },
  { name: "Referral", value: 15 },
  { name: "Social", value: 10 },
  { name: "Other", value: 5 },
]

const popularContentData = [
  { name: "Photo 1", views: 320, likes: 120 },
  { name: "Photo 2", views: 280, likes: 95 },
  { name: "Video 1", views: 250, likes: 85 },
  { name: "Photo 3", views: 210, likes: 75 },
  { name: "Video 2", views: 190, likes: 65 },
]

const revenueData = [
  { date: "2023-05-01", revenue: 120 },
  { date: "2023-05-02", revenue: 150 },
  { date: "2023-05-03", revenue: 90 },
  { date: "2023-05-04", revenue: 110 },
  { date: "2023-05-05", revenue: 180 },
  { date: "2023-05-06", revenue: 220 },
  { date: "2023-05-07", revenue: 270 },
  { date: "2023-05-08", revenue: 240 },
  { date: "2023-05-09", revenue: 210 },
  { date: "2023-05-10", revenue: 200 },
  { date: "2023-05-11", revenue: 260 },
  { date: "2023-05-12", revenue: 280 },
  { date: "2023-05-13", revenue: 300 },
  { date: "2023-05-14", revenue: 310 },
]

export default function AdvertiserAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("14d")

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your performance and engagement</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Profile Views" value="2,857" change="+12.5%" icon={<Eye className="h-5 w-5" />} />
        <StatCard title="Unique Visitors" value="1,985" change="+8.2%" icon={<Users className="h-5 w-5" />} />
        <StatCard title="Messages" value="432" change="+24.3%" icon={<MessageCircle className="h-5 w-5" />} />
        <StatCard title="Favorites" value="361" change="+15.7%" icon={<Heart className="h-5 w-5" />} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Views & Visitors</CardTitle>
                <CardDescription>Daily profile views and unique visitors</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    views: {
                      label: "Profile Views",
                      color: "hsl(var(--chart-1))",
                    },
                    uniqueVisitors: {
                      label: "Unique Visitors",
                      color: "hsl(var(--chart-2))",
                    },
                    favorites: {
                      label: "Favorites",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={viewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                        }
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="uniqueVisitors"
                        stroke="var(--color-uniqueVisitors)"
                        strokeWidth={2}
                      />
                      <Line type="monotone" dataKey="favorites" stroke="var(--color-favorites)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Breakdown</CardTitle>
                <CardDescription>Distribution of user engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, "Count"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {trafficSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visitor Demographics</CardTitle>
                <CardDescription>Age and location breakdown of your visitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Demographic data visualization coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Popular Content</CardTitle>
              <CardDescription>Your most viewed and liked content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={popularContentData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#8884d8" name="Views" />
                    <Bar dataKey="likes" fill="#82ca9d" name="Likes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <StatCard title="Total Revenue" value="$2,850" change="+18.2%" icon={<DollarSign className="h-5 w-5" />} />
            <StatCard title="Average Order" value="$125" change="+5.4%" icon={<TrendingUp className="h-5 w-5" />} />
            <StatCard title="Conversion Rate" value="4.5%" change="+2.1%" icon={<Users className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Daily revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ title, value, change, icon }) {
  const isPositive = change.startsWith("+")

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <div className={`mt-4 text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {change} from last period
        </div>
      </CardContent>
    </Card>
  )
}
