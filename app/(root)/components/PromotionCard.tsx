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
import PromotionLeadsStats from "./PromotionLeadsStats";

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
            <div className="relative w-full h-56 sm:h-64">
              <Image
                src={promotion.photo || "/assets/images/logo.png"}
                alt={promotion.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent group-hover:scale-105 transition-transform duration-300" />
            </div>

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

        <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 bg-gradient-to-b from-fuchsia-50 via-pink-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-black rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-fuchsia-900 dark:text-white">
              {promotion.title} {isPaused && "(Paused)"}
            </DialogTitle>
          </DialogHeader>

          {promotion.photo && (
            <div className="relative w-full h-72 sm:h-80 my-4">
              <Image
                src={promotion.photo}
                alt={promotion.title}
                fill
                className="w-full h-full rounded-lg object-contain bg-gray-100 dark:bg-gray-800 shadow-md"
              />
            </div>
          )}

          <div className="space-y-5 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
            <p>{promotion.description}</p>

            {promotion.criteria && (
              <p className="text-purple-700 dark:text-purple-300">
                <span className="font-medium">Eligibility:</span>{" "}
                {promotion.criteria}
              </p>
            )}

            {promotion.countries && promotion.countries.length > 0 && (
              <p className="text-blue-700 dark:text-blue-300">
                <span className="font-medium">Countries:</span>{" "}
                {promotion.countries.join(", ")}
              </p>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Valid from{" "}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {new Date(promotion.startDate).toLocaleDateString()}
              </span>{" "}
              to{" "}
              <span className="font-medium text-rose-600 dark:text-rose-400">
                {new Date(promotion.endDate).toLocaleDateString()}
              </span>
            </p>

            {/* Courses */}
            {promotion.course && promotion.course.length > 0 && (
              <div>
                <h4 className="text-base font-semibold text-indigo-800 dark:text-indigo-200 mb-3">
                  🎓 Courses
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {promotion.course.map((c) => (
                    <div
                      key={c.name}
                      className="border border-indigo-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white/60 dark:bg-gray-800/60"
                    >
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-indigo-600 dark:text-gray-400">
                        {c.courseType} – {c.courseDuration}
                      </p>
                      <p className="text-xs mt-1">
                        <span className="font-medium">Campus:</span>{" "}
                        {c.campus?.name} ({c.campus?.shift})
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">Fee:</span> €{c.courseFee}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                        {new Date(
                          c.startDate || new Date()
                        ).toLocaleDateString()}{" "}
                        →{" "}
                        {new Date(c.endDate || new Date()).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {promotion.services && promotion.services.length > 0 && (
              <div>
                <h4 className="text-base font-semibold text-pink-800 dark:text-pink-200 mb-3">
                  🛠 Services
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {promotion.services.map((s) => (
                    <div
                      key={s._id}
                      className="border border-pink-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white/60 dark:bg-gray-800/60"
                    >
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-pink-600 dark:text-gray-400">
                        {s.serviceType}
                      </p>
                      <p className="text-xs mt-1">{s.description}</p>
                      <p className="text-xs mt-1">
                        <span className="font-medium">Amount:</span> €{s.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {promotion.discount && (
              <div className="mt-4">
                <span className="inline-block px-3 py-1 text-sm font-semibold rounded-lg bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white shadow">
                  🎉 Special Discount: €{promotion.discount}
                </span>
              </div>
            )}

            {/* Create Lead */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-base font-semibold text-fuchsia-800 dark:text-fuchsia-200 mb-3">
                ✨ Create Lead
              </h4>
              <a
                href={`/promotions/${promotion._id}/leads/create`}
                className="w-full sm:w-auto"
              >
                <button
                  disabled={isPaused}
                  className={`w-full sm:w-auto px-5 py-2 rounded-lg ${
                    isPaused
                      ? "bg-gray-400 cursor-not-allowed text-gray-200"
                      : "bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:opacity-90 text-white"
                  } font-medium shadow transition`}
                >
                  {isPaused ? "Paused" : "Get Started"}
                </button>
              </a>
            </div>
          </div>
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
              <div>
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
                <PromotionLeadsStats leads={leads} loading={loading} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PromotionCard;
