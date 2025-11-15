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
   STRICTLY TYPED CUSTOM SHAPE
------------------------------------------------------- */
type RechartsBarShapeProps = RectangleProps & {
  value?: number;
  fill?: string;
};

interface CombinedBarProps extends RectangleProps {
  value: number;
  maxValue: number;
  fill: string;
}

const CombinedBar: React.FC<CombinedBarProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill,
  value,
  maxValue,
}) => {
  const fullHeight = Math.max(height, 0);
  const filledHeight = (value / maxValue) * fullHeight;
  const filledY = y + (fullHeight - filledHeight);

  return (
    <g>
      {/* empty background track */}
      <rect
        x={x}
        y={y}
        width={width}
        height={fullHeight}
        fill="#E5E7EB"
        rx={4}
        ry={4}
      />

      {/* filled bar */}
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
   MAIN CHART COMPONENT
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
  // Filter labels based on adminStatus
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
  ].filter(
    (item) => adminStatus || !["Admins", "Profiles", "Users"].includes(item.key)
  );

  // Chart data
  const chartData = labels.map((item) => ({
    category: item.key,
    count: item.value,
  }));

  const maxCount = Math.max(...chartData.map((d) => d.count)) || 1;

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

  return (
    <Card className="h-auto bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Data Overview
        </CardTitle>
        <CardDescription>Total Entries by Category</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col">
        {/* Chart */}
        <div className="w-full h-[400px] lg:h-[500px]">
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
                isAnimationActive={false}
                shape={(props: unknown) => {
                  const p = props as RechartsBarShapeProps;
                  return (
                    <CombinedBar
                      {...p}
                      value={p.value ?? 0}
                      fill={p.fill ?? "#000"}
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

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4">
          {labels.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: barColors[index % barColors.length] }}
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
