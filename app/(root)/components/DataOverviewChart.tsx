"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { IAdmin } from "@/lib/database/models/admin.model";
import { IResource } from "@/lib/database/models/resource.model";
import { ICourse } from "@/lib/database/models/course.model";
import { IEventCalendar } from "@/lib/database/models/eventCalender.model";
import { IPromotion } from "@/lib/database/models/promotion.model";
import { IServices } from "@/lib/database/models/service.model";
import { IUser } from "@/lib/database/models/user.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { IDownload } from "@/lib/database/models/download.model";
import { ILead } from "@/lib/database/models/lead.model";

interface DataOverviewChartProps {
  adminStatus: boolean;
  admins: IAdmin[];
  leads: ILead[];
  resources: IResource[];
  courses: ICourse[];
  downloads: IDownload[];
  eventCalendars: IEventCalendar[];
  profiles: IProfile[];
  promotions: IPromotion[];
  services: IServices[];
  users: IUser[];
}

export const DataOverviewChart: React.FC<DataOverviewChartProps> = ({
  adminStatus,
  admins,
  leads,
  resources,
  courses,
  downloads,
  eventCalendars,
  profiles,
  promotions,
  services,
  users,
}) => {
  // Filter labels based on admin status
  const labels = [
    { key: "Admins", value: admins.length },
    { key: "Leads", value: leads.length },
    { key: "Resources", value: resources.length },
    { key: "Courses", value: courses.length },
    { key: "Downloads", value: downloads.length },
    { key: "Calendars", value: eventCalendars.length },
    { key: "Profiles", value: profiles.length },
    { key: "Promotions", value: promotions.length },
    { key: "Services", value: services.length },
    { key: "Users", value: users.length },
  ].filter(
    (item) => adminStatus || !["Admins", "Profiles", "Users"].includes(item.key)
  );

  // Prepare data for Recharts
  const chartData = labels.map((item) => ({
    category: item.key,
    count: item.value,
  }));

  const maxCount = Math.max(...chartData.map((d) => d.count)) || 1;

  // Optional: Colors for bars
  const barColors = [
    "#1D1D1D",
    "#AE8BCA",
    "#428BF6",
    "#A866FD",
    "#DD992B",
    "#1670F3",
    "#3A3A3A",
    "#7D24F0",
    "#DD992B",
    "#69A6FF",
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Data Overview</CardTitle>
        <CardDescription>Total Entries by Category</CardDescription>
      </CardHeader>
      <CardContent className="h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <XAxis
              dataKey="category"
              tick={{ fontSize: 14, fill: "#6B7280" }}
            />
            <Tooltip />

            {/* Background bars (full height reference) */}
            <Bar
              dataKey={() => maxCount} // static max reference
              fill="#E5E7EB" // light gray background
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />

            {/* Actual bars */}
            <Bar
              dataKey="count"
              isAnimationActive={false}
              radius={[4, 4, 0, 0]} // actual filled bar (works)
              label={{ position: "top", fill: "#6B7280" }}
              background={{
                fill: "#E5E7EB",
                radius: 4, // MUST be a single number
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={barColors[index % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend below chart */}
        <div className="flex flex-wrap mt-6 gap-4 justify-start">
          {labels.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: barColors[index % barColors.length] }}
              />
              <span className="text-sm font-medium text-gray-700">
                {item.key}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
