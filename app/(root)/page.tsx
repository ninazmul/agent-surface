"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
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

import {
  UserCog,
  FileText,
  BookOpen,
  Download,
  CalendarClock,
  PhoneCall,
  User,
  Megaphone,
  Wrench,
  Users,
} from "lucide-react";

import { getAdminCountriesByEmail, isAdmin } from "@/lib/actions/admin.actions";
import { getDownloadsByAgency } from "@/lib/actions/download.actions";
import { getLeadsByAgency } from "@/lib/actions/lead.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { getUserByClerkId, getUserEmailById } from "@/lib/actions/user.actions";

import SalesDashboard from "./components/SalesDashboard";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { IDownload } from "@/lib/database/models/download.model";
import { ILead } from "@/lib/database/models/lead.model";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { IProfile } from "@/lib/database/models/profile.model";
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
import { IUser } from "@/lib/database/models/user.model";
import { getDashboardSummary } from "@/lib/actions/summary.actions";

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

// Soft pastel backgrounds for cards
const cardBgColors: Record<string, string> = {
  Admins: "bg-blue-50 dark:bg-gray-800",
  Applications: "bg-green-50 dark:bg-gray-800",
  Resources: "bg-purple-50 dark:bg-gray-800",
  Courses: "bg-orange-50 dark:bg-gray-800",
  Documents: "bg-yellow-50 dark:bg-gray-800",
  Events: "bg-cyan-50 dark:bg-gray-800",
  Leads: "bg-pink-50 dark:bg-gray-800",
  Agency: "bg-indigo-50 dark:bg-gray-800",
  Promotions: "bg-fuchsia-50 dark:bg-gray-800",
  Services: "bg-teal-50 dark:bg-gray-800",
  Users: "bg-gray-50 dark:bg-gray-800",
  Rejected: "bg-rose-50 dark:bg-gray-800",
  "Sub Agents": "bg-emerald-50 dark:bg-gray-800",
};

const Dashboard = () => {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id || "";
  const searchParams = useSearchParams();
  const { dashboardData, setDashboardData } = useDashboardData();

  const [loading, setLoading] = useState(true);
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
  const [users, setUsers] = useState<IUser[]>([]);
  const [subAgentCount, setSubAgentCount] = useState(0);

  // ======== Handle reloads via query params
  useEffect(() => {
    const shouldReload = searchParams.get("reload");
    if (shouldReload) {
      setDashboardData(null);
      router.replace("/");
      fetchInitialData();
    }
  }, [router, searchParams, setDashboardData]);

  // ======== Load from localStorage cache
  useEffect(() => {
    const cached = localStorage.getItem("dashboardData");
    if (cached && !dashboardData) {
      setDashboardData(JSON.parse(cached));
    }
  }, [dashboardData, setDashboardData]);

  // ======== Main Data Fetch
  useEffect(() => {
    if (dashboardData) {
      localStorage.setItem("dashboardData", JSON.stringify(dashboardData));
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch user + profile + summary in parallel
        const [userID, profile, summary] = await Promise.all([
          getUserByClerkId(userId),
          getProfileByEmail(user?.emailAddresses?.[0]?.emailAddress || ""),
          getDashboardSummary(),
        ]);

        if (!summary) throw new Error("Failed to load summary data");

        const {
          admins,
          resources,
          courses,
          downloads,
          eventCalendars,
          leads,
          profiles,
          promotions,
          services,
          users,
        } = summary;

        // Save snapshot in context
        const snapshot = {
          admins,
          resources,
          courses,
          downloads,
          eventCalendars,
          leads,
          profiles,
          promotions,
          services,
          users,
          myProfile: profile,
        };

        setDashboardData(snapshot);

        // Update local states
        setAdmins(admins);
        setResources(resources);
        setCourses(courses);
        setDownloads(downloads);
        setEventCalendars(eventCalendars);
        setLeads(leads);
        setProfiles(profiles);
        setPromotions(promotions);
        setServices(services);
        setUsers(users);
        setMyProfile(profile);

        // Redirect if student
        if (profile?.role === "Student") {
          router.replace("/profile");
          return;
        }

        // Admin validation after render
        const email = await getUserEmailById(userID);
        const [isAdminStatus, adminCountry] = await Promise.all([
          isAdmin(email),
          getAdminCountriesByEmail(email),
        ]);

        setAdminStatus(isAdminStatus);

        if (isAdminStatus) {
          // Filter data by country for admins
          const filterByCountry = <T extends { country?: string }>(
            data: T[]
          ): T[] =>
            adminCountry.length === 0
              ? data
              : data.filter(
                  (item) =>
                    typeof item.country === "string" &&
                    adminCountry.includes(item.country)
                );

          setDownloads(filterByCountry(downloads) as IDownload[]);
          setLeads(filterByCountry(leads) as ILead[]);
        } else {
          // Sub-agent filtering
          const agentEmails = [email, ...(profile?.subAgents || [])];
          setSubAgentCount(profile?.subAgents?.length || 0);

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
            .flatMap(
              (res) => (res as PromiseFulfilledResult<IDownload[]>).value
            );

          const filteredLeads = leadResults
            .filter((res) => res.status === "fulfilled")
            .flatMap((res) => (res as PromiseFulfilledResult<ILead[]>).value);

          setDownloads(filteredDownloads);
          setLeads(filteredLeads);
        }
      } catch (error) {
        console.error("Dashboard load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [router, userId, user, dashboardData, setDashboardData]);

  // ======== Chart Data
  const allLabels = [
    "Admins",
    "Leads",
    "Resources",
    "Courses",
    "Downloads",
    "Calendars",
    "Profiles",
    "Promotions",
    "Services",
    "Users",
  ];

  const allValues = [
    admins.length,
    leads.length,
    resources.length,
    courses.length,
    downloads.length,
    eventCalendars.length,
    profiles.length,
    promotions.length,
    services.length,
    users.length,
  ];

  const filteredChartData = allLabels.reduce(
    (acc, label, index) => {
      if (!adminStatus && ["Admins", "Profiles", "Users"].includes(label)) {
        return acc;
      }
      acc.labels.push(label);
      acc.values.push(allValues[index]);
      return acc;
    },
    { labels: [], values: [] } as { labels: string[]; values: number[] }
  );

  const chartColors = [
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
    "#6C757D",
  ];

  const chartHoverColors = [
    "#007BFF",
    "#218838",
    "#5A32A1",
    "#E0A800",
    "#E45900",
    "#520DC2",
    "#138B6A",
    "#C82333",
    "#117A8B",
    "#D63384",
    "#5A6268",
  ];

  const pieData = {
    labels: filteredChartData.labels,
    datasets: [
      {
        data: filteredChartData.values,
        backgroundColor: chartColors.slice(0, filteredChartData.labels.length),
        hoverBackgroundColor: chartHoverColors.slice(
          0,
          filteredChartData.labels.length
        ),
      },
    ],
  };

  const barData = {
    labels: filteredChartData.labels,
    datasets: [
      {
        label: "Data Overview",
        data: filteredChartData.values,
        backgroundColor: chartColors.slice(0, filteredChartData.labels.length),
        borderColor: chartHoverColors.slice(0, filteredChartData.labels.length),
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        titleColor: "#6B7280",
        bodyColor: "#6B7280",
        callbacks: {
          label: (context: import("chart.js").TooltipItem<"bar">) =>
            `${context.dataset.label}: ${context.raw}`,
        },
      },
      title: { display: false, color: "#6B7280" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 14 },
          color: "#6B7280", // y-axis text color
        },
        grid: { color: "#eee" },
      },
      x: {
        ticks: {
          font: { size: 14 },
          color: "#6B7280", // x-axis text color
        },
        grid: { display: false },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: { size: 14 },
          padding: 16,
          color: "#6B7280", // legend text color
        },
      },
      tooltip: {
        titleColor: "#6B7280",
        bodyColor: "#6B7280",
        callbacks: {
          label: (context: import("chart.js").TooltipItem<"pie">) => {
            const label = context.label || "";
            const value = context.raw;
            const total = context.dataset.data.reduce(
              (sum: number, val: number) => sum + val,
              0
            );
            const percentage = ((Number(value) / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
      title: { display: false, color: "#6B7280" },
    },
  };

  return (
    <div className="container mx-auto p-6 space-y-10 bg-white dark:bg-gray-900 rounded-2xl">
      {myProfile?.role !== "Student" && <SalesDashboard leads={leads} />}

      {myProfile?.role !== "Student" && (
        <CountrySalesTargets
          adminStatus={adminStatus}
          profiles={profiles}
          leads={leads}
          myProfile={myProfile}
        />
      )}

      {adminStatus && <LeadsToEnrolled leads={leads} profiles={profiles} />}

      {adminStatus && <LeadsFinancial leads={leads} profiles={profiles} />}

      <div className="overflow-x-auto">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">
              Dashboard Stats
            </h1>
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
              {adminStatus && (
                <a href={`/admins`}>
                  <DashboardCard
                    icon={<UserCog className="text-3xl text-blue-500" />}
                    title="Admins"
                    value={admins.length}
                    bg={cardBgColors["Admins"]}
                  />
                </a>
              )}
              <a href={`/leads`}>
                <DashboardCard
                  icon={<PhoneCall className="text-3xl text-pink-500" />}
                  title="Leads"
                  value={leads.length}
                  bg={cardBgColors["Leads"]}
                />
              </a>
              <a href={`/resources`}>
                <DashboardCard
                  icon={<FileText className="text-3xl text-purple-500" />}
                  title="Resources"
                  value={resources.length}
                  bg={cardBgColors["Resources"]}
                />
              </a>
              {adminStatus && (
                <a href={`/courses`}>
                  <DashboardCard
                    icon={<BookOpen className="text-3xl text-orange-500" />}
                    title="Courses"
                    value={courses.length}
                    bg={cardBgColors["Courses"]}
                  />
                </a>
              )}
              <a href={`/downloads`}>
                <DashboardCard
                  icon={<Download className="text-3xl text-yellow-500" />}
                  title="Documents"
                  value={downloads.length}
                  bg={cardBgColors["Documents"]}
                />
              </a>
              <a href={`/events`}>
                <DashboardCard
                  icon={<CalendarClock className="text-3xl text-cyan-500" />}
                  title="Events"
                  value={eventCalendars.length}
                  bg={cardBgColors["Events"]}
                />
              </a>
              {adminStatus && (
                <a href={`/profiles`}>
                  <DashboardCard
                    icon={<User className="text-3xl text-indigo-500" />}
                    title="Agency"
                    value={profiles.length}
                    bg={cardBgColors["Agency"]}
                  />
                </a>
              )}
              <a href={`/promotions`}>
                <DashboardCard
                  icon={<Megaphone className="text-3xl text-fuchsia-500" />}
                  title="Promotions"
                  value={promotions.length}
                  bg={cardBgColors["Promotions"]}
                />
              </a>
              {adminStatus && (
                <a href={`/services`}>
                  <DashboardCard
                    icon={<Wrench className="text-3xl text-teal-500" />}
                    title="Services"
                    value={services.length}
                    bg={cardBgColors["Services"]}
                  />
                </a>
              )}
              {adminStatus && (
                <a href={`/users`}>
                  <DashboardCard
                    icon={<Users className="text-3xl text-gray-600" />}
                    title="Users"
                    value={users.length}
                    bg={cardBgColors["Users"]}
                  />
                </a>
              )}
              {/* <a href={`/applications`}>
                <DashboardCard
                  icon={<UserX className="text-3xl text-rose-500" />}
                  title="Rejected"
                  value={rejectedCount}
                  bg={cardBgColors["Rejected"]}
                />
              </a> */}
              {adminStatus && myProfile?.role === "Agent" && (
                <a href={`/profile`}>
                  <DashboardCard
                    icon={<Users className="text-3xl text-emerald-600" />}
                    title="Sub Agents"
                    value={subAgentCount}
                    bg={cardBgColors["Sub Agents"]}
                  />
                </a>
              )}
            </div>
          </>
        )}
      </div>
      {!loading && (
        <div className="space-y-10">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Data Overview
          </h2>

          <div className="flex flex-col md:flex-row gap-8 h-full">
            {/* Bar Chart */}
            <div className="md:w-3/5 w-full h-full mx-auto">
              <Card className="p-6 rounded-2xl shadow-md bg-yellow-50 dark:bg-gray-800 h-full">
                <h3 className="text-lg font-semibold text-center text-gray-700 dark:text-gray-200 mb-4">
                  Total Entries by Category
                </h3>
                <Bar data={barData} options={barOptions} />
              </Card>
            </div>

            {/* Pie Chart */}
            <div className="md:w-2/5 w-full h-full mx-auto">
              <Card className="p-6 rounded-2xl shadow-md bg-cyan-50 dark:bg-gray-800 h-full">
                <h3 className="text-lg font-semibold text-center text-gray-700 dark:text-gray-200 mb-4">
                  Distribution Overview
                </h3>
                <Pie data={pieData} options={pieOptions} />
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Charts Loading Skeleton */}
      {loading && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-48 h-7"></h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-3/5 w-full max-w-[700px] mx-auto h-[300px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            <div className="md:w-2/5 w-full max-w-[400px] mx-auto h-[300px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  bg?: string;
}

const DashboardCard = ({ icon, title, value, bg }: DashboardCardProps) => {
  return (
    <Card
      className={`rounded-2xl shadow-md ${bg} px-5 py-6 flex flex-col justify-between transition hover:shadow-xl`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
          {title}
        </p>
        {icon && <div className="text-xl">{icon}</div>}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="w-12 h-12">
          <CircularProgressbar
            value={Number(value)}
            text={value.toString()}
            styles={buildStyles({
              textColor: "#6C63FF",
              pathColor: "#6C63FF",
              trailColor: "#eee",
              textSize: "28px",
            })}
          />
        </div>
      </div>
    </Card>
  );
};

const SkeletonCard = () => (
  <div className="flex flex-col justify-between border border-gray-200 dark:border-gray-700 shadow p-6 rounded-2xl animate-pulse bg-gray-100 dark:bg-gray-800 h-[140px]">
    <div className="flex justify-between">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-6"></div>
    </div>
    <div className="h-6 bg-gray-400 dark:bg-gray-500 rounded w-1/3 mt-4"></div>
  </div>
);

export default Dashboard;
function fetchInitialData() {
  throw new Error("Function not implemented.");
}
