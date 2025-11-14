"use client";

import { useEffect, useState, useMemo } from "react";
import "chartjs-adapter-date-fns";
import { subWeeks, subMonths, subQuarters, subYears } from "date-fns";
import { ILead } from "@/lib/database/models/lead.model";
import { useUser } from "@clerk/nextjs";
import { getUserByClerkId, getUserEmailById } from "@/lib/actions/user.actions";
import { getAdminCountriesByEmail, isAdmin } from "@/lib/actions/admin.actions";
import { getAllLeads, getLeadsByAgency } from "@/lib/actions/lead.actions";
import { useDashboardData } from "@/components/shared/DashboardProvider";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { Info } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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
  const { dashboardData, setDashboardData } = useDashboardData();

  // Fetch leads data
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
          ...(dashboardData || {}),
          leads: allLeads,
        });
      } catch (err) {
        console.error("Sales data load error:", err);
      }
    };

    if (!dashboardData?.leads?.length) fetchData();
  }, [dashboardData, setDashboardData, userId]);

  // Filtered leads based on date and country
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

  const parseNumber = (v?: string) =>
    parseFloat((v || "0").replace(/,/g, "").trim()) || 0;

  // Total sales calculation
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

  // Sales by country
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

  const getFilterText = (value: string) => {
    switch (value) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "quarter":
        return "This Quarter";
      case "year":
        return "This Year";
      case "all":
        return "All Time";
      case "custom":
        return "Custom Range";
      default:
        return "This Month";
    }
  };

  // Top 3 countries for legend
  const salesCountries = Object.keys(salesByCountry).sort(
    (a, b) => (salesByCountry[b] || 0) - (salesByCountry[a] || 0)
  );
  const top3Countries = salesCountries.slice(0, 3);
  const colors = ["#7C3AED", "#F97316", "#3B82F6"];
  const colorMap: Record<string, string> = {};
  top3Countries.forEach(
    (c, idx) => (colorMap[c] = colors[idx % colors.length])
  );

  return (
    <div className="p-4">
      {/* Header & Filters */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Sales & Performance Analytics
        </h1>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-2xl py-2 pl-4 pr-8 text-sm font-semibold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
          </div>
          {/* Country */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-2xl py-2 pl-4 pr-8 text-sm font-semibold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={(e) => setCountry(e.target.value)}
              value={country}
            >
              <option value="All">All Locations</option>
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Custom Range Inputs */}
      {filter === "custom" && (
        <div className="flex gap-4 mb-6 items-center p-4 rounded-xl shadow bg-gray-50 dark:bg-gray-900">
          <label>From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-4 py-2 rounded-2xl"
          />
          <label>To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-4 py-2 rounded-2xl"
          />
          <button
            onClick={handleResetFilters}
            className="bg-black text-white px-4 py-2 rounded-2xl"
          >
            Reset
          </button>
        </div>
      )}

      {/* Interactive World Map */}
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mb-6 overflow-visible relative">
        <ComposableMap projectionConfig={{ scale: 160 }} className="h-[300px]">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties.NAME;

                // Find matching lead country (case-insensitive trim match)
                const leadCountry = Object.keys(salesByCountry).find(
                  (c) => c.toLowerCase().trim() === geoName.toLowerCase().trim()
                );

                const sales = leadCountry ? salesByCountry[leadCountry] : 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      leadCountry
                        ? colorMap[leadCountry] || "#E5E7EB"
                        : "#E5E7EB"
                    }
                    stroke="#fff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        opacity: 0.8,
                        cursor: "pointer",
                      },
                      pressed: { outline: "none" },
                    }}
                    data-tooltip-id="world-map-tooltip"
                    data-tooltip-content={`${geoName}: €${sales.toLocaleString()}`}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Total Sales Overlay */}
        <div
          className="absolute p-4 rounded-xl shadow-xl bg-white dark:bg-gray-700"
          style={{ top: "10%", left: "70%" }}
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Total Sales
          </p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">
              €{totalSales.toLocaleString()}
            </span>
            <span className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
              {getFilterText(filter).replace("This ", "")}
            </span>
          </div>
        </div>
        <Tooltip id="world-map-tooltip" place="top" className="z-50" />
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4">
        {salesCountries.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No sales data for current filters.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {top3Countries.map((c) => (
              <div key={c} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: colorMap[c] || "#6B7280" }}
                  ></span>
                  <span className="font-semibold">{c}</span>
                </div>
                <button
                  data-tooltip-id={`tooltip-${c}`}
                  data-tooltip-content={`Total sales in ${c}: €${salesByCountry[
                    c
                  ].toLocaleString()}`}
                  className="p-1"
                >
                  <Info className="text-black h-4 w-4" />
                </button>
                <Tooltip id={`tooltip-${c}`} place="top" className="z-50" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;
