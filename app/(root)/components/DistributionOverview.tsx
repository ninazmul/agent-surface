// components/dashboard/DistributionOverview.tsx

import React from "react";
import DistributionListItem from "./DistributionListItem";

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
import { ChartLineDots } from "./ChartLineDots";

interface DistributionOverviewProps {
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

const DistributionOverview = ({
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
}: DistributionOverviewProps) => {
  const totalCount =
    admins.length +
    leads.length +
    resources.length +
    courses.length +
    downloads.length +
    eventCalendars.length +
    profiles.length +
    promotions.length +
    services.length +
    users.length;

  const distributionData = [
    { label: "Admins", count: admins.length },
    { label: "Leads", count: leads.length },
    { label: "Resources", count: resources.length },
    { label: "Courses", count: courses.length },
    { label: "Downloads", count: downloads.length },
    { label: "Event Calendars", count: eventCalendars.length },
    { label: "Profiles", count: profiles.length },
    { label: "Promotions", count: promotions.length },
    { label: "Services", count: services.length },
    { label: "Users", count: users.length },
  ].map((item) => ({
    ...item,
    percentage:
      totalCount > 0
        ? ((item.count / totalCount) * 100).toFixed(2) + "%"
        : "0%",
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-gray-100">
          Distribution Overview
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
          Last 30 days ▼
        </div>
      </div>

      {/* Replacing DataOverviewChart with ChartLineDots */}
      <div className="flex-shrink-0">
        <ChartLineDots
          admins={admins}
          leads={leads}
          resources={resources}
          courses={courses}
          downloads={downloads}
          eventCalendars={eventCalendars}
          profiles={profiles}
          promotions={promotions}
          services={services}
          users={users}
        />
      </div>

      <div className="mt-4 overflow-y-auto">
        {distributionData.map((item, index) => (
          <DistributionListItem
            key={index}
            label={item.label}
            count={item.count}
            percentage={item.percentage}
          />
        ))}
      </div>
    </div>
  );
};

export default DistributionOverview;
