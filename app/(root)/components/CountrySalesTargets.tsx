"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
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

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll effect
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollInterval: NodeJS.Timeout;
    let scrollDirection = 1; // 1 = down, -1 = up

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (!container) return;
        container.scrollTop += scrollDirection * 0.7; // adjust speed here
        // Reverse scroll when reaching edges
        if (
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 1
        ) {
          scrollDirection = -1;
        } else if (container.scrollTop <= 0) {
          scrollDirection = 1;
        }
      }, 20);
    };

    startAutoScroll();
    return () => clearInterval(scrollInterval);
  }, []);

  const parseNumber = (value: string | number | undefined) =>
    parseFloat((value || 0).toString().replace(/,/g, "").trim()) || 0;

  const filterByDateRange = useCallback(
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

  if (loading || salesTargetEntries.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="h-full overflow-hidden relative">
      <div className="flex flex-wrap justify-between items-center mb-6">
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
              className="bg-black text-white px-4 py-2 rounded-2xl transition"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm divide-y divide-gray-100 dark:divide-gray-700 h-[450px] overflow-y-auto scroll-smooth"
      >
        {salesTargetEntries.map(([country, target]) => {
          const targetNum = parseNumber(target);
          const sales = salesByCountry[country] || 0;
          const progress =
            targetNum > 0 ? Math.min((sales / targetNum) * 100, 100) : 0;
          const barColor = progress > 0 ? "bg-orange-400" : "bg-gray-300";

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
                  {targetNum.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`${barColor} h-4 rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
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
