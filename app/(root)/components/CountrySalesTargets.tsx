"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { IProfile } from "@/lib/database/models/profile.model";
import { ILead } from "@/lib/database/models/lead.model";
import { subWeeks, subMonths, subQuarters, subYears } from "date-fns";

interface CountrySalesTargetsProps {
  adminStatus: boolean;
  profiles: IProfile[];
  leads: ILead[];
  myProfile?: IProfile | null;
  loading?: boolean;
}

const CountrySalesTargets: React.FC<CountrySalesTargetsProps> = ({
  adminStatus,
  profiles,
  leads,
  myProfile,
  loading = false,
}) => {
  const [filter, setFilter] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedAgency, setSelectedAgency] = useState("All");

  const parseNumber = (value: string | number | undefined) =>
    parseFloat((value || 0).toString().replace(/,/g, "").trim()) || 0;

  const filterByDateRange = React.useCallback(
    (data: ILead[]) => {
      if (filter === "custom" && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return data.filter((lead) => {
          const date = new Date(lead.updatedAt || lead.createdAt);
          return date >= start && date <= end;
        });
      }

      const now = new Date();
      let from: Date | null = null;

      switch (filter) {
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
        case "all":
          return data;
      }

      return from
        ? data.filter(
            (lead) => new Date(lead.updatedAt || lead.createdAt) >= from
          )
        : data;
    },
    [filter, startDate, endDate]
  );

  // Memoized filtered leads to improve performance
  const filteredLeads = useMemo(() => {
    const acceptedLeads = leads.filter((l) => l.paymentStatus === "Accepted");
    const dateFiltered = adminStatus
      ? filterByDateRange(acceptedLeads)
      : acceptedLeads;

    return dateFiltered.filter((l) => {
      const countryMatch =
        selectedCountry === "All"
          ? true
          : l.home.country?.trim() === selectedCountry;
      const agencyMatch =
        selectedAgency === "All" ? true : l.author === selectedAgency;
      return adminStatus
        ? countryMatch && agencyMatch
        : l.home.country === myProfile?.country;
    });
  }, [
    leads,
    adminStatus,
    filterByDateRange,
    selectedCountry,
    selectedAgency,
    myProfile?.country,
  ]);

  // Memoized sales target calculation
  const salesTargetByCountry = useMemo(() => {
    const relevantProfiles = adminStatus
      ? profiles
      : myProfile
      ? [myProfile]
      : [];
    return relevantProfiles.reduce<Record<string, number>>((acc, p) => {
      if (p.country) {
        const countryKey = p.country.trim();
        acc[countryKey] = (acc[countryKey] || 0) + parseNumber(p.salesTarget);
      }
      return acc;
    }, {});
  }, [profiles, adminStatus, myProfile]);

  // Memoized actual sales calculation
  const salesByCountry = useMemo(() => {
    return filteredLeads.reduce<Record<string, number>>((acc, lead) => {
      if (!lead.home.country) return acc;
      const countryKey = lead.home.country.trim();
      const courseAmount = Array.isArray(lead.course)
        ? lead.course.reduce((sum, c) => sum + parseNumber(c.courseFee), 0)
        : 0;
      const servicesTotal = Array.isArray(lead.services)
        ? lead.services.reduce((sum, s) => sum + parseNumber(s.amount), 0)
        : 0;
      const discount = parseNumber(lead.discount);
      acc[countryKey] =
        (acc[countryKey] || 0) + courseAmount + servicesTotal - discount;
      return acc;
    }, {});
  }, [filteredLeads]);

  const salesTargetEntries = adminStatus
    ? Object.entries(salesTargetByCountry)
    : myProfile
    ? [[myProfile.country, salesTargetByCountry[myProfile.country] || 0]]
    : [];

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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="p-4 bg-gray-300 dark:bg-gray-700 rounded-2xl h-24"
            />
          ))}
        </div>
      </div>
    );
  }

  if (salesTargetEntries.length === 0) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
        No sales data available.
      </p>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-100">
        Sales Target <span>{adminStatus && " by Country"}</span>
      </h2>

      {adminStatus && (
        <div className="flex flex-wrap gap-4 mb-6 items-center bg-lime-50 dark:bg-gray-800 p-4 rounded-2xl shadow">
          <select
            className="border px-4 py-2 rounded-2xl bg-lime-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
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
                className="border px-4 py-2 rounded-2xl bg-lime-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="border px-4 py-2 rounded-2xl bg-lime-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}

          <select
            className="border px-4 py-2 rounded-2xl bg-lime-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
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
            className="border px-4 py-2 rounded-2xl bg-lime-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
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
            className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-2xl hover:bg-red-600 dark:hover:bg-red-700 transition"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salesTargetEntries.map(([country, target]) => {
          const targetNum = parseNumber(target);
          const sales = salesByCountry[country] || 0;
          const progress =
            targetNum > 0 ? Math.min((sales / targetNum) * 100, 100) : 0;

          return (
            <Card
              key={country}
              className="p-4 bg-lime-50 dark:bg-gray-800 rounded-2xl shadow"
              role="region"
              aria-label={`Sales progress for ${country}`}
            >
              <div className="flex justify-between mb-1 text-gray-800 dark:text-gray-200">
                <span className="font-semibold">{country}</span>
                <span>
                  {sales.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  /{" "}
                  {targetNum.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </span>
              </div>
              <div className="w-full bg-lime-300 dark:bg-gray-500 rounded-full h-4">
                <div
                  className="bg-green-500 dark:bg-lime-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  role="progressbar"
                  aria-label={`${progress.toFixed(1)} percent achieved`}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {progress.toFixed(1)}% achieved
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default CountrySalesTargets;
