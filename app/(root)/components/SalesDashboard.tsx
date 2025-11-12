"use client";

import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { subWeeks, subMonths, subQuarters, subYears } from "date-fns";
import { ILead } from "@/lib/database/models/lead.model";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Country coordinates
const countryLatLong: Record<string, [number, number]> = {
  Bangladesh: [23.685, 90.3563],
  India: [20.5937, 78.9629],
  USA: [37.0902, -95.7129],
  UK: [55.3781, -3.436],
  Unknown: [0, 0],
};

interface SalesDashboardProps {
  leads?: ILead[];
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ leads = [] }) => {
  const [filter, setFilter] = useState("month");
  const [country, setCountry] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

    return leads
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

  const totalSales = useMemo(() => {
    return filteredLeads.reduce((sum, lead) => {
      const courseTotal = Array.isArray(lead.course)
        ? lead.course.reduce((s, c) => s + Number(c.courseFee || 0), 0)
        : 0;
      const servicesTotal = Array.isArray(lead.services)
        ? lead.services.reduce((s, c) => s + parseNumber(c.amount), 0)
        : 0;
      const discount = parseNumber(lead.discount);
      return sum + courseTotal + servicesTotal - discount;
    }, 0);
  }, [filteredLeads]);

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

  const top3Countries = useMemo(() => {
    return Object.entries(salesByCountry)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([c]) => c);
  }, [salesByCountry]);

  const countries = useMemo(
    () => Array.from(new Set(leads.map((l) => l.home.country || "Unknown"))),
    [leads]
  );

  const handleResetFilters = () => {
    setFilter("month");
    setCountry("All");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
        Sales & Performance Analytics
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg bg-white dark:bg-gray-700"
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
              className="border px-4 py-2 rounded-lg bg-white dark:bg-gray-700"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-4 py-2 rounded-lg bg-white dark:bg-gray-700"
            />
          </>
        )}

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="border px-4 py-2 rounded-lg bg-white dark:bg-gray-700"
        >
          <option value="All">All Locations</option>
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={handleResetFilters}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Reset
        </button>
      </div>

      {/* Total Sales */}
      <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg mb-6 shadow">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200">
          Total Sales
        </h2>
        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          €{totalSales.toLocaleString()}
        </p>
      </div>

      {/* World Map */}
      <div className="w-full h-[500px] relative">
        <ComposableMap>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#EAEAEC"
                  stroke="#D6D6DA"
                  className="transition-all duration-300 hover:fill-indigo-400"
                />
              ))
            }
          </Geographies>

          {/* Render markers only if there are sales */}
          {Object.entries(salesByCountry).length > 0 &&
            Object.entries(salesByCountry).map(([c, value]) => {
              const coords = countryLatLong[c] || [0, 0];
              const isTop3 = top3Countries.includes(c);
              return (
                <Marker key={c} coordinates={coords}>
                  <circle
                    r={isTop3 ? 12 : 6}
                    fill={isTop3 ? "#FF5722" : "#4C51BF"}
                    stroke="#fff"
                    strokeWidth={1}
                    data-tip={`${c}: €${value.toLocaleString()}`}
                  />
                </Marker>
              );
            })}
        </ComposableMap>
        <Tooltip id="tooltip" />
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4">
        {top3Countries.map((c, i) => (
          <div key={c} className="flex items-center gap-2">
            <span
              className={`h-4 w-4 rounded-full ${
                i === 0
                  ? "bg-red-500"
                  : i === 1
                  ? "bg-orange-500"
                  : "bg-yellow-500"
              }`}
            ></span>
            <span className="text-gray-800 dark:text-gray-200 font-semibold">
              {c}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesDashboard;
