"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IPromotion } from "@/lib/database/models/promotion.model";
import { getLeadsByPromotion } from "@/lib/actions/lead.actions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";
import { ILead } from "@/lib/database/models/lead.model";

type Props = {
  promotion: IPromotion;
  isAdmin?: boolean;
};

const PromotionCard = ({ promotion, isAdmin }: Props) => {
  const isPaused = promotion.isPaused;

  // leads + stats state
  const [leads, setLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(false);

  const COLORS = ["#8b5cf6", "#ec4899", "#10b981"];

  // Derived stats
  const stats = [
    { name: "Leads", value: leads.length },
    {
      name: "Conversions",
      value: leads.filter((l) => l.status === "Converted").length,
    },
    {
      name: "Pending",
      value: leads.filter((l) => l.status === "Pending").length,
    },
  ];

  // fetch leads when stats modal opens
  const fetchLeads = async () => {
    if (!promotion.sku) return;
    setLoading(true);
    const res = await getLeadsByPromotion(promotion.sku);
    setLeads(res);
    setLoading(false);
  };

  return (
    <div className="relative">
      {/* --- Main Promotion Dialog (existing) --- */}
      <Dialog>
        <DialogTrigger asChild>
          <div className="group bg-gradient-to-b from-fuchsia-100 via-pink-100 to-white dark:from-gray-800 dark:via-gray-900 dark:to-black cursor-pointer shadow-md hover:shadow-lg rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] relative">
            {promotion.photo && (
              <div className="relative w-full h-56 sm:h-64">
                <Image
                  src={promotion.photo}
                  alt={promotion.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent group-hover:scale-105 transition-transform duration-300" />
              </div>
            )}

            {isPaused && (
              <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                Paused
              </span>
            )}

            <div className="p-5">
              <h3 className="text-lg sm:text-xl font-semibold text-fuchsia-900 dark:text-white group-hover:text-fuchsia-700 dark:group-hover:text-fuchsia-300 transition-colors">
                {promotion.title}
              </h3>
              <p className="mt-1 text-sm text-fuchsia-600 dark:text-gray-300 line-clamp-2">
                {promotion.description}
              </p>
              {promotion.discount && (
                <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white shadow">
                  €{promotion.discount} OFF
                </span>
              )}
            </div>
          </div>
        </DialogTrigger>

        <DialogContent>
          {/* keep your existing promotion detail modal code here */}
        </DialogContent>
      </Dialog>

      {/* --- Admin Statistics Modal --- */}
      {isAdmin && (
        <Dialog onOpenChange={(open) => open && fetchLeads()}>
          <DialogTrigger asChild>
            <button className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow transition">
              📊 Stats
            </button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-2xl p-6 bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                Promotion Statistics
              </DialogTitle>
            </DialogHeader>

            {loading ? (
              <p className="text-sm text-gray-500">Loading stats...</p>
            ) : leads.length === 0 ? (
              <p className="text-sm text-gray-500">
                No leads found for this promotion.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 mt-4">
                {/* Bar Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats}>
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {stats.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PromotionCard;
