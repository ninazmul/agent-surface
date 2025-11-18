"use client";

import { useEffect, useState, useCallback } from "react";
import { subWeeks, subMonths, subQuarters, subYears } from "date-fns";
import { ILead } from "@/lib/database/models/lead.model";

interface PromotionLeadsStatsProps {
  leads: ILead[];
  loading?: boolean;
}

const PromotionLeadsStats: React.FC<PromotionLeadsStatsProps> = ({ leads }) => {
  const [filter, setFilter] = useState<string>("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [data, setData] = useState<ILead[]>([]);

  // Date filtering (memoized)
  const filterByDateRange = useCallback(
    (data: ILead[]) => {
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
    [filter, startDate, endDate] // ✅ dependencies
  );

  // Apply filtering
  useEffect(() => {
    if (!leads) return;
    const filteredLeads = filterByDateRange(leads);
    setData(filteredLeads);
  }, [leads, filterByDateRange]);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-2 py-1 rounded border"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
          <option value="all">All</option>
          <option value="custom">Custom</option>
        </select>
        {filter === "custom" && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 rounded border"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 rounded border"
            />
          </>
        )}
      </div>

      {/* Leads Financial Overview */}
      <div>
        <h4 className="font-semibold mb-2">Leads Financial Overview</h4>
        <table className="w-full text-sm border rounded-2xl overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 text-left">Student</th>
              <th className="p-2">Fees</th>
              <th className="p-2">Discount</th>
              <th className="p-2">Total</th>
              <th className="p-2">Paid</th>
              <th className="p-2">Due</th>
              <th className="p-2">Stage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((lead) => {
              const courseAmount = Array.isArray(lead.course)
                ? lead.course.reduce(
                    (sum, c) => sum + Number(c.courseFee || 0),
                    0
                  )
                : 0;

              const serviceAmount = Array.isArray(lead.services)
                ? lead.services.reduce(
                    (sum, s) => sum + Number(s.amount || 0),
                    0
                  )
                : 0;

              const discount = Number(lead.discount || 0);
              const totalAmount = courseAmount + serviceAmount - discount;

              const paidAmount = Array.isArray(lead.transcript)
                ? lead.transcript.reduce(
                    (sum, t) => sum + Number(t.amount || 0),
                    0
                  )
                : 0;

              const dueAmount = totalAmount - paidAmount;

              return (
                <tr key={lead._id.toString()}>
                  <td className="p-2">{lead.name}</td>
                  <td className="p-2">
                    €{courseAmount} + €{serviceAmount}
                  </td>
                  <td className="p-2 text-yellow-600">-€{discount}</td>
                  <td className="p-2 font-semibold">€{totalAmount}</td>
                  <td className="p-2 text-green-600">€{paidAmount}</td>
                  <td className="p-2 text-red-600">€{dueAmount}</td>
                  <td className="p-2">{lead.progress}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromotionLeadsStats;
