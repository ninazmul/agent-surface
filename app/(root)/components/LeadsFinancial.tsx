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
  const [loading, setLoading] = useState<boolean>(true);

  const filterByDateRange = useCallback(
    <T extends { createdAt: string | Date }>(data: T[]) => {
      const now = new Date();
      let from: Date | null = null;

      if (filter === "custom" && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return data.filter((item) => {
          const created = new Date(item.createdAt);
          return created >= start && created <= end;
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

      if (!from) return data;
      return data.filter((item) => new Date(item.createdAt) >= from);
    },
    [filter, startDate, endDate]
  );

  useEffect(() => {
    const fetchFinancial = async () => {
      setLoading(true);
      try {
        let filteredLeads = filterByDateRange(leads);

        if (selectedAgent !== "all") {
          filteredLeads = filteredLeads.filter(
            (l) => l.author === selectedAgent
          );
        }

        const results: FinancialData[] = [];
        const voidLeads = filteredLeads.filter((l) => l.isVoid);
        const voidQuotations = await Promise.all(
          voidLeads.map((l) => getQuotationByEmail(l.email))
        );

        for (const lead of filteredLeads) {
          let source: ILead | IQuotation = lead;

          if (lead.isVoid) {
            const quotation = voidQuotations.find(
              (q) => q?.email === lead.email
            );
            if (quotation) source = quotation;
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
          const totalAmount = courseAmount + serviceAmount - discount;

          const paidAmount = Array.isArray(source.transcript)
            ? source.transcript.reduce(
                (sum, t) => sum + Number(t.amount || 0),
                0
              )
            : 0;

          const dueAmount = totalAmount - paidAmount;

          if (totalAmount > 0 || paidAmount > 0 || dueAmount > 0) {
            results.push({
              studentName: lead.name,
              totalAmount,
              paid: paidAmount,
              due: dueAmount,
            });
          }
        }

        setData(results);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancial();
  }, [leads, filter, startDate, endDate, selectedAgent, filterByDateRange]);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Leads Financial Overview
      </h2>

      {/* Filters */}
      {!loading && (
        <div className="flex flex-wrap gap-4 mb-6 items-center bg-blue-50 dark:bg-gray-800 p-4 rounded-2xl shadow">
          <select
            className="border px-4 py-2 rounded-2xl bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm hover:shadow-md transition"
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
                className="border px-4 py-2 rounded-2xl bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm hover:shadow-md transition"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="border px-4 py-2 rounded-2xl bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm hover:shadow-md transition"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}

          {profiles.length > 0 && (
            <select
              className="border px-4 py-2 rounded-2xl bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm hover:shadow-md transition"
              onChange={(e) => setSelectedAgent(e.target.value)}
              value={selectedAgent}
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
            className="bg-red-500 dark:bg-red-600 text-white px-6 py-2 rounded-2xl hover:bg-red-600 dark:hover:bg-red-700 transition shadow-md hover:shadow-lg"
            onClick={() => {
              setFilter("month");
              setStartDate("");
              setEndDate("");
              setSelectedAgent("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Loader */}
      {loading || data.length === 0 ? (
        <div className="space-y-4 animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="p-6 bg-gray-300 dark:bg-gray-700 rounded-3xl h-48"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map((student) => {
            const paidPercent = student.totalAmount
              ? Math.round((student.paid / student.totalAmount) * 100)
              : 0;

            return (
              <Card
                key={student.studentName}
                className="p-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-lg hover:scale-105 transition-transform"
              >
                <h3 className="font-semibold mb-4 text-xl text-gray-800 dark:text-gray-200">
                  {student.studentName}
                </h3>

                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>
                    <span className="font-medium">Total Amount:</span> €
                    {student.totalAmount.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Paid:</span> €
                    {student.paid.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Due:</span> €
                    {student.due.toLocaleString()}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${paidPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-300 text-right">
                    {paidPercent}% Paid
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default LeadsFinancial;
