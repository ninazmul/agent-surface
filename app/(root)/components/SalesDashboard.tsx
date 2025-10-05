"use client";

import { useEffect, useState, useRef } from "react";
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
import { getLeadsByAgency } from "@/lib/actions/lead.actions";
import { useDashboardData } from "@/components/shared/DashboardProvider";
import { getDashboardLeads } from "@/lib/actions/dashboard.actions";

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

// Reusable skeleton
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  const { dashboardData, setDashboardData } = useDashboardData();
  const initialized = useRef(false);

  // Utility: Filter leads by date
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

  const parseNumber = (val: string | number | undefined) =>
    parseFloat((val || "0").toString().replace(/,/g, "").trim()) || 0;

  const paidLeads = leads.filter((l) => l.paymentStatus === "Accepted");
  const filteredLeads = filterByDateRange(paidLeads, filter).filter((l) =>
    country === "All" ? true : l.home.country?.trim() === country
  );

  useEffect(() => {
    if (!userId || initialized.current) return;
    initialized.current = true;

    const loadInstantData = async () => {
      // 🔹 Use cached data instantly
      if (dashboardData?.leads?.length) {
        setLeads(dashboardData.leads);
        setLoading(false);
      }

      // 🔹 Fetch fresh data in background (non-blocking)
      const fetchFreshData = async () => {
        try {
          const [userRecord, dashboardLeads] = await Promise.all([
            getUserByClerkId(userId),
            getDashboardLeads(userId),
          ]);

          const email = await getUserEmailById(userRecord);
          const [adminStatus, adminCountries] = await Promise.all([
            isAdmin(email),
            getAdminCountriesByEmail(email),
          ]);

          let freshLeads: ILead[] = [];
          if (adminStatus) {
            freshLeads =
              adminCountries.length === 0
                ? dashboardLeads
                : dashboardLeads.filter((l: ILead) =>
                    adminCountries.includes(l.home.country)
                  );
          } else {
            const agencyLeads = await getLeadsByAgency(email);
            freshLeads = agencyLeads || [];
          }

          setLeads(freshLeads);
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
            leads: filteredLeads,
          });
        } catch (err) {
          console.error("Error fetching leads:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchFreshData();
    };

    loadInstantData();
  }, [userId, dashboardData, setDashboardData, filteredLeads]);

  const totalSales = filteredLeads.reduce((sum, lead) => {
    const courseAmount = Array.isArray(lead.course)
      ? lead.course.reduce((s, c) => s + Number(c.courseFee || 0), 0)
      : 0;
    const discount = parseNumber(lead.discount);
    const servicesTotal = Array.isArray(lead.services)
      ? lead.services.reduce((a, s) => a + parseNumber(s.amount), 0)
      : 0;
    return sum + courseAmount + servicesTotal - discount;
  }, 0);

  const salesByCountry: Record<string, number> = {};
  filteredLeads.forEach((l) => {
    const c = l.home.country?.trim() || "Unknown";
    const total =
      (Array.isArray(l.course)
        ? l.course.reduce((s, c) => s + Number(c.courseFee || 0), 0)
        : 0) +
      (Array.isArray(l.services)
        ? l.services.reduce((a, s) => a + parseNumber(s.amount), 0)
        : 0) -
      parseNumber(l.discount);
    salesByCountry[c] = (salesByCountry[c] || 0) + total;
  });

  const salesOverTime: Record<string, number> = {};
  filteredLeads.forEach((l) => {
    const date = format(new Date(l.updatedAt || l.createdAt), "yyyy-MM-dd");
    const total =
      (Array.isArray(l.course)
        ? l.course.reduce((s, c) => s + Number(c.courseFee || 0), 0)
        : 0) +
      (Array.isArray(l.services)
        ? l.services.reduce((a, s) => a + parseNumber(s.amount), 0)
        : 0) -
      parseNumber(l.discount);
    salesOverTime[date] = (salesOverTime[date] || 0) + total;
  });

  const sortedSalesOverTime = Object.keys(salesOverTime)
    .sort()
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

  if (loading && !leads.length) return <Skeleton />;

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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-500 text-gray-800 dark:text-gray-200"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-500 text-gray-800 dark:text-gray-200"
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
          onClick={handleResetFilters}
          className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-2xl hover:bg-red-600 dark:hover:bg-red-700 transition"
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
        {/* Pie Chart */}
        <div className="md:w-2/5 w-full">
          <div className="bg-purple-50 dark:bg-gray-800 shadow rounded-2xl p-6 h-full min-h-[400px] flex items-center justify-center">
            {Object.keys(salesByCountry).length ? (
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
                      ],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { labels: { color: "#6B7280" } },
                  },
                }}
              />
            ) : (
              <Skeleton />
            )}
          </div>
        </div>

        {/* Line Chart */}
        <div className="md:w-3/5 w-full">
          <div className="bg-orange-50 dark:bg-gray-800 shadow rounded-2xl p-6 h-full flex items-center justify-center">
            {Object.keys(sortedSalesOverTime).length ? (
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
                      ticks: { color: "#6B7280" },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { color: "#6B7280" },
                    },
                  },
                }}
              />
            ) : (
              <Skeleton />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
