"use client";

import React, { useState, useMemo } from "react";
import DistributionListItem from "./DistributionListItem";
import { ChartLineDots } from "./ChartLineDots";

import { IAdmin } from "@/lib/database/models/admin.model";
import { IResource } from "@/lib/database/models/resource.model";
import { ICourse } from "@/lib/database/models/course.model";
import { IEventCalendar } from "@/lib/database/models/eventCalender.model";
import { IPromotion } from "@/lib/database/models/promotion.model";
import { IServices } from "@/lib/database/models/service.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { IDownload } from "@/lib/database/models/download.model";
import { ILead } from "@/lib/database/models/lead.model";

interface DistributionOverviewProps {
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

type DateFilterOption = "30days" | "7days" | "all";

// Move filterByDate outside component to satisfy useMemo
const filterByDate = <T extends { createdAt?: string | Date }>(
  data: T[],
  dateFilter: DateFilterOption
) => {
  if (dateFilter === "all") return data;

  const now = new Date();
  let cutoff: Date;

  if (dateFilter === "30days") {
    cutoff = new Date();
    cutoff.setDate(now.getDate() - 30);
  } else if (dateFilter === "7days") {
    cutoff = new Date();
    cutoff.setDate(now.getDate() - 7);
  } else {
    return data;
  }

  return data.filter((item) => {
    if (!item.createdAt) return false;
    const itemDate = new Date(item.createdAt);
    return itemDate >= cutoff;
  });
};

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
}: DistributionOverviewProps) => {
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("30days");

  // Filtered datasets
  const filteredAdmins = useMemo(() => filterByDate(admins, dateFilter), [admins, dateFilter]);
  const filteredLeads = useMemo(() => filterByDate(leads, dateFilter), [leads, dateFilter]);
  const filteredResources = useMemo(() => filterByDate(resources, dateFilter), [resources, dateFilter]);
  const filteredCourses = useMemo(() => filterByDate(courses, dateFilter), [courses, dateFilter]);
  const filteredDownloads = useMemo(() => filterByDate(downloads, dateFilter), [downloads, dateFilter]);
  const filteredEventCalendars = useMemo(() => filterByDate(eventCalendars, dateFilter), [eventCalendars, dateFilter]);
  const filteredProfiles = useMemo(() => filterByDate(profiles, dateFilter), [profiles, dateFilter]);
  const filteredPromotions = useMemo(() => filterByDate(promotions, dateFilter), [promotions, dateFilter]);
  const filteredServices = useMemo(() => filterByDate(services, dateFilter), [services, dateFilter]);

  const totalCount =
    filteredAdmins.length +
    filteredLeads.length +
    filteredResources.length +
    filteredCourses.length +
    filteredDownloads.length +
    filteredEventCalendars.length +
    filteredProfiles.length +
    filteredPromotions.length +
    filteredServices.length;

  const distributionData = [
    { label: "Admins", count: filteredAdmins.length },
    { label: "Leads", count: filteredLeads.length },
    { label: "Resources", count: filteredResources.length },
    { label: "Courses", count: filteredCourses.length },
    { label: "Downloads", count: filteredDownloads.length },
    { label: "Event Calendars", count: filteredEventCalendars.length },
    { label: "Profiles", count: filteredProfiles.length },
    { label: "Promotions", count: filteredPromotions.length },
    { label: "Services", count: filteredServices.length },
  ].map((item) => ({
    ...item,
    percentage:
      totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(2) + "%" : "0%",
  }));

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mb-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-gray-100">
          Distribution Overview
        </h2>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
          className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      <div className="flex-shrink-0">
        <ChartLineDots
          admins={filteredAdmins}
          leads={filteredLeads}
          resources={filteredResources}
          courses={filteredCourses}
          downloads={filteredDownloads}
          eventCalendars={filteredEventCalendars}
          profiles={filteredProfiles}
          promotions={filteredPromotions}
          services={filteredServices}
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
