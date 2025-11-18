"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteLead } from "@/lib/actions/lead.actions";
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
  Copy,
  MessageCircle,
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
import { Types } from "mongoose";

interface ICombinedItem {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  number?: string;
  quotationStatus?: boolean;
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
    _id: Types.ObjectId;
    serviceType: string;
    title: string;
    amount?: string;
    description?: string;
  }[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  author?: string;
  isAdditional?: boolean;
  type: "Lead" | "Quotation";
}

const InvoiceTable = ({ leads }: { leads: ICombinedItem[] }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "name" | "date" | "quotationStatus" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    };
    fetchProfiles();
  }, [leads]);

  // Filter and Sort
  const filteredLeads = useMemo(() => {
    const filtered = [...leads].filter((lead) =>
      [
        lead.name,
        lead.email,
        lead.number,
        lead.home?.country,
        lead.quotationStatus || false,
      ]
        .filter(Boolean)
        .some((value) =>
          (value?.toString() || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
    );

    filtered.sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then sort by selected key
      if (sortKey) {
        let valueA: string | number = "";
        let valueB: string | number = "";

        if (sortKey === "date") {
          valueA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          valueB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        } else if (sortKey === "quotationStatus") {
          valueA = a.quotationStatus ? 1 : 0;
          valueB = b.quotationStatus ? 1 : 0;
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
  }, [leads, searchQuery, sortKey, sortOrder]);

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
      <Input
        placeholder="Search leads..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-md rounded-2xl"
      />

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
              <TableHead>Course & Campus</TableHead>
              <TableHead>Course + Services Fees</TableHead>
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

                    {/* Course & Services */}
                    <TableCell>
                      {lead.course ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-xs"
                            >
                              View Courses & Services
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3 space-y-2 rounded-xl shadow-lg">
                            {Array.isArray(lead.course) &&
                              lead.course.map((c, i) => (
                                <div
                                  key={i}
                                  className="border-b last:border-0 pb-2 last:pb-0 mb-2 last:mb-0"
                                >
                                  <p className="font-semibold text-sm">
                                    {c.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-300">
                                    {c.courseType} • {c.courseDuration}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-300">
                                    Fee: €{c.courseFee || 0}
                                  </p>
                                </div>
                              ))}
                            {Array.isArray(lead.services) &&
                              lead.services.map((c, i) => (
                                <div
                                  key={i}
                                  className="border-b last:border-0 pb-2 last:pb-0 mb-2 last:mb-0"
                                >
                                  <p className="font-semibold text-sm">
                                    {c.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-300">
                                    {c.serviceType}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-300">
                                    Fee: €{c.amount || 0}
                                  </p>
                                </div>
                              ))}
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          No course details
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="text-gray-500 dark:text-gray-300">
                          €{courseAmount} + €{servicesTotal}
                        </div>
                        <div className="text-gray-500 dark:text-gray-300">
                          Discount: €{discount}
                        </div>
                        <div>Total €{grandTotal}</div>
                      </div>
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
                          {/* Generate Quotation */}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-purple-500 gap-2"
                            asChild
                          >
                            <a
                              href={`/quotation/${lead._id.toString()}/invoice`}
                            >
                              <FileText className="w-4 h-4" />
                              Generate Invoice
                            </a>
                          </Button>

                          {/* Copy Quotation Link */}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-blue-500 gap-2"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${
                                  window.location.origin
                                }/quotation/${lead._id.toString()}/invoice`
                              );
                              toast.success("Quotation link copied!");
                            }}
                          >
                            <Copy className="w-4 h-4" />
                            Copy Link
                          </Button>

                          {/* WhatsApp Share */}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-green-600 gap-2"
                            onClick={() => {
                              const url = `${
                                window.location.origin
                              }/quotation/${lead._id.toString()}/invoice`;
                              const text = encodeURIComponent(
                                `Check this lead: ${url}`
                              );
                              window.open(
                                `https://wa.me/?text=${text}`,
                                "_blank"
                              );
                            }}
                          >
                            <MessageCircle className="w-4 h-4 text-green-600" />
                            Share via WhatsApp
                          </Button>

                          {/* Chat on WhatsApp */}
                          {lead.number && (
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-green-700 gap-2"
                              onClick={() => {
                                const phone = lead.number?.replace(/\D/g, "");
                                window.open(`https://wa.me/${phone}`, "_blank");
                              }}
                            >
                              <MessageCircle className="w-4 h-4 text-green-700" />
                              Chat on WhatsApp
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

export default InvoiceTable;
