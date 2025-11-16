"use client";

import { useEffect, useMemo, useState } from "react";
import {
  assignLeadToUser,
  deleteLead,
  updateLead,
} from "@/lib/actions/lead.actions";
import { ILead } from "@/lib/database/models/lead.model";
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
  Trash,
  SortAsc,
  SortDesc,
  Pencil,
  PinOff,
  Pin,
  Mail,
  MoreVertical,
  QrCode,
  FileText,
  Copy,
  TrainTrackIcon,
  ShieldHalf,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IProfile } from "@/lib/database/models/profile.model";
import {
  getProfileByEmail,
  getSubAgentsByEmail,
} from "@/lib/actions/profile.actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import LeadQRCode from "@/components/shared/RegistrationQRCode";
import { getAllPromotions } from "@/lib/actions/promotion.actions";
import { IPromotion } from "@/lib/database/models/promotion.model";
import { createTrack, getTracksByStudent } from "@/lib/actions/track.actions";
import { IStudentEvent, ITrack } from "@/lib/database/models/track.model";
import { ImFacebook, ImInstagram, ImSkype, ImTwitter } from "react-icons/im";
import countries from "world-countries";
import { getAllAdmins } from "@/lib/actions/admin.actions";

type PinUnpinStatus = ILead & { isPinned: "pinned" | "unpinned" };

const LeadTable = ({
  leads,
  isAdmin,
  email,
}: {
  leads: ILead[];
  isAdmin?: boolean;
  email: string;
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "name" | "date" | "progress" | "status" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [localLeads, setLocalLeads] = useState<ILead[]>(leads);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Record<string, IProfile>>({});

  const [promotionFilter, setPromotionFilter] = useState<
    "all" | "promotion" | "general"
  >("all");

  // Dynamic Email State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: "", html: "" });
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackData, setTrackData] = useState<ITrack | null>(null);

  const [promotions, setPromotions] = useState<
    { title: string; sku: string }[]
  >([]);
  const [promotionSkuFilter, setPromotionSkuFilter] = useState<string>("all");
  const [allProfiles, setAllProfiles] = useState<IProfile[]>([]);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (isAdmin) {
        const data = await getAllAdmins();
        setAllProfiles(data || []);
      } else {
        const data = await getSubAgentsByEmail(email);
        setAllProfiles(data || []);
      }
    };
    fetchProfiles();
  }, [email, isAdmin, setAllProfiles]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const newProfiles: Record<string, IProfile> = {};
      await Promise.all(
        localLeads.map(async (lead) => {
          if (!lead.author) return;
          const profile = await getProfileByEmail(lead.author);
          if (profile) newProfiles[lead.author] = profile;
        })
      );
      setProfiles(newProfiles);
    };
    fetchProfiles();
  }, [localLeads]);

  useEffect(() => {
    const fetchPromotions = async () => {
      const allPromotions = await getAllPromotions();
      setPromotions(
        allPromotions.map((p: IPromotion) => ({ title: p.title, sku: p.sku }))
      );
    };
    fetchPromotions();
  }, []);

  // Filter and Sort
  const filteredLeads = useMemo(() => {
    let filtered = localLeads.filter((lead) =>
      [lead.name, lead.email, lead.number, lead.home?.country, lead.progress]
        .filter(Boolean)
        .some((value) =>
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    // Promotion type filter
    if (promotionFilter === "promotion")
      filtered = filtered.filter((lead) => lead.isPromotion);
    else if (promotionFilter === "general")
      filtered = filtered.filter((lead) => !lead.isPromotion);

    // --- NEW: Filter by promotion SKU ---
    if (promotionSkuFilter !== "all") {
      filtered = filtered.filter(
        (lead) => lead.promotionSku === promotionSkuFilter
      );
    }

    // Pinned leads first
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    // Sort by selected key
    if (sortKey) {
      filtered.sort((a, b) => {
        const valueA =
          sortKey === "date"
            ? new Date(a.date).getTime()
            : a[sortKey]?.toLowerCase?.() || "";
        const valueB =
          sortKey === "date"
            ? new Date(b.date).getTime()
            : b[sortKey]?.toLowerCase?.() || "";
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    localLeads,
    searchQuery,
    sortKey,
    sortOrder,
    promotionFilter,
    promotionSkuFilter,
  ]);

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

  const handleProgressChange = async (leadId: string, newProgress: string) => {
    try {
      const updatedLead: ILead | null = await updateLead(leadId, {
        progress: newProgress,
      });

      if (updatedLead) {
        toast.success(`Progress updated to ${newProgress}`);

        await createTrack({
          student: updatedLead.email,
          event: `${updatedLead.name}'s progress updated`,
          route: `/leads/${leadId}`,
          status: newProgress,
        });

        setLocalLeads((prev) =>
          prev.map((lead) =>
            lead._id === leadId
              ? ({ ...lead, progress: newProgress } as ILead)
              : lead
          )
        );

        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to update progress");
      console.error(error);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const updatedLead: ILead | null = await updateLead(leadId, {
        status: newStatus,
      });

      if (updatedLead) {
        toast.success(`Status updated to ${newStatus}`);

        await createTrack({
          student: updatedLead.email,
          event: `${updatedLead.name}'s status updated`,
          route: `/leads/${leadId}`,
          status: newStatus,
        });

        setLocalLeads((prev) =>
          prev.map((lead) =>
            lead._id === leadId
              ? ({ ...lead, status: newStatus } as ILead)
              : lead
          )
        );

        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handlePinToggle = async (leadId: string, current: boolean) => {
    try {
      const response = await updateLead(leadId, {
        isPinned: !current,
      });

      if (response) {
        toast.success(`Lead ${!current ? "pinned" : "unpinned"}`);

        setLocalLeads((prev) =>
          prev.map((lead) =>
            lead._id === leadId
              ? ({
                  ...lead,
                  isPinned: !current,
                } as PinUnpinStatus)
              : lead
          )
        );
      }
    } catch (error) {
      toast.error("Failed to update pin status");
      console.error(error);
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
            const lead = localLeads.find((l) => l.email === email);

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

  const handleBulkAssign = async () => {
    if (assignedUsers.length === 0 || selectedLeads.length === 0) return;

    try {
      await Promise.all(
        selectedLeads.map((leadId) =>
          Promise.all(
            assignedUsers.map(
              (user) => assignLeadToUser(leadId, user) // your API call
            )
          )
        )
      );

      toast.success("Leads assigned successfully!");

      await Promise.all(
        selectedLeads.map(async (leadId) => {
          const lead = localLeads.find((l) => l._id === leadId);
          return createTrack({
            student: lead?.email || "",
            event: `Lead assigned to ${assignedUsers.join(", ")}`,
            route: `/leads/${leadId}`,
            status: `Assigned to ${assignedUsers.join(", ")}`,
          });
        })
      );

      setSelectedLeads([]);
      setAssignedUsers([]);
      setAssignModalOpen(false);

      setLocalLeads((prev) =>
        prev.map((lead) => {
          if (selectedLeads.includes(lead._id)) {
            lead.assignedTo = [
              ...(lead.assignedTo || []),
              ...assignedUsers.filter(
                (u) => !(lead.assignedTo || []).includes(u)
              ),
            ];
          }
          return lead;
        })
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign leads.");
    }
  };

  return (
    <div className="space-y-6">
      {/* --- Filters --- */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Input
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-md rounded-2xl"
        />

        {/* Promotion Type Filter */}
        <select
          value={promotionFilter}
          onChange={(e) =>
            setPromotionFilter(
              e.target.value as "all" | "promotion" | "general"
            )
          }
          className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
        >
          <option value="all">All Leads</option>
          <option value="promotion">Promotion Leads</option>
          <option value="general">General Leads</option>
        </select>

        {/* --- NEW: Promotion SKU Filter --- */}
        {isAdmin && (
          <select
            value={promotionSkuFilter}
            onChange={(e) => setPromotionSkuFilter(e.target.value)}
            className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border"
          >
            <option value="all">All Promotions</option>
            {promotions.map((promo) => (
              <option key={promo.sku} value={promo.sku}>
                {promo.title}
              </option>
            ))}
          </select>
        )}
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
          <TableHeader className="bg-gray-900 text-white">
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
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("progress")}
              >
                Progress{" "}
                {sortKey === "progress" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status{" "}
                {sortKey === "status" &&
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
              const progressColor =
                lead.progress === "Open"
                  ? "bg-gray-400"
                  : lead.progress === "Contacted"
                  ? "bg-yellow-500"
                  : lead.progress === "Converted"
                  ? "bg-green-500"
                  : lead.progress === "Closed"
                  ? "bg-red-500"
                  : "bg-gray-300";

              const progressValue =
                lead.progress === "Open"
                  ? 25
                  : lead.progress === "Contacted"
                  ? 50
                  : lead.progress === "Converted"
                  ? 75
                  : lead.progress === "Closed"
                  ? 100
                  : 0;

              const countryData = countries.find(
                (c) =>
                  c.name.common.toLowerCase() ===
                  lead.home.country.toLowerCase()
              );
              const flagEmoji = countryData?.flag; // 🏳️‍🌈 style emoji

              return (
                <>
                  <TableRow
                    key={idx}
                    className={`hover:bg-pink-100 dark:hover:bg-gray-800 border-b-0 ${
                      lead.isPinned
                        ? "bg-yellow-200 hover:bg-yellow-300 border-l-4 border-yellow-400 dark:text-black dark:hover:bg-yellow-300"
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

                    {/* Name & Email */}
                    <TableCell>
                      <a href={`/leads/${lead._id}`} className="flex flex-col">
                        <span className="font-semibold flex items-center gap-2">
                          <span className="line-clamp-1">{lead.name}</span>
                          {lead.isPromotion ? (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 border border-purple-300">
                              Promotion
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                              General
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1 ${
                            lead.isPinned ? "dark:text-gray-500" : ""
                          }`}
                        >
                          {lead.email}
                        </span>
                        <span
                          className={`text-sm text-gray-500 dark:text-gray-300  ${
                            lead.isPinned ? "dark:text-gray-500" : ""
                          }`}
                        >
                          {lead.number}
                        </span>
                      </a>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {profiles[lead.author] ? (
                            <>
                              {lead.author
                                ? profiles[lead.author]?.name
                                : "N/A"}
                            </>
                          ) : (
                            "Name: N/A"
                          )}
                        </span>
                        <span
                          className={`text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1  ${
                            lead.isPinned ? "dark:text-gray-500" : ""
                          }`}
                        >
                          {profiles[lead.author] ? (
                            <>
                              {lead.author
                                ? profiles[lead.author]?.email
                                : "N/A"}
                            </>
                          ) : (
                            "Email: N/A"
                          )}
                        </span>
                        <span
                          className={`text-sm text-gray-500 dark:text-gray-300  ${
                            lead.isPinned ? "dark:text-gray-500" : ""
                          }`}
                        >
                          {profiles[lead.author] ? (
                            <>
                              {lead.author
                                ? profiles[lead.author]?.number
                                : "N/A"}
                            </>
                          ) : (
                            "Phone: N/A"
                          )}
                        </span>
                        <span>
                          <span className="px-3 py-1 w-full rounded-full text-center text-xs font-semibold">
                            {flagEmoji} {lead.home.country}
                          </span>
                          <span
                            className={`inline-block px-3 py-1 w-full rounded-full text-center text-xs font-semibold
                          ${
                            lead.status === "Perception" &&
                            "bg-gray-100 text-gray-700"
                          }
                          ${
                            lead.status === "Cold" &&
                            "bg-blue-100 text-blue-700"
                          }
                          ${
                            lead.status === "Warm" &&
                            "bg-yellow-100 text-yellow-700"
                          }
                          ${lead.status === "Hot" && "bg-red-100 text-red-700"}
                          ${lead.status === "" && "bg-gray-100 text-gray-700"}
                        `}
                          >
                            {lead.status || "Perception"}
                          </span>
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

                    {/* Progress */}
                    <TableCell>
                      <select
                        value={lead.progress}
                        onChange={(e) =>
                          handleProgressChange(lead._id, e.target.value)
                        }
                        className={`border rounded-md px-2 py-1 text-sm font-semibold ${
                          lead.progress === "Open"
                            ? "bg-gray-100 text-gray-700"
                            : lead.progress === "Contacted"
                            ? "bg-yellow-100 text-yellow-700"
                            : lead.progress === "Converted"
                            ? "bg-green-100 text-green-700"
                            : lead.progress === "Closed"
                            ? "bg-red-100 text-red-700"
                            : ""
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusChange(lead._id, e.target.value)
                        }
                        className={`border rounded-md px-2 py-1 text-sm font-semibold ${
                          lead.status === "Perception"
                            ? "bg-gray-100 text-gray-700"
                            : lead.status === "Cold"
                            ? "bg-blue-100 text-blue-700"
                            : lead.status === "Warm"
                            ? "bg-yellow-100 text-yellow-700"
                            : lead.status === "Hot"
                            ? "bg-red-100 text-red-700"
                            : ""
                        }`}
                      >
                        <option value="Perception">👀 Perception</option>
                        <option value="Cold">❄️ Cold</option>
                        <option value="Warm">🔥 Warm</option>
                        <option value="Hot">⚡ Hot</option>
                      </select>
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
                              })
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Social icons */}
                    <TableCell className="flex items-center gap-2">
                      <a
                        href={lead.social?.facebook}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <ImFacebook size={18} />
                      </a>
                      <a
                        href={lead.social?.instagram}
                        target="_blank"
                        className="text-pink-600 hover:text-pink-800 transition"
                      >
                        <ImInstagram size={18} />
                      </a>
                      <a
                        href={lead.social?.skype}
                        target="_blank"
                        className="text-sky-600 hover:text-sky-800 transition"
                      >
                        <ImSkype size={18} />
                      </a>
                      <a
                        href={lead.social?.twitter}
                        target="_blank"
                        className="text-blue-400 hover:text-blue-600 transition"
                      >
                        <ImTwitter size={18} />
                      </a>
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
                          {/* Pin/Unpin */}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-yellow-600 gap-2"
                            onClick={() =>
                              handlePinToggle(lead._id, lead.isPinned ?? false)
                            }
                          >
                            {lead.isPinned ? (
                              <PinOff className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <Pin className="w-4 h-4 text-yellow-600" />
                            )}
                            {lead.isPinned ? "Unpin Lead" : "Pin Lead"}
                          </Button>

                          {/* Send Email */}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-blue-500 gap-2"
                            onClick={() => openEmailModal([lead.email])}
                          >
                            <Mail className="w-4 h-4 text-blue-500" />
                            Send Email
                          </Button>

                          {/* Generate Quotation */}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-purple-500 gap-2"
                            asChild
                          >
                            <a href={`/quotation/${lead._id}/`}>
                              <FileText className="w-4 h-4" />
                              Generate Quotation
                            </a>
                          </Button>

                          {/* Copy Lead Link */}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-blue-500 gap-2"
                            onClick={() => {
                              const link = `${window.location.origin}/lead/${lead._id}`;
                              setSelectedLink(link);
                              setLinkModalOpen(true);
                            }}
                          >
                            <Copy className="w-4 h-4" />
                            Copy Form Link
                          </Button>

                          {/* QR Code */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-gray-500 dark:text-gray-300 gap-2"
                              >
                                <QrCode className="w-4 h-4" />
                                QR Code
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-4 w-52 flex flex-col items-center">
                              <LeadQRCode
                                url={`${process.env.NEXT_PUBLIC_APP_URL}/lead/${lead._id}`}
                              />
                            </PopoverContent>
                          </Popover>

                          {/* Edit */}
                          <a href={`/leads/${lead._id}/update`}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-purple-500 gap-2"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit Lead
                            </Button>
                          </a>

                          <Button
                            onClick={() => {
                              if (selectedLeads.length === 0) {
                                setSelectedLeads(
                                  paginatedLeads.map((lead) => lead._id)
                                );
                              }
                              setAssignModalOpen(true);
                            }}
                            variant="ghost"
                            className="w-full justify-start text-blue-500 gap-2"
                          >
                            <ShieldHalf className="w-4 h-4 text-blue-500" />{" "}
                            Assign Lead
                          </Button>

                          {/* Delete */}
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-yellow-500 gap-2"
                                onClick={async () => {
                                  const data = await getTracksByStudent(
                                    lead.email
                                  );
                                  setTrackData(data);
                                  setIsTrackModalOpen(true);
                                }}
                              >
                                <TrainTrackIcon className="w-4 h-4 text-yellow-500" />
                                View Track
                              </Button>

                              <Button
                                onClick={() => setConfirmDeleteId(lead._id)}
                                variant="ghost"
                                className="w-full justify-start text-red-500 gap-2"
                              >
                                <Trash className="w-4 h-4" />
                                Delete Lead
                              </Button>
                            </>
                          )}
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>

                  {/* Full-width Progress Bar */}
                  <TableRow
                    className={
                      lead.isPinned
                        ? "bg-yellow-200 border-l-4 border-yellow-400 hover:bg-yellow-300 dark:hover:bg-yellow-300 dark:text-black"
                        : "border-t-0"
                    }
                  >
                    <TableCell colSpan={11}>
                      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-500">
                        <div
                          className={`h-2 rounded-full ${progressColor}`}
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
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
          <div className="bg-white text-black p-6 rounded-md w-80 space-y-4">
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

      {/* Link Modal */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 text-black dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>Form Link</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              value={selectedLink || ""}
              readOnly
              className="w-full rounded-md"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(selectedLink || "");
                  toast.success("Link copied!");
                }}
              >
                Copy
              </Button>
              <Button
                onClick={() => {
                  if (selectedLink) window.open(selectedLink, "_blank");
                }}
              >
                Open
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Track Modal */}
      <Dialog open={isTrackModalOpen} onOpenChange={setIsTrackModalOpen}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Student Track</DialogTitle>
          </DialogHeader>

          {trackData ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                <strong>Email:</strong> {trackData.student}
              </p>

              {/* Timeline */}
              <div className="relative border-l border-gray-300 pl-6 space-y-6">
                {trackData.events.map((event: IStudentEvent, index: number) => {
                  const status = event.status || "Unknown";
                  // Simple hash → pick one of Tailwind’s soft colors
                  const colors = [
                    "bg-blue-100 text-blue-700",
                    "bg-green-100 text-green-700",
                    "bg-purple-100 text-purple-700",
                    "bg-yellow-100 text-yellow-700",
                    "bg-pink-100 text-pink-700",
                    "bg-orange-100 text-orange-700",
                    "bg-gray-100 text-gray-700",
                    "bg-red-100 text-red-700",
                  ];
                  const hash = status
                    .split("")
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const colorClass = colors[hash % colors.length];

                  return (
                    <div key={index} className="relative">
                      {/* Dot */}
                      <span className="absolute -left-[9px] top-2 w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow" />

                      <div className="bg-gray-50 rounded-xl p-4 shadow-sm border">
                        <p className="font-medium text-gray-800">
                          {event.event}
                        </p>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
                          >
                            {event.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.createdAt).toLocaleString("en-US", {
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Route link */}
                        {event.route && (
                          <Button
                            variant="link"
                            size="sm"
                            asChild
                            className="mt-2 p-0"
                          >
                            <a href={event.route}>Go to Route →</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No tracking data found.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 text-black dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>Assign Selected Leads</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Assign {selectedLeads.length} lead(s) to user(s)
            </p>

            <div className="max-h-64 overflow-y-auto border rounded-md p-2">
              {allProfiles.map((user) => {
                const checked = assignedUsers.includes(user.email);

                return (
                  <label
                    key={user._id}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignedUsers((prev) => [...prev, user.email]);
                        } else {
                          setAssignedUsers((prev) =>
                            prev.filter((u) => u !== user.email)
                          );
                        }
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500">
                        {user.email}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        {user.country === "Bangladesh" && "🇧🇩"}
                        {user.country === "USA" && "🇺🇸"}
                        {user.country || ""}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAssign}
              disabled={!assignedUsers || selectedLeads.length === 0}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadTable;
