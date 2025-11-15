"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ILead } from "@/lib/database/models/lead.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { subWeeks, subMonths, subQuarters, subYears } from "date-fns";
import { getQuotationByEmail } from "@/lib/actions/quotation.actions";
import { IQuotation } from "@/lib/database/models/quotation.model";

type FinancialData = {
  studentName: string;
  totalAmount: number;
  paid: number;
  due: number;
};

interface LeadsFinancialProps {
  leads: ILead[];
  profiles: IProfile[];
}

const LeadsFinancial: React.FC<LeadsFinancialProps> = ({ leads, profiles }) => {
  const [filter, setFilter] = useState<string>("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [data, setData] = useState<FinancialData[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [version, setVersion] = useState(0); // 🔥 Forces proper refetch

  const filterByDateRange = useCallback(
    <T extends { createdAt: string | Date }>(data: T[]) => {
      const now = new Date();
      let from: Date | null = null;

      if (filter === "custom" && startDate && endDate) {
        const s = new Date(startDate);
        const e = new Date(endDate);
        return data.filter((i) => {
          const c = new Date(i.createdAt);
          return c >= s && c <= e;
        });
      }

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

      return from ? data.filter((i) => new Date(i.createdAt) >= from) : data;
    },
    [filter, startDate, endDate]
  );

  const resetFilters = () => {
    setFilter("month");
    setStartDate("");
    setEndDate("");
    setSelectedAgent("all");
  };

  const handleReset = () => {
    resetFilters();
    setShowMore(false);
    setVersion((v) => v + 1);
  };

  useEffect(() => {
    const fetchFinancial = async () => {
      try {
        let filtered = filterByDateRange(leads);

        if (selectedAgent !== "all") {
          filtered = filtered.filter((l) => l.author === selectedAgent);
        }

        const voidLeads = filtered.filter((l) => l.isVoid);
        const voidQuotes = await Promise.all(
          voidLeads.map((l) => getQuotationByEmail(l.email))
        );

        const result: FinancialData[] = [];

        for (const lead of filtered) {
          let source: ILead | IQuotation = lead;

          if (lead.isVoid) {
            const q = voidQuotes.find((x) => x?.email === lead.email);
            if (q) source = q;
          }

          const courseAmount = Array.isArray(source.course)
            ? source.course.reduce((s, c) => s + Number(c.courseFee || 0), 0)
            : 0;

          const serviceAmount = Array.isArray(source.services)
            ? source.services.reduce((s, svc) => s + Number(svc.amount || 0), 0)
            : 0;

          const discount = Number(source.discount || 0);
          const total = courseAmount + serviceAmount - discount;

          const paid = Array.isArray(source.transcript)
            ? source.transcript.reduce((s, t) => s + Number(t.amount || 0), 0)
            : 0;

          const due = total - paid;

          if (total || paid || due) {
            result.push({
              studentName: lead.name,
              totalAmount: total,
              paid,
              due,
            });
          }
        }

        setData(result);
      } catch (err) {
        console.error("Failed to fetch financial data", err);
      }
    };

    fetchFinancial();
  }, [
    leads,
    filter,
    startDate,
    endDate,
    selectedAgent,
    filterByDateRange,
    version, // 🔥 ensures reset triggers fresh fetch
  ]);

  useEffect(() => {
    if (data.length <= 6) setShowMore(false);
  }, [data]);

  return (
    <section className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mb-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Leads Financial Overview
        </h2>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
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
                className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
              />
            </>
          )}

          {profiles.length > 0 && (
            <select
              className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="all">All Agencies</option>
              {profiles.map((p) => (
                <option key={p.email} value={p.email}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleReset}
            className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded-2xl transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {(showMore ? data : data.slice(0, 6)).map((s) => {
          const percent = s.totalAmount
            ? Math.round((s.paid / s.totalAmount) * 100)
            : 0;

          return (
            <Card key={s.studentName} className="p-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-900 dark:border-gray-100 mb-4 col-span-1">
                {s.studentName}
              </h3>

              <div className=" text-gray-700 dark:text-gray-300">
                <p className="flex items-center justify-between">
                  <span className="font-medium">Total:</span> €
                  {s.totalAmount.toLocaleString()}
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-medium">Paid:</span> €
                  {s.paid.toLocaleString()}
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-medium">Due:</span> €
                  {s.due.toLocaleString()}
                </p>
              </div>

              <div className="mt-4">
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black dark:bg-white rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* SEE MORE BUTTON */}
      {data.length > 6 && !showMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setShowMore(true)}
            className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded-full w-full transition"
          >
            See More
          </button>
        </div>
      )}
    </section>
  );
};

export default LeadsFinancial;
