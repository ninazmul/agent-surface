"use client";

import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { subWeeks, subMonths, subQuarters, subYears, format } from "date-fns";
import { ILead } from "@/lib/database/models/lead.model";
import { useUser } from "@clerk/nextjs";
import { getUserByClerkId, getUserEmailById } from "@/lib/actions/user.actions";
import { getAdminCountriesByEmail, isAdmin } from "@/lib/actions/admin.actions";
import { getAllLeads, getLeadsByAgency } from "@/lib/actions/lead.actions";
import { useDashboardData } from "@/components/shared/DashboardProvider";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale
);

// Reusable skeleton component
const Skeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 w-1/3 bg-gray-300 dark:bg-gray-800 rounded"></div>
    <div className="flex flex-wrap gap-4 bg-blue-50 dark:bg-gray-800 p-4 rounded-2xl shadow">
      <div className="h-10 w-32 bg-gray-300 dark:bg-gray-500 rounded"></div>
      <div className="h-10 w-32 bg-gray-300 dark:bg-gray-500 rounded"></div>
      <div className="h-10 w-32 bg-gray-300 dark:bg-gray-500 rounded"></div>
    </div>
    <div className="bg-green-50 dark:bg-gray-800 shadow rounded-2xl p-6">
      <div className="h-6 w-32 bg-gray-300 dark:bg-gray-500 rounded mb-4"></div>
      <div className="h-10 w-24 bg-gray-300 dark:bg-gray-500 rounded"></div>
    </div>
  </div>
);

const SalesDashboard = () => {
  const { user } = useUser();
  const userId = user?.id || "";

  const [leads, setLeads] = useState<ILead[]>([]);
  const [filter, setFilter] = useState("month");
  const [country, setCountry] = useState("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { dashboardData, setDashboardData } = useDashboardData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (dashboardData?.leads && dashboardData.leads.length > 0) {
          setLeads(dashboardData.leads);
          setLoading(false);
          return;
        }

        const userID = await getUserByClerkId(userId);
        const email = await getUserEmailById(userID);
        const adminStatus = await isAdmin(email);
        const adminCountries = await getAdminCountriesByEmail(email);

        // ✅ Always fetch once
        const fetchedLeads = await getAllLeads();

        let allLeads: ILead[] = [];

        if (adminStatus) {
          // Admin: keep all or restrict by allowed countries
          allLeads =
            adminCountries.length === 0
              ? fetchedLeads
              : fetchedLeads.filter((l: ILead) =>
                  adminCountries.includes(l.home.country)
                );
        } else {
          // Non-admin: filter by agency here
          const agencyLeads = await getLeadsByAgency(email);
          allLeads = agencyLeads || [];
        }

        setLeads(allLeads);
        setDashboardData({
          ...(dashboardData || {
            admins: [],
            resources: [],
            courses: [],
            downloads: [],
            eventCalendars: [],
            profiles: [],
            promotions: [],
            services: [],
            users: [],
            myProfile: null,
          }),
          leads: allLeads,
        });
      } catch (err) {
        console.error("Sales data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dashboardData, setDashboardData, userId]);

  // Filter by date
  const filterByDateRange = (data: ILead[], range: string) => {
    const now = new Date();
    let from: Date;

    if (range === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return data.filter((item) => {
        const date = new Date(item.updatedAt || item.createdAt);
        return date >= start && date <= end;
      });
    }

    switch (range) {
      case "week":
        from = subWeeks(now, 1);
        break;
      case "month":
        from = subMonths(now, 1);
        break;
      case "quarter":
        from = subQuarters(now, 1);
        break;
      case "year":
        from = subYears(now, 1);
        break;
      default:
        return data;
    }

    return data.filter((item) => {
      const date = new Date(item.updatedAt || item.createdAt);
      return date >= from;
    });
  };

  const paidLeads = leads.filter((l) => l.paymentStatus === "Accepted");
  const filteredLeads = filterByDateRange(paidLeads, filter).filter((l) =>
    country === "All" ? true : l.home.country?.trim() === country
  );

  const parseNumber = (value: string | undefined) =>
    parseFloat((value || "0").toString().replace(/,/g, "").trim()) || 0;

  const totalSales = filteredLeads.reduce((sum, lead) => {
    const courseAmount = Array.isArray(lead.course)
      ? lead.course.reduce((sum, s) => sum + Number(s.courseFee || 0), 0)
      : 0;
    const discount = parseNumber(lead.discount);
    const servicesTotal = Array.isArray(lead.services)
      ? lead.services.reduce((acc, s) => acc + parseNumber(s.amount), 0)
      : 0;
    return sum + courseAmount + servicesTotal - discount;
  }, 0);

  const salesByCountry: Record<string, number> = {};
  filteredLeads.forEach((lead) => {
    const countryKey = lead.home.country?.trim() || "Unknown";
    const courseAmount = Array.isArray(lead.course)
      ? lead.course.reduce((sum, s) => sum + Number(s.courseFee || 0), 0)
      : 0;
    const discount = parseNumber(lead.discount);
    const servicesTotal = Array.isArray(lead.services)
      ? lead.services.reduce((acc, s) => acc + parseNumber(s.amount), 0)
      : 0;
    const grandTotal = courseAmount + servicesTotal - discount;

    salesByCountry[countryKey] = (salesByCountry[countryKey] || 0) + grandTotal;
  });

  const salesOverTime: Record<string, number> = {};
  filteredLeads.forEach((lead) => {
    const date = format(
      new Date(lead.updatedAt || lead.createdAt),
      "yyyy-MM-dd"
    );
    const courseAmount = Array.isArray(lead.course)
      ? lead.course.reduce((sum, s) => sum + Number(s.courseFee || 0), 0)
      : 0;
    const discount = parseNumber(lead.discount);
    const servicesTotal = Array.isArray(lead.services)
      ? lead.services.reduce((acc, s) => acc + parseNumber(s.amount), 0)
      : 0;
    const grandTotal = courseAmount + servicesTotal - discount;

    salesOverTime[date] = (salesOverTime[date] || 0) + grandTotal;
  });

  const sortedSalesOverTime = Object.keys(salesOverTime)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .reduce((acc: Record<string, number>, key) => {
      acc[key] = salesOverTime[key];
      return acc;
    }, {});

  const countries = Array.from(
    new Set(paidLeads.map((l) => l.home.country?.trim() || "Unknown"))
  );

  const handleResetFilters = () => {
    setFilter("month");
    setStartDate("");
    setEndDate("");
    setCountry("All");
  };

  // Show skeleton if loading OR no data
  if (loading || leads.length === 0) {
    return <Skeleton />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Sales & Performance Analytics
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-blue-50 dark:bg-gray-800 p-4 rounded-2xl shadow">
        <select
          className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-500 text-gray-800 dark:text-gray-200"
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
          <option value="custom">Custom Range</option>
        </select>

        {filter === "custom" && (
          <>
            <input
              type="date"
              className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-500 text-gray-800 dark:text-gray-200"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-500 text-gray-800 dark:text-gray-200"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </>
        )}

        <select
          className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-500 text-gray-800 dark:text-gray-200"
          onChange={(e) => setCountry(e.target.value)}
          value={country}
        >
          <option value="All">All Locations</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-2xl hover:bg-red-600 dark:hover:bg-red-700 transition"
          onClick={handleResetFilters}
        >
          Reset Filters
        </button>
      </div>

      {/* Total Sales */}
      <div className="bg-green-50 dark:bg-gray-800 shadow rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Total Sales
        </h2>
        <p className="text-3xl font-bold mt-2 text-indigo-600 dark:text-indigo-400">
          €{totalSales.toLocaleString()}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sales by Country */}
        <div className="md:w-2/5 w-full">
          <div className="bg-purple-50 dark:bg-gray-800 shadow rounded-2xl p-6 h-full min-h-[400px] flex items-center justify-center">
            {Object.keys(salesByCountry).length === 0 ? (
              <Skeleton />
            ) : (
              <Pie
                data={{
                  labels: Object.keys(salesByCountry),
                  datasets: [
                    {
                      data: Object.values(salesByCountry),
                      backgroundColor: [
                        "#1E90FF",
                        "#28A745",
                        "#FFC107",
                        "#FD7E14",
                        "#6610F2",
                        "#20C997",
                        "#DC3545",
                        "#17A2B8",
                        "#FF6384",
                        "#36A2EB",
                      ],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { labels: { color: "#6B7280" } },
                    title: { color: "#6B7280" },
                    tooltip: {
                      titleColor: "#6B7280",
                      bodyColor: "#6B7280",
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Sales Over Time */}
        <div className="md:w-3/5 w-full">
          <div className="bg-orange-50 dark:bg-gray-800 shadow rounded-2xl p-6 h-full flex items-center justify-center">
            {Object.keys(sortedSalesOverTime).length === 0 ? (
              <Skeleton />
            ) : (
              <Line
                data={{
                  labels: Object.keys(sortedSalesOverTime),
                  datasets: [
                    {
                      label: "Sales (€)",
                      data: Object.values(sortedSalesOverTime),
                      borderColor: "#4C51BF",
                      backgroundColor: "rgba(76,81,191,0.2)",
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  scales: {
                    x: {
                      type: "time",
                      time: { unit: "day", tooltipFormat: "MMM d" },
                      title: {
                        display: true,
                        text: "Date",
                        color: "#6B7280",
                      },
                      ticks: { color: "#6B7280" },
                      grid: { color: "rgba(255,255,255,0.1)" },
                    },
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Sales (€)",
                        color: "#6B7280",
                      },
                      ticks: { color: "#6B7280" },
                      grid: { color: "rgba(255,255,255,0.1)" },
                    },
                  },
                  plugins: {
                    legend: { labels: { color: "#6B7280" } },
                    tooltip: {
                      titleColor: "#6B7280",
                      bodyColor: "#6B7280",
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
