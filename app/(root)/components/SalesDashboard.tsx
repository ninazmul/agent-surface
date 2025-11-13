"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { ILead } from "@/lib/database/models/lead.model";
import { useDashboardData } from "@/components/shared/DashboardProvider";
import countriesData from "world-countries"; // npm install world-countries
import { subWeeks, subMonths, subQuarters, subYears } from "date-fns";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

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
  const { dashboardData } = useDashboardData();
  const [filter, setFilter] = useState("month");
  const [country, setCountry] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  const allLeads = useMemo(
    () => (dashboardData?.leads?.length ? dashboardData.leads : leads),
    [dashboardData?.leads, leads]
  );

  useEffect(() => {
    if (allLeads?.length > 0) setLoading(false);
  }, [allLeads]);

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

  const countryCoords = useMemo(() => {
    const map: Record<string, [number, number]> = {};
    Object.keys(salesByCountry).forEach((c) => {
      const countryInfo = countriesData.find(
        (cd) => cd.name.common.toLowerCase() === c.toLowerCase()
      );
      if (countryInfo) {
        const [lat, lon] = countryInfo.latlng;
        map[c] = [lon, lat];
      } else {
        map[c] = [0, 0];
      }
    });
    return map;
  }, [salesByCountry]);

  const countries = useMemo(
    () => Array.from(new Set(allLeads.map((l) => l.home.country || "Unknown"))),
    [allLeads]
  );

  if (loading) return <Skeleton />;

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Sales & Performance Analytics
        </h1>
        <div className="flex items-center gap-2">
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

          <button
            onClick={() => {
              setFilter("month");
              setCountry("All");
              setStartDate("");
              setEndDate("");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Reset
          </button>
        </div>
      </div>

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
        </div>
      )}

      {/* Map */}
      <div className="relative bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-4 mb-6 overflow-hidden">
        <ComposableMap
          projectionConfig={{ scale: 160 }}
          width={980}
          height={500}
          className="w-full h-[500px]"
        >
          <ZoomableGroup center={[0, 20]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#EAEAEC"
                    stroke="#D6D6DA"
                    className="dark:fill-gray-800 dark:stroke-gray-700"
                  />
                ))
              }
            </Geographies>

            {Object.keys(salesByCountry).map((c) => {
              const coords = countryCoords[c] || [0, 0];
              const total = salesByCountry[c];
              const radius = Math.min(20, Math.max(5, total / 2000));
              return (
                <Marker key={c} coordinates={coords}>
                  <circle
                    data-tooltip-id="map-tooltip"
                    data-tooltip-content={`${c}: €${total.toLocaleString()}`}
                    r={radius}
                    fill="#FF5733"
                    stroke="#fff"
                    strokeWidth={1.5}
                    className="cursor-pointer transition-transform hover:scale-125"
                  />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        <Tooltip id="map-tooltip" place="top" />

        {/* Top Countries Legend */}
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(salesByCountry)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([c, total]) => (
              <div
                key={c}
                className="px-3 py-1 bg-blue-100 dark:bg-gray-700 rounded-lg text-sm font-semibold"
              >
                {c}: €{total.toLocaleString()}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
