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
import { useEffect, useState } from "react";
import { ILead } from "@/lib/database/models/lead.model";
import PromotionLeadsStats from "./PromotionLeadsStats";
import UpdatePromotionDialog from "@/components/shared/UpdatePromotionDialog";
import { IProfile } from "@/lib/database/models/profile.model";
import { ICourse } from "@/lib/database/models/course.model";
import { IServices } from "@/lib/database/models/service.model";

type Props = {
  agency: IProfile[];
  courses: ICourse[];
  services: IServices[];
  promotion: IPromotion;
  isAdmin?: boolean;
};

const PromotionCard = ({
  agency,
  courses,
  services,
  promotion,
  isAdmin,
}: Props) => {
  const isPaused = promotion.isPaused;

  const [leads, setLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateTimeLeft = (endDate: Date) => {
    const diff = endDate.getTime() - Date.now();
    if (diff <= 0) return null;

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(() => calculateTimeLeft(new Date(promotion.endDate)));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(new Date(promotion.endDate)));
    }, 1000);

    return () => clearInterval(interval);
  }, [promotion.endDate]);

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

  const fetchLeads = async () => {
    if (!promotion.sku) return;
    setLoading(true);
    const res = await getLeadsByPromotion(promotion.sku);
    setLeads(res);
    setLoading(false);
  };

  return (
    <div className="relative">
      <Dialog onOpenChange={(open) => open && fetchLeads()}>
        <div className="group bg-gray-50 dark:bg-black cursor-pointer shadow-md hover:shadow-lg rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] relative">
          <div className="relative w-full h-56 sm:h-64">
            <Image
              src={promotion.photo || "/assets/images/logo.png"}
              alt={promotion.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-300 dark:bg-gray-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent group-hover:scale-105 transition-transform duration-300" />
          </div>

          {isPaused && (
            <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
              Paused
            </span>
          )}

          <div className="p-5 flex justify-between items-center gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors line-clamp-1 w-4/5">
                {promotion.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-1 w-4/5">
                {promotion.description}
              </p>
            </div>
            <DialogTrigger asChild>
              <button className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500 text-white shadow w-28">
                See Details
              </button>
            </DialogTrigger>
            {timeLeft && (
              <div className="absolute top-0 left-0 z-10 bg-white rounded-xl rounded-tr-none rounded-bl-none px-4 py-3 shadow-lg flex items-center gap-3">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hour", value: timeLeft.hours },
                  { label: "Minutes", value: timeLeft.minutes },
                  { label: "Seconds", value: timeLeft.seconds },
                ].map((item, index) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium">
                        {item.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 leading-none">
                        {String(item.value).padStart(2, "0")}
                      </p>
                    </div>

                    {index < 3 && (
                      <span className="text-2xl font-bold text-gray-400 pb-1">
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isAdmin && (
              <span className="absolute top-3 right-3 p-2 text-xs font-semibold rounded-full bg-white/50 text-black shadow">
                <UpdatePromotionDialog
                  promotion={promotion}
                  promotionId={promotion._id.toString()}
                  agency={agency}
                  courses={courses}
                  services={services}
                  type="Card"
                />
              </span>
            )}
          </div>
        </div>

        <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 bg-white dark:bg-black rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Promotion Details
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {promotion.title} {isPaused && "(Paused)"}
            </h2>
          </div>

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

          {/* DETAILS */}
          <div className="space-y-5 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
            <p>{promotion.description}</p>

            {promotion.criteria && (
              <p>
                <span className="font-medium">Eligibility:</span>{" "}
                {promotion.criteria}
              </p>
            )}

            {Array.isArray(promotion.countries) &&
              promotion.countries?.length > 0 && (
                <p>
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

            {/* COURSES */}
            {Array.isArray(promotion.course) &&
              promotion.course?.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-3">🎓 Courses</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {promotion.course.map((c) => (
                      <div
                        key={c.name}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white/60 dark:bg-gray-800/60"
                      >
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {c.courseType} – {c.courseDuration}
                        </p>
                        <p className="text-xs mt-1">
                          <span className="font-medium">Campus:</span>{" "}
                          {c.campus?.name} ({c.campus?.shift})
                        </p>
                        <p className="text-xs">
                          <span className="font-medium">Fee:</span> €
                          {c.courseFee}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                          {new Date(
                            c.startDate || new Date(),
                          ).toLocaleDateString()}{" "}
                          →{" "}
                          {new Date(
                            c.endDate || new Date(),
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* SERVICES */}
            {Array.isArray(promotion.services) &&
              promotion.services?.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-3">🛠 Services</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {promotion.services.map((s) => (
                      <div
                        key={s._id.toString()}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white/60 dark:bg-gray-800/60"
                      >
                        <p className="font-medium">{s.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {s.serviceType}
                        </p>
                        <p className="text-xs mt-1">{s.description}</p>
                        <p className="text-xs mt-1">
                          <span className="font-medium">Amount:</span> €
                          {s.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {promotion.discount && (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="inline-block px-3 py-1 text-sm font-semibold rounded-lg bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white shadow">
                  🎉 Special Discount: €{promotion.discount}
                </span>
                <div>
                  {promotion?.commissionAmount && (
                    <>
                      <span className="inline-block px-3 py-1 text-sm font-semibold rounded-lg text-black border shadow">
                        Your Commission: €{promotion.commissionAmount}
                      </span>
                    </>
                  )}
                  {promotion?.commissionPercent && (
                    <>
                      <span className="inline-block px-3 py-1 text-sm font-semibold rounded-lg text-black border shadow">
                        Your Commission: %{promotion.commissionPercent}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Create Lead
            </h3>

            <a
              href={`/promotions/${promotion._id.toString()}/leads/create`}
              className="w-full"
            >
              <button
                disabled={isPaused}
                className={`w-full px-5 py-2 rounded-lg ${
                  isPaused
                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                    : "bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:opacity-90 text-white"
                } font-medium shadow transition`}
              >
                {isPaused ? "Paused" : "Get Started"}
              </button>
            </a>
          </div>

          {isAdmin && (
            <div className="mt-10 pt-8 border-t border-gray-300 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5">
                Promotion Statistics
              </h3>

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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionCard;
