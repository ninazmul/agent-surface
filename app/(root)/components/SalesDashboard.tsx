"use client";

import { useEffect, useState, useMemo } from "react";
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

const Skeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 w-1/3 bg-gray-300 dark:bg-gray-800 rounded"></div>
    <div className="flex flex-wrap gap-4 bg-blue-50 dark:bg-gray-800 p-4 rounded-2xl shadow">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-10 w-32 bg-gray-300 dark:bg-gray-500 rounded"
        ></div>
      ))}
    </div>
    <div className="bg-green-50 dark:bg-gray-800 shadow rounded-2xl p-6">
      <div className="h-6 w-32 bg-gray-300 dark:bg-gray-500 rounded mb-4"></div>
      <div className="h-10 w-24 bg-gray-300 dark:bg-gray-500 rounded"></div>
    </div>
  </div>
);

interface SalesDashboardProps {
  leads: ILead[];
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ leads = [] }) => {
  const { user } = useUser();
  const userId = user?.id || "";
  const [filter, setFilter] = useState("month");
  const [country, setCountry] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const { dashboardData, setDashboardData } = useDashboardData();

  // ✅ Fetch leads only once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userID = await getUserByClerkId(userId);
        const email = await getUserEmailById(userID);
        const adminStatus = await isAdmin(email);
        const adminCountries = await getAdminCountriesByEmail(email);

        const fetchedLeads = await getAllLeads();
        let allLeads: ILead[] = [];

        if (adminStatus) {
          allLeads =
            adminCountries.length === 0
              ? fetchedLeads
              : fetchedLeads.filter((l: ILead) =>
                  adminCountries.includes(l.home.country)
                );
        } else {
          allLeads = await getLeadsByAgency(email);
        }

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

    if (!dashboardData?.leads?.length) fetchData();
    else setLoading(false);
  }, [dashboardData, setDashboardData, userId]);

  // ✅ Date filter logic (memoized)
  const filteredLeads = useMemo(() => {
    const now = new Date();
    const rangeStart =
      filter === "week"
        ? subWeeks(now, 1)
        : filter === "month"
        ? subMonths(now, 1)
        : filter === "quarter"
        ? subQuarters(now, 1)
        : filter === "year"
        ? subYears(now, 1)
        : null;

    return (leads || [])
      .filter((l) => l.paymentStatus === "Accepted")
      .filter((l) => {
        const date = new Date(l.updatedAt || l.createdAt);
        if (filter === "custom" && startDate && endDate) {
          return date >= new Date(startDate) && date <= new Date(endDate);
        }
        return !rangeStart || date >= rangeStart;
      })
      .filter((l) => (country === "All" ? true : l.home.country === country));
  }, [leads, filter, startDate, endDate, country]);

  // ✅ Helper
  const parseNumber = (v?: string) =>
    parseFloat((v || "0").replace(/,/g, "").trim()) || 0;

  // ✅ Compute total sales fast (memoized)
  const totalSales = useMemo(
    () =>
      filteredLeads.reduce((sum, lead) => {
        const courseTotal = Array.isArray(lead.course)
          ? lead.course.reduce((s, c) => s + Number(c.courseFee || 0), 0)
          : 0;
        const servicesTotal = Array.isArray(lead.services)
          ? lead.services.reduce((s, c) => s + parseNumber(c.amount), 0)
          : 0;
        const discount = parseNumber(lead.discount);
        return sum + courseTotal + servicesTotal - discount;
      }, 0),
    [filteredLeads]
  );

  // ✅ Sales by country (memoized)
  const salesByCountry = useMemo(() => {
    const result: Record<string, number> = {};
    filteredLeads.forEach((lead) => {
      const c = lead.home.country?.trim() || "Unknown";
      const courseTotal = Array.isArray(lead.course)
        ? lead.course.reduce((s, c2) => s + Number(c2.courseFee || 0), 0)
        : 0;
      const servicesTotal = Array.isArray(lead.services)
        ? lead.services.reduce((s, c2) => s + parseNumber(c2.amount), 0)
        : 0;
      const discount = parseNumber(lead.discount);
      result[c] = (result[c] || 0) + courseTotal + servicesTotal - discount;
    });
    return result;
  }, [filteredLeads]);

  // ✅ Sales over time (memoized)
  const sortedSalesOverTime = useMemo(() => {
    const daily: Record<string, number> = {};
    filteredLeads.forEach((lead) => {
      const d = format(
        new Date(lead.updatedAt || lead.createdAt),
        "yyyy-MM-dd"
      );
      const courseTotal = Array.isArray(lead.course)
        ? lead.course.reduce((s, c) => s + Number(c.courseFee || 0), 0)
        : 0;
      const servicesTotal = Array.isArray(lead.services)
        ? lead.services.reduce((s, c) => s + parseNumber(c.amount), 0)
        : 0;
      const discount = parseNumber(lead.discount);
      daily[d] = (daily[d] || 0) + courseTotal + servicesTotal - discount;
    });
    return Object.keys(daily)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .reduce((acc, k) => {
        acc[k] = daily[k];
        return acc;
      }, {} as Record<string, number>);
  }, [filteredLeads]);

  const countries = useMemo(
    () =>
      Array.from(
        new Set((leads || []).map((l) => l.home.country || "Unknown"))
      ),
    [leads]
  );

  const handleResetFilters = () => {
    setFilter("month");
    setCountry("All");
    setStartDate("");
    setEndDate("");
  };

  // ✅ Default 0 view
  if (loading) return <Skeleton />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Sales & Performance Analytics
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-blue-50 dark:bg-gray-800 p-4 rounded-2xl shadow">
        <select
          className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-500"
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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-500"
            />
          </>
        )}

        <select
          className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-500"
          onChange={(e) => setCountry(e.target.value)}
          value={country}
        >
          <option value="All">All Locations</option>
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={handleResetFilters}
          className="bg-red-500 text-white px-4 py-2 rounded-2xl hover:bg-red-600"
        >
          Reset
        </button>
      </div>

      {/* Total Sales */}
      <div className="bg-green-50 dark:bg-gray-800 shadow rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Total Sales
        </h2>
        <p className="text-3xl font-bold mt-2 text-indigo-600 dark:text-indigo-400">
          €{totalSales.toLocaleString() || 0}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Pie */}
        <div className="md:w-2/5 w-full">
          <div className="bg-purple-50 dark:bg-gray-800 shadow rounded-2xl p-6 h-full flex items-center justify-center">
            {Object.keys(salesByCountry).length === 0 ? (
              <p>No data</p>
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
                      ],
                    },
                  ],
                }}
              />
            )}
          </div>
        </div>

        {/* Line */}
        <div className="md:w-3/5 w-full">
          <div className="bg-orange-50 dark:bg-gray-800 shadow rounded-2xl p-6 h-full flex items-center justify-center">
            {Object.keys(sortedSalesOverTime).length === 0 ? (
              <p>No data</p>
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
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
