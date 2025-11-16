"use client";

import React, { useEffect, useState } from "react";
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

  const handleReset = () => {
    setFilter("week"); // default to last 7 days
    setStartDate("");
    setEndDate("");
    setSelectedAgent("all");
    setShowMore(false);
    setData([]); // clear old data immediately
  };

  useEffect(() => {
    const fetchFinancialData = async () => {
      setData([]); // clear data before fetching new
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

        // Filter leads by date and agent
        const filteredLeads = leads.filter((l) => {
          const created = new Date(l.createdAt);
          const dateCheck = fromDate ? created >= fromDate : true;
          const agentCheck =
            selectedAgent === "all" ? true : l.author === selectedAgent;
          return dateCheck && agentCheck;
        });

        // Handle void leads
        const voidLeads = filteredLeads.filter((l) => l.isVoid);
        const voidQuotes = await Promise.all(
          voidLeads.map((l) => getQuotationByEmail(l.email))
        );

        const result: FinancialData[] = [];

        for (const lead of filteredLeads) {
          let source: ILead | IQuotation = lead;
          if (lead.isVoid) {
            const q = voidQuotes.find((x) => x?.email === lead.email);
            if (q) source = q;
          }

          const courseAmount = Array.isArray(source.course)
            ? source.course.reduce(
                (sum, c) => sum + Number(c.courseFee || 0),
                0
              )
            : 0;

          const serviceAmount = Array.isArray(source.services)
            ? source.services.reduce((sum, s) => sum + Number(s.amount || 0), 0)
            : 0;

          const discount = Number(source.discount || 0);
          const total = courseAmount + serviceAmount - discount;

          const paid = Array.isArray(source.transcript)
            ? source.transcript.reduce(
                (sum, t) => sum + Number(t.amount || 0),
                0
              )
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

    fetchFinancialData();
  }, [leads, filter, startDate, endDate, selectedAgent]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(showMore ? data : data.slice(0, 6)).map((s) => {
          const percent = s.totalAmount
            ? Math.round((s.paid / s.totalAmount) * 100)
            : 0;

          return (
            <Card key={s.studentName} className="p-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-900 dark:border-gray-100 mb-4 col-span-1">
                {s.studentName}
              </h3>

              <div className="text-gray-700 dark:text-gray-300">
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
