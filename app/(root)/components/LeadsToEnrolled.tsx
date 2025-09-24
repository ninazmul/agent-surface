"use client";

import React, { useState } from "react";
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
  loading?: boolean; // optional loading prop
}

const stageColors: Record<string, string> = {
  Open: "bg-gray-400 dark:bg-gray-600",
  Contacted: "bg-yellow-400 dark:bg-yellow-600",
  Converted: "bg-green-400 dark:bg-green-600",
  Closed: "bg-red-400 dark:bg-red-600",
};

const LeadsToEnrolled: React.FC<LeadsToEnrolledProps> = ({
  profiles,
  leads,
  loading = false,
}) => {
  const [filter, setFilter] = useState<string>("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const filterByDateRange = <T extends { createdAt: string | Date }>(
    data: T[]
  ) => {
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
  };

  const filteredLeads = filterByDateRange(leads);

  const leadStages = ["Open", "Contacted", "Converted", "Closed"];

  const agentsData: AgentProgress[] = profiles
    .map((agent) => {
      const agentLeads = filteredLeads.filter((l) => l.author === agent.email);
      const counts: Record<string, number> = {};

      leadStages.forEach((stage) => {
        counts[stage] = agentLeads.filter((l) => l.progress === stage).length;
      });

      const total = Object.values(counts).reduce((sum, v) => sum + v, 0);

      return total > 0 ? { agentName: agent.name, ...counts } : null;
    })
    .filter((a): a is AgentProgress => a !== null);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="p-4 bg-gray-300 dark:bg-gray-700 rounded-2xl h-48"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (agentsData.length === 0) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
        No lead data available.
      </p>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Leads Progress
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-blue-50 dark:bg-gray-800 p-4 rounded-2xl shadow">
        <select
          className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
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
              className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="border px-4 py-2 rounded-2xl bg-blue-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </>
        )}

        <button
          className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-2xl hover:bg-red-600 dark:hover:bg-red-700 transition"
          onClick={() => {
            setFilter("month");
            setStartDate("");
            setEndDate("");
          }}
        >
          Reset Filters
        </button>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {agentsData.map((agent) => {
          const maxCount = Math.max(
            ...leadStages.map((stage) =>
              Number(agent[stage as keyof typeof agent] || 0)
            ),
            1
          );

          return (
            <Card
              key={agent.agentName}
              className="p-4 bg-blue-50 dark:bg-gray-800 rounded-2xl shadow"
              role="region"
              aria-label={`Progress for ${agent.agentName}`}
            >
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                {agent.agentName}
              </h3>

              {leadStages.map((stage) => {
                const count = Number(agent[stage as keyof typeof agent] || 0);
                const progress = (count / maxCount) * 100;

                return (
                  <div key={stage} className="mb-2">
                    <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                      <span>{stage}</span>
                      <span>{count}</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-500 rounded-full h-3">
                      <div
                        className={`${stageColors[stage]} h-3 rounded-full transition-all duration-500`}
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
    </section>
  );
};

export default LeadsToEnrolled;
