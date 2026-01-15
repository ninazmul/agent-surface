"use client";

import { useEffect, useMemo, useState } from "react";
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
import { MoreVertical, FileText } from "lucide-react";
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
  isPromotion?: boolean;
  promotionSku?: string;
  commissionAmount?: string;
  commissionPercent?: string;
  source?: string;
  type: "Lead" | "Quotation";
}

const CommissionCalcTable = ({
  leads,
}: {
  leads: ICombinedItem[];
  isAdmin: boolean;
  email?: string;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [profiles, setProfiles] = useState<Record<string, IProfile>>({});
  const [localLeads, setLocalLeads] = useState<ICombinedItem[]>(leads);

  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const map: Record<string, IProfile> = {};
      await Promise.all(
        leads.map(async (lead) => {
          if (!lead.author) return;
          const profile = await getProfileByEmail(lead.author);
          if (profile) map[lead.author] = profile;
        })
      );
      setProfiles(map);
    };
    fetchProfiles();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const filtered = [...localLeads].filter((lead) => {
      return [lead.name, lead.email, lead.number, lead.home?.country]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    if (sortKey === "name") {
      filtered.sort((a, b) => {
        const aVal = a.name?.toLowerCase() || "";
        const bVal = b.name?.toLowerCase() || "";
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    return filtered;
  }, [localLeads, searchQuery, sortKey, sortOrder]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search only */}
      <Input
        placeholder="Search finance..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="rounded-2xl max-w-sm"
      />

      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-gray-800">
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead
                onClick={() => handleSort("name")}
                className="text-white cursor-pointer"
              >
                Name
              </TableHead>
              <TableHead className="text-white">Agency</TableHead>
              <TableHead className="text-white">Fees</TableHead>
              <TableHead className="text-white">Commission</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedLeads.map((lead, idx) => {
              const profile = lead.author ? profiles[lead.author] : undefined;

              const courseAmount =
                lead.course?.reduce(
                  (sum, c) => sum + Number(c.courseFee || 0),
                  0
                ) || 0;

              const servicesTotal =
                lead.services?.reduce(
                  (sum, s) => sum + Number(s.amount || 0),
                  0
                ) || 0;

              const discount = Number(lead.discount) || 0;
              const grandTotal = courseAmount + servicesTotal - discount;

              let commissionAmount = 0;
              let commissionPercent = 0;

              // Promotion logic overrides profile
              if (lead.isPromotion) {
                if (lead.commissionAmount) {
                  // Fixed commission
                  commissionAmount = Number(lead.commissionAmount);
                } else if (lead.commissionPercent) {
                  // Percentage commission
                  commissionPercent = Number(lead.commissionPercent);
                  commissionAmount = (grandTotal * commissionPercent) / 100;
                } else {
                  // Fallback to profile commission
                  commissionPercent = Number(profile?.commission || 0);
                  commissionAmount = (grandTotal * commissionPercent) / 100;
                }
              } else {
                // Normal lead → profile commission
                commissionPercent = Number(profile?.commission || 0);
                commissionAmount = (grandTotal * commissionPercent) / 100;
              }

              return (
                <TableRow key={lead._id.toString()}>
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </TableCell>

                  <TableCell className="w-max align-top">
                    <a
                      href={`/leads/${lead._id.toString()}`}
                      className="flex flex-col space-y-1"
                    >
                      <span className="font-semibold flex items-center gap-2 line-clamp-1">
                        {lead.name}
                      </span>

                      <span className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                        {lead.email}
                      </span>

                      <span className="flex items-center justify-around gap-2 w-max">
                        <span className="px-3 py-1 w-full rounded-full text-center text-xs font-semibold border">
                          {lead.home.country}
                        </span>
                        <span
                          className={`px-3 py-1 w-full rounded-full text-center text-xs font-semibold border ${
                            lead.isPromotion
                              ? "bg-purple-100 text-purple-700 border-purple-300"
                              : lead.source
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }`}
                        >
                          {lead.isPromotion
                            ? "Promotion"
                            : lead.source
                            ? lead.source.charAt(0).toUpperCase() +
                              lead.source.slice(1)
                            : "General"}
                        </span>
                      </span>
                    </a>
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold">
                      {profile?.name ?? "N/A"}
                    </div>
                    <div className="text-sm">{profile?.email}</div>
                  </TableCell>

                  <TableCell className="w-max font-semibold align-top">
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

                  <TableCell>
                    <div className="font-semibold">
                      €{commissionAmount.toFixed(2)}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {commissionPercent > 0
                        ? `${commissionPercent}%`
                        : "Fixed"}
                    </div>

                    {commissionPercent === 0 && (
                      <div className="text-xs text-red-500">
                        No commission set
                      </div>
                    )}
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

      {/* Pagination unchanged */}
      <div className="flex justify-between items-center">
        <span className="text-sm">
          Showing {Math.min(itemsPerPage * currentPage, filteredLeads.length)}{" "}
          of {filteredLeads.length}
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
