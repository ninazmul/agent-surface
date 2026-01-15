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
              const profile = lead.author
                ? profiles[lead.author]
                : undefined;

              const courseAmount = lead.course?.reduce(
                (sum, c) => sum + Number(c.courseFee || 0),
                0
              ) || 0;

              const servicesTotal = lead.services?.reduce(
                (sum, s) => sum + Number(s.amount || 0),
                0
              ) || 0;

              const discount = Number(lead.discount) || 0;
              const grandTotal = courseAmount + servicesTotal - discount;

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
                    <div className="font-semibold">
                      {profile?.name ?? "N/A"}
                    </div>
                    <div className="text-sm">{profile?.email}</div>
                  </TableCell>

                  <TableCell className="font-semibold">
                    €{grandTotal}
                  </TableCell>

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
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredLeads.length)} of{" "}
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
