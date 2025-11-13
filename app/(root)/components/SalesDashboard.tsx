"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { ILead } from "@/lib/database/models/lead.model";
import { useDashboardData } from "@/components/shared/DashboardProvider";
import { subWeeks, subMonths, subQuarters, subYears } from "date-fns";

import { Chart, registerables } from "chart.js";
import { ChoroplethController, GeoFeature, ColorScale } from "chartjs-chart-geo";
import * as topojson from "topojson-client";
import type { FeatureCollection, Geometry, Feature } from "geojson";

Chart.register(...registerables, ChoroplethController, GeoFeature, ColorScale);

interface SalesDashboardProps {
  leads: ILead[];
}

interface SalesByCountry {
  [country: string]: number;
}

// Define a proper type for country properties
interface CountryProperties {
  name: string;
  [key: string]: unknown; // any extra fields from topojson
}

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

const SalesDashboard: React.FC<SalesDashboardProps> = ({ leads = [] }) => {
  const { dashboardData } = useDashboardData();
  const [filter, setFilter] = useState<string>("month");
  const [country, setCountry] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const allLeads = useMemo<ILead[]>(
    () => (dashboardData?.leads?.length ? dashboardData.leads : leads),
    [dashboardData?.leads, leads]
  );

  useEffect(() => {
    if (allLeads.length > 0) setLoading(false);
  }, [allLeads]);

  const parseNumber = (v?: string): number =>
    parseFloat((v || "0").replace(/,/g, "").trim()) || 0;

  const filteredLeads = useMemo<ILead[]>(() => {
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

    return allLeads
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

  const salesByCountry = useMemo<SalesByCountry>(() => {
    const result: SalesByCountry = {};
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

  const countriesList = useMemo<string[]>(
    () => Array.from(new Set(allLeads.map((l) => l.home.country || "Unknown"))),
    [allLeads]
  );

  // Render Chart.js choropleth map
  useEffect(() => {
    if (!canvasRef.current) return;

    fetch("https://unpkg.com/world-atlas/countries-50m.json")
      .then((res) => res.json())
      .then((data) => {
        const geoData = topojson.feature(
          data,
          data.objects.countries
        ) as unknown as FeatureCollection<Geometry, CountryProperties>;

        const features: Feature<Geometry, CountryProperties>[] = geoData.features;

        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        new Chart(ctx, {
          type: "choropleth",
          data: {
            labels: features.map((f) => f.properties.name),
            datasets: [
              {
                label: "Sales",
                outline: features,
                data: features.map((f) => ({
                  feature: f,
                  value: salesByCountry[f.properties.name] || 0,
                })),
              },
            ],
          },
          options: {
            showOutline: true,
            showGraticule: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function (ctx) {
                    const country = ctx.label;
                    const value = (ctx.raw as { value: number }).value;
                    return `${country}: €${value.toLocaleString()}`;
                  },
                },
              },
            },
            scales: {
              xy: { projection: "equalEarth" },
            },
          },
        });
      });
  }, [salesByCountry]);

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
            {countriesList.map((c) => (
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
        <canvas ref={canvasRef} style={{ width: "100%", height: "500px" }} />

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
