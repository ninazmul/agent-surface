"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteLead, updateLead } from "@/lib/actions/lead.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SortAsc,
  SortDesc,
  MoreVertical,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { IProfile } from "@/lib/database/models/profile.model";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateQuotation } from "@/lib/actions/quotation.actions";
import { createTrack } from "@/lib/actions/track.actions";
import { Types } from "mongoose";

interface ICombinedItem {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  number?: string;
  quotationStatus?: boolean;
  paymentStatus?: string;
  paymentAcceptedAt?: Date;
  isPinned?: boolean;
  discount?: number | string;
  home: {
    address: string;
    zip: string;
    country: string;
    state: string;
    city: string;
  };
  course?: {
    name: string;
    courseDuration?: string;
    courseType?: string;
    courseFee?: string;
  }[];
  services?: {
    _id: string;
    serviceType: string;
    title: string;
    amount?: string;
    description?: string;
  }[];
  transcript?: {
    amount: string;
    method: string;
    fileUrl: string;
  }[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  author?: string;
  isAdditional?: boolean;
  type: "Lead" | "Quotation";
}

const CommissionReceivedTable = ({
  leads,
  isAdmin,
  email,
}: {
  leads: ICombinedItem[];
  isAdmin: boolean;
  email?: string;
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "name" | "date" | "paymentStatus" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, IProfile>>({});
  const [localLeads, setLocalLeads] = useState<ICombinedItem[]>(leads);

  useEffect(() => {
    setLocalLeads(leads); // sync when prop changes
  }, [leads]);

  const [dateFilter, setDateFilter] = useState<
    "day" | "week" | "month" | "all"
  >("all");

  const getStartDate = useCallback((filter: typeof dateFilter) => {
    const now = new Date();
    if (filter === "day") return new Date(now.setHours(0, 0, 0, 0));
    if (filter === "week") {
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);
      return firstDayOfWeek;
    }
    if (filter === "month")
      return new Date(now.getFullYear(), now.getMonth(), 1);
    return null;
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      const newProfiles: Record<string, IProfile> = {};
      await Promise.all(
        leads.map(async (lead) => {
          if (!lead.author) return;
          const profile = await getProfileByEmail(lead.author);
          if (profile) newProfiles[lead.author] = profile;
        })
      );
      setProfiles(newProfiles);
    };
    fetchProfiles();
  }, [leads]);

  // Filter and Sort
  const filteredLeads = useMemo(() => {
    const startDate = getStartDate(dateFilter);

    const filtered = [...localLeads].filter((lead) => {
      // ✅ Text search
      const matchesSearch = [
        lead.name,
        lead.email,
        lead.number,
        lead.home?.country,
        lead.paymentStatus || "Not Available",
      ]
        .filter(Boolean)
        .some((value) =>
          (value?.toString() || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

      // ✅ Date filter based on paymentAcceptedAt
      const paymentDate = lead.paymentAcceptedAt
        ? new Date(lead.paymentAcceptedAt)
        : null;
      const matchesDate =
        !startDate || (paymentDate && paymentDate >= startDate);

      return matchesSearch && matchesDate;
    });

    // ✅ Keep existing sort
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortKey) {
        let valueA: string | number = "";
        let valueB: string | number = "";

        if (sortKey === "date") {
          valueA = a.paymentAcceptedAt
            ? new Date(a.paymentAcceptedAt).getTime()
            : 0;
          valueB = b.paymentAcceptedAt
            ? new Date(b.paymentAcceptedAt).getTime()
            : 0;
        } else if (sortKey === "paymentStatus") {
          valueA = a.paymentStatus ? 1 : 0;
          valueB = b.paymentStatus ? 1 : 0;
        } else {
          valueA = (a[sortKey] as string)?.toLowerCase?.() || "";
          valueB = (b[sortKey] as string)?.toLowerCase?.() || "";
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [getStartDate, dateFilter, localLeads, searchQuery, sortKey, sortOrder]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      const res = await deleteLead(id);
      if (res) toast.success("Lead deleted successfully.");
      router.refresh();
    } catch {
      toast.error("Failed to delete lead.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search finance..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md rounded-2xl"
        />

        <select
          value={dateFilter}
          onChange={(e) =>
            setDateFilter(e.target.value as "day" | "week" | "month" | "all")
          }
          className="border rounded-2xl px-3 py-2"
        >
          <option value="all">All Time</option>
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div
        className="overflow-x-auto rounded-2xl bg-pink-50 dark:bg-gray-800 scrollbar-hide"
        style={{ cursor: "grab" }}
        onMouseDown={(e) => {
          const el = e.currentTarget;
          el.style.cursor = "grabbing";
          const startX = e.pageX - el.offsetLeft;
          const scrollLeft = el.scrollLeft;

          const onMouseMove = (eMove: MouseEvent) => {
            const x = eMove.pageX - el.offsetLeft;
            const walk = x - startX;
            el.scrollLeft = scrollLeft - walk;
          };

          const onMouseUp = () => {
            el.style.cursor = "grab";
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
          };

          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name & Email{" "}
                {sortKey === "name" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Fees</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("paymentStatus")}
              >
                Status{" "}
                {sortKey === "paymentStatus" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Date{" "}
                {sortKey === "date" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead, idx) => {
              const profile = lead.author ? profiles[lead.author] : undefined;

              const courseAmount = Array.isArray(lead.course)
                ? lead.course.reduce(
                    (sum, s) => sum + Number(s.courseFee || 0),
                    0
                  )
                : 0;
              const discount = Number(lead.discount) || 0;
              const servicesTotal = Array.isArray(lead.services)
                ? lead.services.reduce(
                    (sum, s) => sum + Number(s.amount || 0),
                    0
                  )
                : 0;
              const grandTotal = courseAmount + servicesTotal - discount;

              return (
                <>
                  <TableRow
                    key={lead._id.toString()}
                    className={`hover:bg-pink-100 dark:hover:bg-gray-800 border-b-0 ${
                      lead.isPinned
                        ? "bg-yellow-200 border-l-4 border-yellow-400 dark:text-black dark:hover:bg-yellow-300"
                        : ""
                    }`}
                  >
                    <TableCell>
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </TableCell>

                    {/* Name & Email */}
                    <TableCell>
                      <a className="flex flex-col">
                        <span className="font-semibold flex items-center gap-2">
                          <span className="line-clamp-1">{lead.name}</span>
                          {lead.isAdditional ? (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-600 border border-yellow-300">
                              Additional
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                              General
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          {lead.email}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-300">
                          {lead.number}
                        </span>
                      </a>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {profile?.name ?? "Name: N/A"}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          {profile?.email ?? "Email: N/A"}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-300">
                          {profile?.number ?? "Phone: N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold">
                      <div className="text-sm space-y-1">
                        {/* Paid & Due calculation */}
                        {(() => {
                          const paidAmount = Array.isArray(lead.transcript)
                            ? lead.transcript.reduce(
                                (sum, t) => sum + Number(t.amount || 0),
                                0
                              )
                            : 0;

                          const dueAmount = grandTotal - paidAmount;

                          return (
                            <>
                              <div>Total €{grandTotal}</div>
                              {paidAmount > 0 && (
                                <div className="text-green-600 dark:text-green-400">
                                  Paid: €{paidAmount}
                                </div>
                              )}
                              <div className="text-red-600 dark:text-red-400">
                                Due: €{dueAmount}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>

                    {/* PaymentStatus */}
                    <TableCell>
                      {(() => {
                        const statusStyles: Record<string, string> = {
                          Accepted: "bg-green-100 text-green-600",
                          Pending: "bg-yellow-100 text-yellow-600",
                          Rejected: "bg-red-100 text-red-600",
                          NA: "bg-gray-100 text-gray-600",
                        };

                        const status = lead.paymentStatus || "NA";

                        return (
                          <p
                            className={`border rounded-md px-2 py-1 text-sm font-semibold ${statusStyles[status]}`}
                          >
                            {status === "NA" ? "N/A" : status}
                          </p>
                        );
                      })()}
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>
                          <strong>Created:</strong>{" "}
                          {lead.createdAt
                            ? new Date(lead.createdAt).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                              })
                            : "N/A"}
                        </span>
                        <span>
                          <strong>Updated:</strong>{" "}
                          {lead.updatedAt
                            ? new Date(lead.updatedAt).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                              })
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="relative text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full p-1"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="w-56 p-2 space-y-1 rounded-xl shadow-lg"
                        >
                          {lead.paymentStatus === "Accepted" ? (
                            <>
                              {/* Payment Receipt */}
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-purple-500 gap-2"
                                asChild
                              >
                                <a
                                  href={`/finance/${lead._id.toString()}/receipt`}
                                >
                                  <FileText className="w-4 h-4" />
                                  Payment Receipt
                                </a>
                              </Button>
                            </>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-300 italic">
                              No payment receipt available yet.
                            </p>
                          )}

                          {/* Admin-only: Update Status */}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-2"
                              onClick={async () => {
                                try {
                                  let updated;

                                  // cycle through statuses
                                  const nextStatus:
                                    | "Pending"
                                    | "Accepted"
                                    | "Rejected" =
                                    lead.paymentStatus === "Pending"
                                      ? "Accepted"
                                      : lead.paymentStatus === "Accepted"
                                      ? "Rejected"
                                      : "Pending";

                                  const updatePayload: {
                                    paymentStatus:
                                      | "Pending"
                                      | "Accepted"
                                      | "Rejected";
                                    paymentAcceptedAt?: Date | null;
                                  } = { paymentStatus: nextStatus };

                                  if (nextStatus === "Accepted") {
                                    updatePayload.paymentAcceptedAt =
                                      new Date();
                                  } else {
                                    updatePayload.paymentAcceptedAt = null;
                                  }

                                  // ✅ Optimistic update
                                  setLocalLeads((prev) =>
                                    prev.map((l) =>
                                      l._id.toString() === lead._id.toString()
                                        ? ({
                                            ...l,
                                            ...updatePayload,
                                          } as ICombinedItem)
                                        : l
                                    )
                                  );

                                  // Update backend
                                  if ("quotationNumber" in lead) {
                                    updated = await updateQuotation(
                                      lead._id.toString(),
                                      updatePayload
                                    );
                                  } else {
                                    updated = await updateLead(
                                      lead._id.toString(),
                                      updatePayload
                                    );
                                  }

                                  const newStatus =
                                    updated?.paymentStatus ?? nextStatus;

                                  toast.success(
                                    `Payment status set to ${newStatus}`
                                  );

                                  await createTrack({
                                    student: updated.email,
                                    event: `${updated.name}'s payment status set to ${newStatus} by ${email}`,
                                    route: `/finance/received`,
                                    status: newStatus,
                                  });

                                  router.refresh(); // still keep this to sync with DB
                                } catch (err) {
                                  console.error(err);
                                  toast.error(
                                    "Failed to update payment status."
                                  );
                                }
                              }}
                            >
                              {lead.paymentStatus === "Accepted" ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-600" />{" "}
                                  Payment Accepted
                                  {lead.paymentAcceptedAt && (
                                    <span className="ml-2 text-xs text-gray-500">
                                      (
                                      {new Date(
                                        lead.paymentAcceptedAt
                                      ).toLocaleString()}
                                      )
                                    </span>
                                  )}
                                </>
                              ) : lead.paymentStatus === "Rejected" ? (
                                <>
                                  <XCircle className="w-4 h-4 text-red-600" />{" "}
                                  Payment Rejected
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 text-yellow-600" />{" "}
                                  Pending
                                </>
                              )}
                            </Button>
                          )}
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
        <span className="text-sm text-muted-foreground">
          Showing {Math.min(itemsPerPage * currentPage, filteredLeads.length)}{" "}
          of {filteredLeads.length} leads
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="rounded-2xl"
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={
              currentPage === Math.ceil(filteredLeads.length / itemsPerPage)
            }
            className="rounded-2xl"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-80 space-y-4">
            <p className="text-center text-sm">
              Are you sure you want to delete this lead?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteLead(confirmDeleteId!)}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionReceivedTable;
