"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  MoreVertical,
  FileText,
} from "lucide-react";
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

const CommissionCalcTable = ({
  leads,
  // isAdmin,
  // email,
}: {
  leads: ICombinedItem[];
  isAdmin: boolean;
  email?: string;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "date" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [profiles, setProfiles] = useState<Record<string, IProfile>>({});
  const [localLeads, setLocalLeads] = useState<ICombinedItem[]>(leads);

  useEffect(() => {
    setLocalLeads(leads);
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

  const filteredLeads = useMemo(() => {
    const startDate = getStartDate(dateFilter);

    const filtered = [...localLeads].filter((lead) => {
      const matchesSearch = [
        lead.name,
        lead.email,
        lead.number,
        lead.home?.country,
      ]
        .filter(Boolean)
        .some((value) =>
          (value?.toString() || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

      const paymentDate = lead.paymentAcceptedAt
        ? new Date(lead.paymentAcceptedAt)
        : null;

      const matchesDate =
        !startDate || (paymentDate && paymentDate >= startDate);

      return matchesSearch && matchesDate;
    });

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

  return (
    <div className="space-y-6">
      {/* filters unchanged */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search finance..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-2xl"
        />

        <select
          value={dateFilter}
          onChange={(e) =>
            setDateFilter(e.target.value as "day" | "week" | "month" | "all")
          }
          className="px-4 py-2 rounded-2xl border"
        >
          <option value="all">All Time</option>
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-gray-800">
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead onClick={() => handleSort("name")} className="text-white cursor-pointer">
                Name
              </TableHead>
              <TableHead className="text-white">Agency</TableHead>
              <TableHead className="text-white">Fees</TableHead>
              <TableHead className="text-white">Commission</TableHead>
              <TableHead onClick={() => handleSort("date")} className="text-white cursor-pointer">
                Date
              </TableHead>
              <TableHead className="text-white">Actions</TableHead>
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

              const servicesTotal = Array.isArray(lead.services)
                ? lead.services.reduce(
                    (sum, s) => sum + Number(s.amount || 0),
                    0
                  )
                : 0;

              const discount = Number(lead.discount) || 0;
              const grandTotal = courseAmount + servicesTotal - discount;

              // ✅ COMMISSION LOGIC (ADDED)
              const commissionPercent = Number(profile?.commission || 0);
              const commissionAmount =
                commissionPercent > 0
                  ? (grandTotal * commissionPercent) / 100
                  : 0;

              return (
                <TableRow key={lead._id.toString()}>
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </TableCell>

                  <TableCell>{lead.name}</TableCell>

                  <TableCell>
                    <div className="font-semibold">{profile?.name ?? "N/A"}</div>
                    <div className="text-sm">{profile?.email}</div>
                  </TableCell>

                  <TableCell className="font-semibold">
                    €{grandTotal}
                  </TableCell>

                  {/* ✅ COMMISSION CELL */}
                  <TableCell>
                    <div className="font-semibold">
                      €{commissionAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {commissionPercent}%
                    </div>
                    {commissionPercent === 0 && (
                      <div className="text-xs text-red-500">
                        No commission set
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString("en-GB")
                      : "N/A"}
                  </TableCell>

                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="icon" variant="outline">
                          <MoreVertical />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end">
                        {lead.paymentStatus === "Accepted" ? (
                          <Button asChild variant="ghost" className="w-full">
                            <a href={`/finance/${lead._id}/receipt`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Receipt
                            </a>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No receipt yet
                          </span>
                        )}
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* pagination unchanged */}
      <div className="flex justify-between items-center">
        <span className="text-sm">
          Showing {Math.min(itemsPerPage * currentPage, filteredLeads.length)} of{" "}
          {filteredLeads.length}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={
              currentPage === Math.ceil(filteredLeads.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommissionCalcTable;
