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
  RectangleProps,
} from "recharts";

import { IAdmin } from "@/lib/database/models/admin.model";
import { IResource } from "@/lib/database/models/resource.model";
import { ICourse } from "@/lib/database/models/course.model";
import { IEventCalendar } from "@/lib/database/models/eventCalender.model";
import { IPromotion } from "@/lib/database/models/promotion.model";
import { IServices } from "@/lib/database/models/service.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { IDownload } from "@/lib/database/models/download.model";
import { ILead } from "@/lib/database/models/lead.model";

/* -------------------------------------------------------
   PROPS
------------------------------------------------------- */
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
}

/* -------------------------------------------------------
   CUSTOM BAR (NaN-SAFE)
------------------------------------------------------- */
interface CombinedBarProps extends RectangleProps {
  value?: number;
  maxValue: number;
  fill?: string;
}

const CombinedBar: React.FC<CombinedBarProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  value,
  maxValue,
  fill = "#000",
}) => {
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 0;
  const safeValue =
    value !== undefined && Number.isFinite(value) && value > 0 ? value : 0;
  const safeMax = Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 1;

  const filledHeight = (safeValue / safeMax) * safeHeight;
  const filledY = y + (safeHeight - filledHeight);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={safeHeight}
        fill="#E5E7EB"
        rx={4}
        ry={4}
      />
      <rect
        x={x}
        y={filledY}
        width={width}
        height={filledHeight}
        fill={fill}
        rx={4}
        ry={4}
      />
    </g>
  );
};

/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */
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
}) => {
  /* ---------------- SAFE NORMALIZATION ---------------- */
  const safeAdmins = Array.isArray(admins) ? admins : [];
  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeResources = Array.isArray(resources) ? resources : [];
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeDownloads = Array.isArray(downloads) ? downloads : [];
  const safeCalendars = Array.isArray(eventCalendars) ? eventCalendars : [];
  const safeProfiles = Array.isArray(profiles) ? profiles : [];
  const safePromotions = Array.isArray(promotions) ? promotions : [];
  const safeServices = Array.isArray(services) ? services : [];

  /* ---------------- ROLE-AWARE METRICS ---------------- */
  const allMetrics = [
    { key: "Admins", value: safeAdmins.length, adminOnly: true },
    { key: "Leads", value: safeLeads.length, adminOnly: false },
    { key: "Resources", value: safeResources.length, adminOnly: false },
    { key: "Courses", value: safeCourses.length, adminOnly: false },
    { key: "Downloads", value: safeDownloads.length, adminOnly: false },
    { key: "Calendars", value: safeCalendars.length, adminOnly: false },
    { key: "Profiles", value: safeProfiles.length, adminOnly: true },
    { key: "Promotions", value: safePromotions.length, adminOnly: false },
    { key: "Services", value: safeServices.length, adminOnly: false },
  ];

  const visibleMetrics = allMetrics.filter(
    (item) => adminStatus || !item.adminOnly,
  );

  /* ---------------- CHART DATA ---------------- */
  const chartData = visibleMetrics.map((item) => ({
    category: item.key,
    count: Number(item.value) || 0,
  }));

  const counts = chartData.map((d) => d.count);
  const maxCount =
    counts.length && Math.max(...counts) > 0 ? Math.max(...counts) : 1;

  /* ---------------- COLORS ---------------- */
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
  ];

  /* ---------------- RENDER ---------------- */
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Data Overview
        </CardTitle>
        <CardDescription>Total Entries by Category</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="w-full h-[400px] lg:h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 20 }}
            >
              <XAxis
                dataKey="category"
                tick={{ fontSize: 14, fill: "#6B7280" }}
              />
              <Tooltip />
              <Bar
                dataKey="count"
                isAnimationActive={false}
                shape={(props: unknown) => {
                  const p = props as RectangleProps & {
                    value?: number;
                    fill?: string;
                  };
                  return (
                    <CombinedBar
                      {...p}
                      value={p.value}
                      fill={p.fill}
                      maxValue={maxCount}
                    />
                  );
                }}
                label={{ position: "top", fill: "#6B7280" }}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={barColors[index % barColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LEGEND */}
        <div className="mt-6 flex flex-wrap gap-4">
          {visibleMetrics.map((item, index) => (
            <div key={item.key} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{
                  backgroundColor: barColors[index % barColors.length],
                }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
                {item.key}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
