"use client";

import { useEffect, useState, useMemo } from "react";
import "chartjs-adapter-date-fns";
import { subWeeks, subMonths, subQuarters, subYears } from "date-fns";
import { ILead } from "@/lib/database/models/lead.model";
import { useDashboardData } from "@/components/shared/DashboardProvider";

const Skeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 w-1/3 bg-gray-300 dark:bg-gray-800 rounded"></div>
    <div className="flex flex-wrap gap-4 bg-blue-50 dark:bg-gray-800 p-4 rounded-2xl shadow">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-10 w-32 bg-gray-300 dark:bg-gray-500 rounded"></div>
      ))}
    </div>
    <div className="bg-green-50 dark:bg-gray-800 shadow rounded-2xl p-6">
      <div className="h-6 w-32 bg-gray-300 dark:bg-gray-500 rounded mb-4"></div>
      <div className="h-10 w-24 bg-gray-300 dark:bg-gray-500 rounded"></div>
    </div>
  </div>
);

interface SalesDashboardProps {
  leads?: ILead[];
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ leads = [] }) => {
  const { dashboardData } = useDashboardData();

  const [filter, setFilter] = useState("month");
  const [country, setCountry] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Prefer context data, fallback to props
  const allLeads = useMemo(
    () => dashboardData?.leads?.length ? dashboardData.leads : leads,
    [dashboardData?.leads, leads]
  );

  // ✅ Stop loading only after we have leads
  useEffect(() => {
    if (allLeads?.length > 0) setLoading(false);
  }, [allLeads]);

  // ✅ Memoized filter logic
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

    return (allLeads || [])
      .filter((l) => l.paymentStatus === "Accepted")
      .filter((l) => {
        const date = new Date(l.updatedAt || l.createdAt);
        if (filter === "custom" && startDate && endDate) {
          return date >= new Date(startDate) && date <= new Date(endDate);
        }
        return !rangeStart || date >= rangeStart;
      })
      .filter((l) => (country === "All" ? true : l.home.country === country));
  }, [allLeads, filter, startDate, endDate, country]);

  const parseNumber = (v?: string) =>
    parseFloat((v || "0").replace(/,/g, "").trim()) || 0;

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

  const countries = useMemo(
    () =>
      Array.from(
        new Set((allLeads || []).map((l) => l.home.country || "Unknown"))
      ),
    [allLeads]
  );

  const handleResetFilters = () => {
    setFilter("month");
    setCountry("All");
    setStartDate("");
    setEndDate("");
  };

  const getFilterText = (value: string) => {
    switch (value) {
      case "week": return "This Week";
      case "month": return "This Month";
      case "quarter": return "This Quarter";
      case "year": return "This Year";
      case "all": return "All Time";
      case "custom": return "Custom Range";
      default: return "This Month";
    }
  };

  const salesCountries = Object.keys(salesByCountry);
  const colorMap: Record<string, string> = {
    Australia: "bg-purple-500",
    Bangladesh: "bg-orange-500",
    Ireland: "bg-blue-500",
  };

  if (loading) return <Skeleton />;

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Sales & Performance Analytics
        </h1>
        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-8 text-sm font-semibold focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg
                className="fill-current h-4 w-4 text-gray-700 dark:text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Country dropdown */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-8 text-sm font-semibold focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={(e) => setCountry(e.target.value)}
              value={country}
            >
              <option value="All">All Locations</option>
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg
                className="fill-current h-4 w-4 text-gray-700 dark:text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Custom range */}
      {filter === "custom" && (
        <div className="flex gap-4 mb-6 items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl shadow">
          <label className="text-gray-700 dark:text-gray-300">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-4 py-2 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
          />
          <label className="text-gray-700 dark:text-gray-300">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-4 py-2 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            onClick={handleResetFilters}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Reset
          </button>
        </div>
      )}

      {/* Map placeholder */}
      <div className="relative bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-4 mb-6 overflow-hidden">
        <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl relative">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Map Visualization Placeholder</p>
            <p className="text-xs">(Connecting leads between locations/agencies)</p>
          </div>

          <div
            className="absolute p-4 rounded-xl shadow-2xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
            style={{ top: "45%", left: "55%" }}
          >
            <p className="text-sm font-light text-gray-600 dark:text-gray-300 mb-1">
              Total Sales
            </p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-black dark:text-white">
                €{totalSales.toLocaleString()}
              </span>
              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                {getFilterText(filter).replace("This ", "")}
              </span>
            </div>
            {salesCountries.length > 0 && (
              <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                Data for {salesCountries[0]}
              </p>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {salesCountries.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No sales data for the current filters.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {salesCountries.slice(0, 3).map((c) => (
                <div key={c} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-4 w-4 rounded-full ${colorMap[c] || "bg-gray-500"}`}
                    ></span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {c}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
