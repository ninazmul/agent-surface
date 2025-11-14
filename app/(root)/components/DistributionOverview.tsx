// components/dashboard/DistributionOverview.tsx

import React from 'react';
import DistributionListItem from './DistributionListItem'; // Import the new component
import { DataOverviewChart } from './DataOverviewChart'; // Assuming location

// Import your model interfaces for correct typing
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
}: DistributionOverviewProps) => {
  
  // Hardcoded the dummy data from the image for display purposes.
  // The count for the first four items uses real fetched data (e.g., admins.length).
  const distributionData = [
    { label: "Admins", count: admins.length, percentage: "5.25%" },
    { label: "Leads", count: leads.length, percentage: "5.25%" },
    { label: "Resources", count: resources.length, percentage: "5.25%" },
    { label: "Courses", count: courses.length, percentage: "5.25%" },
    // Repeat for structure fidelity based on the image (using dummy counts/data)
    { label: "Admins", count: 5, percentage: "5.25%" },
    { label: "Admins", count: 5, percentage: "5.25%" },
    { label: "Admins", count: 5, percentage: "5.25%" },
    { label: "Admins", count: 5, percentage: "5.25%" },
    { label: "Admins", count: 5, percentage: "5.25%" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-gray-100">
          Distribution Overview
        </h2>
        {/* Placeholder for 'Last 30 days' dropdown */}
        <div className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
          Last 30 days ▼
        </div>
      </div>

      {/* The main chart area */}
      <div className="flex-shrink-0">
        <DataOverviewChart
          adminStatus={adminStatus}
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

      {/* The list of distribution items */}
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