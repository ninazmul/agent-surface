"use client";

import React, { useState, useMemo, useCallback } from "react";
import { IProfile } from "@/lib/database/models/profile.model";
import { ILead } from "@/lib/database/models/lead.model";
import { subWeeks, subMonths, subQuarters, subYears } from "date-fns";

interface CountrySalesTargetsProps {
  adminStatus: boolean;
  profiles: IProfile[];
  leads: ILead[];
  myProfile?: IProfile | null;
}

const CountrySalesTargets: React.FC<CountrySalesTargetsProps> = ({
  adminStatus,
  profiles,
  leads,
  myProfile,
}) => {
  const [filter, setFilter] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedAgency, setSelectedAgency] = useState("All");

  const parseNumber = (value: string | number | undefined) =>
    parseFloat((value || 0).toString().replace(/,/g, "").trim()) || 0;

  // SAFETY CLEANUP: remove invalid leads
  const safeLeads = useMemo(() => {
    return (leads || [])
      .filter((l) => l && typeof l === "object")
      .filter((l) => l.createdAt || l.updatedAt)
      .filter((l) => l.home && l.home.country);
  }, [leads]);

  // DATE FILTERING
  const filterByDateRange = useCallback(
    (data: ILead[]) => {
      return data.filter((lead) => {
        const ts = lead.updatedAt || lead.createdAt;
        if (!ts) return false;

        const date = new Date(ts);
        if (isNaN(date.getTime())) return false;

        if (filter === "custom" && startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          return date >= start && date <= end;
        }

        const now = new Date();
        const ranges: Record<string, Date> = {
          week: subWeeks(now, 1),
          month: subMonths(now, 1),
          quarter: subQuarters(now, 1),
          year: subYears(now, 1),
        };

        const from = ranges[filter];
        return from ? date >= from : true;
      });
    },
    [filter, startDate, endDate]
  );

  // FILTERED LEADS
  const filteredLeads = useMemo(() => {
    const accepted = safeLeads.filter((l) => l.paymentStatus === "Accepted");

    const dateFiltered = adminStatus ? filterByDateRange(accepted) : accepted;

    return dateFiltered.filter((l) => {
      const country = l.home?.country?.trim();
      if (!country) return false;

      const countryMatch =
        selectedCountry === "All" ? true : country === selectedCountry;

      const agencyMatch =
        selectedAgency === "All" ? true : l.author === selectedAgency;

      return adminStatus
        ? countryMatch && agencyMatch
        : country === myProfile?.country;
    });
  }, [
    safeLeads,
    adminStatus,
    filterByDateRange,
    selectedCountry,
    selectedAgency,
    myProfile?.country,
  ]);

  // TARGET PER COUNTRY
  const salesTargetByCountry = useMemo(() => {
    const relevant = adminStatus ? profiles : myProfile ? [myProfile] : [];

    return relevant.reduce<Record<string, number>>((acc, p) => {
      if (p.country) {
        const key = p.country.trim();
        acc[key] = (acc[key] || 0) + parseNumber(p.salesTarget);
      }
      return acc;
    }, {});
  }, [profiles, adminStatus, myProfile]);

  // SALES PER COUNTRY
  const salesByCountry = useMemo(() => {
    return filteredLeads.reduce<Record<string, number>>((acc, lead) => {
      if (!lead.home.country) return acc;

      const key = lead.home.country.trim();
      const courseAmount = Array.isArray(lead.course)
        ? lead.course.reduce((sum, c) => sum + parseNumber(c.courseFee), 0)
        : 0;
      const servicesTotal = Array.isArray(lead.services)
        ? lead.services.reduce((sum, s) => sum + parseNumber(s.amount), 0)
        : 0;
      const discount = parseNumber(lead.discount);

      acc[key] = (acc[key] || 0) + courseAmount + servicesTotal - discount;

      return acc;
    }, {});
  }, [filteredLeads]);

  // SORTED ENTRIES (IMPORTANT FIX)
  const sortedEntries = useMemo(() => {
    const raw = adminStatus
      ? Object.entries(salesTargetByCountry)
      : myProfile
      ? [[myProfile.country, salesTargetByCountry[myProfile.country] || 0]]
      : [];

    const computed = raw.map(([country, target]) => {
      const t = parseNumber(target);
      const s = salesByCountry[country] || 0;
      const progress = t > 0 ? (s / t) * 100 : 0;

      return { country, target: t, sales: s, progress };
    });

    return computed.sort((a, b) => b.progress - a.progress);
  }, [adminStatus, myProfile, salesTargetByCountry, salesByCountry]);

  // OPTIONS LIST
  const countriesList = useMemo(
    () =>
      Array.from(
        new Set(profiles.map((p) => p.country?.trim()).filter(Boolean))
      ),
    [profiles]
  );

  const agenciesList = useMemo(
    () =>
      Array.from(
        new Map(
          profiles
            .filter((p) => p.email && p.name)
            .map((p) => [p.email, { email: p.email, name: p.name }])
        ).values()
      ),
    [profiles]
  );

  const handleResetFilters = () => {
    setFilter("month");
    setStartDate("");
    setEndDate("");
    setSelectedCountry("All");
    setSelectedAgency("All");
  };

  // UI (UNCHANGED)
  return (
    <section>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Sales Target by Country
        </h2>

        {adminStatus && (
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
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
                  className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </>
            )}

            <select
              className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
              onChange={(e) => setSelectedCountry(e.target.value)}
              value={selectedCountry}
            >
              <option value="All">All Countries</option>
              {countriesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
              onChange={(e) => setSelectedAgency(e.target.value)}
              value={selectedAgency}
            >
              <option value="All">All Agencies</option>
              {agenciesList.map((a) => (
                <option key={a.email} value={a.email}>
                  {a.name}
                </option>
              ))}
            </select>

            <button
              className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded-2xl transition"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* SCROLL AREA */}
      <div className="relative bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mb-6 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700 h-[445px] overflow-y-auto scroll-smooth">
        {sortedEntries.map(({ country, target, sales, progress }) => {
          return (
            <div key={country} className="py-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {country}
                </span>

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {sales.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  /{" "}
                  {target.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`${
                    progress > 0 ? "bg-orange-400" : "bg-gray-300"
                  } h-4 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              <div
                className={`text-xs mt-1 ${
                  progress > 0 ? "text-orange-500" : "text-blue-500"
                }`}
              >
                {progress.toFixed(1)}% achieved
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CountrySalesTargets;
