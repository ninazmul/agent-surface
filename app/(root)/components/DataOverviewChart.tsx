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

  // Optional: Colors for bars
  const barColors = [
    "#1E90FF",
    "#28A745",
    "#6F42C1",
    "#FFC107",
    "#FD7E14",
    "#6610F2",
    "#20C997",
    "#DC3545",
    "#17A2B8",
    "#E83E8C",
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Data Overview</CardTitle>
        <CardDescription>Total Entries by Category</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
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
            <Bar
              dataKey="count"
              fillOpacity={1}
              label={{ position: "top", fill: "#6B7280" }}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barColors[index % barColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Legend row below the chart */}
        <div className="flex flex-wrap mt-4 gap-4 justify-start">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: barColors[index % barColors.length] }}
              />
              <span className="text-sm text-gray-700">{item.category}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
