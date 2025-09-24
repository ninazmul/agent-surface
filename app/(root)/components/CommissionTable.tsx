"use client";

import { useEffect, useMemo, useState } from "react";
import { updateLead } from "@/lib/actions/lead.actions";
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
  Clock,
  CheckCircle,
  FileText,
  Mail,
  XCircle,
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
import ProofOfPaymentModal from "./ProofOfPaymentModal";
import { updateQuotation } from "@/lib/actions/quotation.actions";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTrack } from "@/lib/actions/track.actions";

interface ICombinedItem {
  _id: string;
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

const CommissionTable = ({
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
  const [profiles, setProfiles] = useState<Record<string, IProfile>>({});
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [localLeads, setLocalLeads] = useState<ICombinedItem[]>(leads);

  useEffect(() => {
    setLocalLeads(leads); // sync when prop changes
  }, [leads]);

  // Dynamic Email State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: "", html: "" });
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);

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
    const filtered = [...localLeads].filter((lead) => {
      return [
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
    });

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
  }, [localLeads, searchQuery, sortKey, sortOrder]);

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

  // Open email modal
  const openEmailModal = (emails: string[]) => {
    setEmailRecipients(emails);
    setEmailContent({ subject: "", html: "" });
    setEmailModalOpen(true);
  };

  const handleSendEmailWithContent = async () => {
    if (emailRecipients.length === 0) return;

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        body: JSON.stringify({
          recipients: emailRecipients.map((email) => ({
            email,
            subject: emailContent.subject,
            html: emailContent.html,
          })),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success(`Emails sent to ${emailRecipients.length} recipient(s)!`);

        // ✅ Parallel track creation
        await Promise.all(
          emailRecipients.map(async (email) => {
            const lead = leads.find((l) => l.email === email);

            return createTrack({
              student: email,
              event: `Email sent to ${lead?.name || email}`,
              route: `/leads`,
              status: emailContent.subject || "No subject",
            });
          })
        );

        setEmailModalOpen(false);
        setSelectedLeads([]);
      } else {
        toast.error("Failed to send emails");
      }
    } catch (err) {
      toast.error("Error sending emails");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search finance..."
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
              <TableHead>
                <input
                  type="checkbox"
                  checked={selectedLeads.length === paginatedLeads.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLeads(paginatedLeads.map((r) => r._id));
                    } else setSelectedLeads([]);
                  }}
                />
              </TableHead>
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
              <TableHead>Course & Services</TableHead>
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
                    key={lead._id}
                    className={`hover:bg-pink-100 dark:hover:bg-gray-800 border-b-0 ${
                      lead.isPinned
                        ? "bg-yellow-200 border-l-4 border-yellow-400 dark:text-black dark:hover:bg-yellow-300"
                        : ""
                    }`}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads((prev) => [...prev, lead._id]);
                          } else {
                            setSelectedLeads((prev) =>
                              prev.filter((id) => id !== lead._id)
                            );
                          }
                        }}
                      />
                    </TableCell>
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
                          {/* Transcript(s) */}
                          <ProofOfPaymentModal lead={lead as ICombinedItem} />

                          {lead.paymentStatus === "Accepted" && (
                            <>
                              {/* Payment Receipt */}
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-purple-500 gap-2"
                                asChild
                              >
                                <a href={`/commissions/${lead._id}/receipt`}>
                                  <FileText className="w-4 h-4" />
                                  Payment Receipt
                                </a>
                              </Button>
                            </>
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
                                      l._id === lead._id
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
                                      lead._id,
                                      updatePayload
                                    );
                                  } else {
                                    updated = await updateLead(
                                      lead._id,
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
                                    route: `/commissions`,
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

                          {/* Send Email */}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-blue-500 gap-2"
                            onClick={() => openEmailModal([lead.email || ""])}
                          >
                            <Mail className="w-4 h-4 text-blue-500" />
                            Send Email
                          </Button>
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

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-900 text-black dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Subject"
              value={emailContent.subject}
              onChange={(e) =>
                setEmailContent((prev) => ({
                  ...prev,
                  subject: e.target.value,
                }))
              }
            />
            <textarea
              placeholder="Email content"
              className="w-full h-40 border rounded-md p-2"
              value={emailContent.html}
              onChange={(e) =>
                setEmailContent((prev) => ({ ...prev, html: e.target.value }))
              }
            />
            <p className="text-sm text-muted-foreground">
              Sending to {emailRecipients.length} recipient(s)
            </p>
          </div>
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmailWithContent}>Send Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommissionTable;
