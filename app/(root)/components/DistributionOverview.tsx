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
  admins: IAdmin[] | null;
  leads: ILead[] | null;
  resources: IResource[] | null;
  courses: ICourse[] | null;
  downloads: IDownload[] | null;
  eventCalendars: IEventCalendar[] | null;
  profiles: IProfile[] | null;
  promotions: IPromotion[] | null;
  services: IServices[] | null;
}

type DateFilterOption = "30days" | "7days" | "all";

// Filter function
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
  const filteredAdmins = useMemo(() => {
    const safeAdmins = Array.isArray(admins) ? admins : [];
    return filterByDate(safeAdmins, dateFilter);
  }, [admins, dateFilter]);

  const filteredLeads = useMemo(() => {
    const safeLeads = Array.isArray(leads) ? leads : [];
    return filterByDate(safeLeads, dateFilter);
  }, [leads, dateFilter]);

  const filteredResources = useMemo(() => {
    const safeResources = Array.isArray(resources) ? resources : [];
    return filterByDate(safeResources, dateFilter);
  }, [resources, dateFilter]);

  const filteredCourses = useMemo(() => {
    const safeCourses = Array.isArray(courses) ? courses : [];
    return filterByDate(safeCourses, dateFilter);
  }, [courses, dateFilter]);

  const filteredDownloads = useMemo(() => {
    const safeDownloads = Array.isArray(downloads) ? downloads : [];
    return filterByDate(safeDownloads, dateFilter);
  }, [downloads, dateFilter]);

  const filteredEventCalendars = useMemo(() => {
    const safeEventCalendars = Array.isArray(eventCalendars)
      ? eventCalendars
      : [];
    return filterByDate(safeEventCalendars, dateFilter);
  }, [eventCalendars, dateFilter]);

  const filteredProfiles = useMemo(() => {
    const safeProfiles = Array.isArray(profiles) ? profiles : [];
    return filterByDate(safeProfiles, dateFilter);
  }, [profiles, dateFilter]);

  const filteredPromotions = useMemo(() => {
    const safePromotions = Array.isArray(promotions) ? promotions : [];
    return filterByDate(safePromotions, dateFilter);
  }, [promotions, dateFilter]);

  const filteredServices = useMemo(() => {
    const safeServices = Array.isArray(services) ? services : [];
    return filterByDate(safeServices, dateFilter);
  }, [services, dateFilter]);

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
  ]
    .map((item) => ({
      ...item,
      percentage:
        totalCount > 0
          ? ((item.count / totalCount) * 100).toFixed(2) + "%"
          : "0%",
    }))
    // Sort descending by count (highest first)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mb-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Distribution Overview
        </h2>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
          className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
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
