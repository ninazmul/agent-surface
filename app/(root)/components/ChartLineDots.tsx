"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { IAdmin } from "@/lib/database/models/admin.model";
import { IResource } from "@/lib/database/models/resource.model";
import { ICourse } from "@/lib/database/models/course.model";
import { IEventCalendar } from "@/lib/database/models/eventCalender.model";
import { IPromotion } from "@/lib/database/models/promotion.model";
import { IServices } from "@/lib/database/models/service.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { IDownload } from "@/lib/database/models/download.model";
import { ILead } from "@/lib/database/models/lead.model";

interface ChartLineDotsProps {
  admins: IAdmin[];
  leads: ILead[];
  resources: IResource[];
  courses: ICourse[];
  downloads: IDownload[];
  eventCalendars: IEventCalendar[];
  profiles: IProfile[];
  promotions: IPromotion[];
  services: IServices[];
}

export function ChartLineDots({
  admins,
  leads,
  resources,
  courses,
  downloads,
  eventCalendars,
  profiles,
  promotions,
  services,
}: ChartLineDotsProps) {
  // Convert each data category into an array for the chart
  const chartData = [
    { category: "Admins", count: admins.length },
    { category: "Leads", count: leads.length },
    { category: "Resources", count: resources.length },
    { category: "Courses", count: courses.length },
    { category: "Downloads", count: downloads.length },
    { category: "Event Calendars", count: eventCalendars.length },
    { category: "Profiles", count: profiles.length },
    { category: "Promotions", count: promotions.length },
    { category: "Services", count: services.length },
  ];

  return (
    <Card>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: 4,
                border: "none",
              }}
              cursor={false}
            />
            <Line
              dataKey="count"
              type="natural"
              stroke="var(--color-desktop, #3b82f6)"
              strokeWidth={2}
              dot={{ fill: "var(--color-desktop, #3b82f6)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
