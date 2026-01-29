"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  leads: ILead[] | null;
  profiles: IProfile[] | null;
}

const LeadsFinancial: React.FC<LeadsFinancialProps> = ({
  leads = [],
  profiles = [],
}) => {
  const [filter, setFilter] = useState<string>("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [data, setData] = useState<FinancialData[]>([]);
  const [showMore, setShowMore] = useState(false);

  const handleReset = () => {
    setFilter("week");
    setStartDate("");
    setEndDate("");
    setSelectedAgent("all");
    setShowMore(false);
  };

  /* ---------------- FETCH FINANCIAL DATA ---------------- */
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const now = new Date();
        let fromDate: Date | null = null;

        if (filter === "custom" && startDate && endDate) {
          fromDate = new Date(startDate);
        } else {
          switch (filter) {
            case "week":
              fromDate = subWeeks(now, 1);
              break;
            case "month":
              fromDate = subMonths(now, 1);
              break;
            case "quarter":
              fromDate = subQuarters(now, 1);
              break;
            case "year":
              fromDate = subYears(now, 1);
              break;
            case "all":
              fromDate = null;
              break;
          }
        }

        const safeLeads = Array.isArray(leads) ? leads : [];

        const filteredLeads = safeLeads.filter((l) => {
          if (!l) return false;
          const created = l.createdAt ? new Date(l.createdAt) : null;
          const dateCheck = fromDate && created ? created >= fromDate : true;
          const agentCheck =
            selectedAgent === "all" ? true : l.author === selectedAgent;
          return dateCheck && agentCheck;
        });

        const voidLeads = filteredLeads.filter((l) => l?.isVoid);

        const voidQuotes = await Promise.all(
          voidLeads.map(async (l) => {
            try {
              const q = await getQuotationByEmail(l.email || "");
              return q || null;
            } catch {
              return null;
            }
          }),
        );

        const result: FinancialData[] = [];

        for (const lead of filteredLeads) {
          if (!lead) continue;

          let source: ILead | IQuotation = lead;
          if (lead.isVoid) {
            const q = voidQuotes.find((x) => x?.email === lead.email);
            if (q) source = q;
          }

          const courseAmount = Array.isArray(source?.course)
            ? source.course.reduce(
                (sum, c) => sum + Number(c?.courseFee || 0),
                0,
              )
            : 0;

          const serviceAmount = Array.isArray(source?.services)
            ? source.services.reduce(
                (sum, s) => sum + Number(s?.amount || 0),
                0,
              )
            : 0;

          const discount = Number(source?.discount || 0);
          const total = courseAmount + serviceAmount - discount;

          const paid = Array.isArray(source?.transcript)
            ? source.transcript.reduce(
                (sum, t) => sum + Number(t?.amount || 0),
                0,
              )
            : 0;

          const due = total - paid;

          if (total || paid || due) {
            result.push({
              studentName: lead?.name || "Unknown",
              totalAmount: total,
              paid,
              due,
            });
          }
        }

        // Sort fully paid (due = 0) first
        const sortedResult = result.sort((a, b) => {
          if (a.due === 0 && b.due !== 0) return -1;
          if (a.due !== 0 && b.due === 0) return 1;
          return 0;
        });

        setData(sortedResult);
      } catch (err) {
        console.error("Failed to fetch financial data", err);
      }
    };

    fetchFinancialData();
  }, [leads, profiles, filter, startDate, endDate, selectedAgent]);

  /* ---------------- CARDS TO SHOW ---------------- */
  const cardsToShow = useMemo(() => {
    if (data.length === 0) return Array(3).fill(null); // placeholder when no data
    return showMore ? data : data.slice(0, 6); // show first 6 by default
  }, [data, showMore]);

  return (
    <section className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mb-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
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

          {Array.isArray(profiles) && profiles.length > 0 && (
            <select
              className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="all">All Agencies</option>
              {profiles.map((p) => (
                <option key={p.email} value={p.email}>
                  {p.name || "Unknown"}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cardsToShow.map((s, index) => {
          const studentName = s?.studentName || "No Student";
          const totalAmount = s?.totalAmount || 0;
          const paid = s?.paid || 0;
          const due = s?.due || 0;
          const percent = totalAmount
            ? Math.round((paid / totalAmount) * 100)
            : 0;

          return (
            <Card key={index} className="p-2 h-full">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-900 dark:border-gray-100 mb-4">
                {studentName}
              </h3>

              <div className="text-gray-700 dark:text-gray-300">
                <p className="flex items-center justify-between">
                  <span className="font-medium">Total:</span> €
                  {totalAmount.toLocaleString()}
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-medium">Paid:</span> €
                  {paid.toLocaleString()}
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-medium">Due:</span> €
                  {due.toLocaleString()}
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
