"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { IProfile } from "@/lib/database/models/profile.model";
import { ILead } from "@/lib/database/models/lead.model";
import { subWeeks, subMonths, subQuarters, subYears } from "date-fns";

type AgentProgress = {
  agentName: string;
} & Record<string, number>;

interface LeadsToEnrolledProps {
  profiles: IProfile[];
  leads: ILead[];
  loading?: boolean;
}

const leadStages = ["Open", "Contacted", "Converted", "Closed"];

const LeadsToEnrolled: React.FC<LeadsToEnrolledProps> = ({
  profiles,
  leads,
}) => {
  const [filter, setFilter] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showMore, setShowMore] = useState(false);

  const filterByDateRange = React.useCallback(
    <T extends { createdAt: string | Date }>(data: T[]) => {
      const now = new Date();
      let from: Date | null = null;

      if (filter === "custom" && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return data.filter(
          (item) =>
            new Date(item.createdAt) >= start && new Date(item.createdAt) <= end
        );
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

      return from
        ? data.filter((item) => new Date(item.createdAt) >= from)
        : data;
    },
    [filter, startDate, endDate]
  );

  const filteredLeads = useMemo(
    () => filterByDateRange(leads),
    [filterByDateRange, leads]
  );

  const agentsData: AgentProgress[] = useMemo(() => {
    return profiles
      .map((agent) => {
        const agentLeads = filteredLeads.filter(
          (l) => l.author === agent.email
        );
        const counts: Record<string, number> = {};
        leadStages.forEach((stage) => {
          counts[stage] =
            agentLeads.filter((l) => l.progress === stage).length || 0;
        });

        const total = Object.values(counts).reduce((sum, v) => sum + v, 0);
        return total > 0 ? { agentName: agent.name, ...counts } : null;
      })
      .filter((a): a is AgentProgress => a !== null);
  }, [profiles, filteredLeads]);

  return (
    <section className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Leads Progress
        </h2>

        {/* Filter Section */}
        <div className="flex items-center gap-3">
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

          {/* Reset Button */}
          <button
            className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded-2xl transition"
            onClick={() => {
              setFilter("month");
              setStartDate("");
              setEndDate("");
            }}
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {(showMore ? agentsData : agentsData.slice(0, 3)).map((agent) => {
          const maxCount = Math.max(
            ...leadStages.map((stage) => agent[stage] || 0),
            1
          );

          return (
            <Card
              key={agent.agentName}
              className="p-6 bg-gray-100 dark:bg-gray-800 shadow-sm rounded-3xl border border-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {agent.agentName}
              </h3>

              {leadStages.map((stage) => {
                const count = agent[stage] || 0;
                const progress = (count / maxCount) * 100;

                const stageColor = {
                  Open: "bg-black",
                  Contacted: "bg-black",
                  Converted: "bg-black",
                  Closed: "bg-red-500",
                }[stage];

                const trackColor = {
                  Open: "bg-gray-200",
                  Contacted: "bg-gray-200",
                  Converted: "bg-gray-200",
                  Closed: "bg-red-200",
                }[stage];

                return (
                  <div key={stage} className="mb-4">
                    <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                      <span>{stage}</span>
                      <span>{count.toString().padStart(2, "0")}</span>
                    </div>

                    <div className={`w-full h-2 rounded-full ${trackColor}`}>
                      <div
                        className={`h-2 rounded-full ${stageColor}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </Card>
          );
        })}
      </div>

      {/* See More Button */}
      {agentsData.length > 3 && !showMore && (
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

export default LeadsToEnrolled;
