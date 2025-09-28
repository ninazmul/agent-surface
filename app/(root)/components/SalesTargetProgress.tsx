"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ILead } from "@/lib/database/models/lead.model";
import { useEffect, useState, useMemo } from "react";

type Props = {
  profile?: { salesTarget?: number; email: string };
  leads?: ILead[];
};

export default function SalesTargetProgress({ profile, leads }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // On mount, set default to last 7 days if no params
  useEffect(() => {
    const startParam = searchParams.get("startDate");
    const endParam = searchParams.get("endDate");

    if (startParam && endParam) {
      setStartDate(new Date(startParam));
      setEndDate(new Date(endParam));
    } else {
      const today = new Date();
      const last7Days = new Date();
      last7Days.setDate(today.getDate() - 6); // include today
      setStartDate(last7Days);
      setEndDate(today);
    }
  }, [searchParams]);

  const updateDateRange = (
    range: "7d" | "1m" | "1y" | "custom",
    customStart?: string,
    customEnd?: string
  ) => {
    let start: Date, end: Date;
    const today = new Date();

    if (range === "7d") {
      end = today;
      start = new Date();
      start.setDate(end.getDate() - 6);
    } else if (range === "1m") {
      end = today;
      start = new Date();
      start.setMonth(end.getMonth() - 1);
    } else if (range === "1y") {
      end = today;
      start = new Date();
      start.setFullYear(end.getFullYear() - 1);
    } else if (range === "custom" && customStart && customEnd) {
      start = new Date(customStart);
      end = new Date(customEnd);
    } else {
      return;
    }

    setStartDate(start);
    setEndDate(end);

    const params = new URLSearchParams(searchParams.toString());
    params.set("startDate", start.toISOString().split("T")[0]);
    params.set("endDate", end.toISOString().split("T")[0]);
    router.push(`?${params.toString()}`);
  };

  const parseNumber = (value: string | undefined) =>
    parseFloat((value || "0").toString().replace(/,/g, "").trim()) || 0;

  // Filter leads based on paymentStatus and date range
  const salesAchieved = useMemo(() => {
    if (!startDate || !endDate) return 0;

    const paidLeads = leads?.filter((l) => l.paymentStatus === "Accepted");

    const filteredLeads = paidLeads?.filter((lead) => {
      const leadDate = new Date(lead.createdAt); // adjust if another date field
      return leadDate >= startDate && leadDate <= endDate;
    });

    return filteredLeads?.reduce((sum, lead) => {
      const courseAmount = Array.isArray(lead.course)
        ? lead.course.reduce((s, c) => s + Number(c.courseFee || 0), 0)
        : 0;
      const discount = parseNumber(lead.discount);
      const servicesTotal = Array.isArray(lead.services)
        ? lead.services.reduce((s, serv) => s + parseNumber(serv.amount), 0)
        : 0;

      return sum + courseAmount + servicesTotal - discount;
    }, 0);
  }, [leads, startDate, endDate]);

  if (!profile?.salesTarget) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
        Sales Target Progress
      </h2>

      {/* Preset Date Filters */}
      <div className="flex gap-4 mb-4 items-center flex-wrap">
        <select
          onChange={(e) =>
            updateDateRange(e.target.value as "7d" | "1m" | "1y" | "custom")
          }
          className="border rounded px-3 py-2"
          defaultValue="7d"
        >
          <option value="7d">Last 7 Days</option>
          <option value="1m">Last 1 Month</option>
          <option value="1y">Last 1 Year</option>
          <option value="custom">Custom</option>
        </select>

        {/* Custom Date Range */}
        <input
          type="date"
          value={startDate ? startDate.toISOString().split("T")[0] : ""}
          onChange={(e) =>
            updateDateRange(
              "custom",
              e.target.value,
              endDate?.toISOString().split("T")[0]
            )
          }
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          value={endDate ? endDate.toISOString().split("T")[0] : ""}
          onChange={(e) =>
            updateDateRange(
              "custom",
              startDate?.toISOString().split("T")[0],
              e.target.value
            )
          }
          className="border rounded px-3 py-2"
        />
      </div>

      {/* Progress Display */}
      <div className="bg-gray-50 dark:bg-gray-800 border rounded-xl p-6">
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
          {salesAchieved?.toLocaleString()} /{" "}
          {profile.salesTarget.toLocaleString()} €
        </p>
        <div className="w-full bg-gray-200 dark:text-gray-500 rounded-full h-3 overflow-hidden">
          <div
            className="bg-green-500 h-3"
            style={{
              width: `${Math.min(
                (salesAchieved || 0 / profile.salesTarget) * 100,
                100
              )}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-300">
          {((salesAchieved || 0 / profile.salesTarget) * 100).toFixed(1)}% achieved
        </p>
      </div>
    </section>
  );
}
