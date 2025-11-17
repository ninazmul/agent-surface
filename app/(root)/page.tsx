"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

import { getAdminCountriesByEmail, isAdmin } from "@/lib/actions/admin.actions";
import { getDownloadsByAgency } from "@/lib/actions/download.actions";
import { getLeadsByAgency } from "@/lib/actions/lead.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { getUserByClerkId, getUserEmailById } from "@/lib/actions/user.actions";
import { getDashboardSummary } from "@/lib/actions/summary.actions";

import SalesDashboard from "./components/SalesDashboard";
import CountrySalesTargets from "./components/CountrySalesTargets";
import LeadsToEnrolled from "./components/LeadsToEnrolled";
import LeadsFinancial from "./components/LeadsFinancial";
import { useDashboardData } from "@/components/shared/DashboardProvider";

import { IAdmin } from "@/lib/database/models/admin.model";
import { IResource } from "@/lib/database/models/resource.model";
import { ICourse } from "@/lib/database/models/course.model";
import { IEventCalendar } from "@/lib/database/models/eventCalender.model";
import { IPromotion } from "@/lib/database/models/promotion.model";
import { IServices } from "@/lib/database/models/service.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { IDownload } from "@/lib/database/models/download.model";
import { ILead } from "@/lib/database/models/lead.model";

import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { DataOverviewChart } from "./components/DataOverviewChart";
import DistributionOverview from "./components/DistributionOverview";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  BarElement,
  CategoryScale,
  LinearScale
);

const Dashboard = () => {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const { dashboardData, setDashboardData } = useDashboardData();

  const [adminStatus, setAdminStatus] = useState(false);
  const [myProfile, setMyProfile] = useState<IProfile | null>(null);

  const [admins, setAdmins] = useState<IAdmin[]>([]);
  const [resources, setResources] = useState<IResource[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [downloads, setDownloads] = useState<IDownload[]>([]);
  const [eventCalendars, setEventCalendars] = useState<IEventCalendar[]>([]);
  const [leads, setLeads] = useState<ILead[]>([]);
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [services, setServices] = useState<IServices[]>([]);

  // ===== Load cached dashboardData
  useEffect(() => {
    const cached = localStorage.getItem("dashboardData");
    if (cached && !dashboardData) setDashboardData(JSON.parse(cached));
  }, [dashboardData, setDashboardData]);

  // ===== Main fetch function

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [userDetails, profile, summary] = await Promise.all([
        getUserByClerkId(user.id),
        getProfileByEmail(user.emailAddresses?.[0]?.emailAddress || ""),
        getDashboardSummary(),
      ]);

      if (!summary) throw new Error("Failed to load dashboard summary");

      // Save context
      setDashboardData({ ...summary, myProfile: profile });

      // Update local state
      setAdmins(summary.admins);
      setResources(summary.resources);
      setCourses(summary.courses);
      setDownloads(summary.downloads);
      setEventCalendars(summary.eventCalendars);
      setLeads(summary.leads);
      setProfiles(summary.profiles);
      setPromotions(summary.promotions);
      setServices(summary.services);
      setMyProfile(profile);

      // Redirect student
      if (profile?.role === "Student") {
        router.replace("/profile");
        return;
      }

      // Admin validation
      const email = await getUserEmailById(userDetails);
      const [isAdminStatus, adminCountry] = await Promise.all([
        isAdmin(email),
        getAdminCountriesByEmail(email),
      ]);
      setAdminStatus(isAdminStatus);

      if (isAdminStatus) {
        const filterByCountry = <T,>(
          data: T[],
          getCountry: (item: T) => string | undefined
        ): T[] =>
          adminCountry.length
            ? data.filter((item) => {
                const country = getCountry(item);
                return country && adminCountry.includes(country);
              })
            : data;

        setDownloads(
          filterByCountry(summary.downloads, (d) => d.country) as IDownload[]
        );
        setLeads(
          filterByCountry(summary.leads, (l) => l.home?.country) as ILead[]
        );
      } else {
        const agentEmails = [email, ...(profile?.subAgents || [])];
        // setSubAgentCount(profile?.subAgents?.length || 0);

        const [downloadResults, leadResults] = await Promise.all([
          Promise.allSettled(
            agentEmails.map((agent) => getDownloadsByAgency(agent))
          ),
          Promise.allSettled(
            agentEmails.map((agent) => getLeadsByAgency(agent))
          ),
        ]);

        const filteredDownloads = downloadResults
          .filter((res) => res.status === "fulfilled")
          .flatMap((res) => (res as PromiseFulfilledResult<IDownload[]>).value);

        const filteredLeads = leadResults
          .filter((res) => res.status === "fulfilled")
          .flatMap((res) => (res as PromiseFulfilledResult<ILead[]>).value)
          .filter(
            (l): l is ILead =>
              l !== null && l !== undefined && l.createdAt !== undefined
          );

        setDownloads(filteredDownloads);
        setLeads(filteredLeads);
      }

      // Cache in localStorage
      localStorage.setItem(
        "dashboardData",
        JSON.stringify({ ...summary, myProfile: profile })
      );
    } catch (error) {
      console.error("Dashboard load failed:", error);
    }
  }, [user, router, setDashboardData]);

  // ===== Reload via query param
  useEffect(() => {
    if (searchParams.get("reload")) {
      setDashboardData(null);
      router.replace("/");
      loadDashboardData();
    }
  }, [searchParams, router, setDashboardData, loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, user]);

  return (
    <div className="p-4 mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[450px]">
        {myProfile?.role !== "Student" && <SalesDashboard leads={leads} />}
        {myProfile?.role !== "Student" && (
          <CountrySalesTargets
            adminStatus={adminStatus}
            profiles={profiles}
            leads={leads}
            myProfile={myProfile}
          />
        )}
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
        />

        <DistributionOverview
          admins={admins}
          leads={leads}
          resources={resources}
          courses={courses}
          downloads={downloads}
          eventCalendars={eventCalendars}
          profiles={profiles}
          promotions={promotions}
          services={services}
        />
        {adminStatus && <LeadsToEnrolled leads={leads} profiles={profiles} />}
        {adminStatus && <LeadsFinancial leads={leads} profiles={profiles} />}
      </div>
    </div>
  );
};

export default Dashboard;
