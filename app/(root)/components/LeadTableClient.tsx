"use client";

import { useState } from "react";
import LeadTable from "./LeadTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PaginationMeta } from "@/types/pagination";
import { LeadDTO } from "@/types";

interface LeadTableClientProps {
  initialLeads: LeadDTO[];
  pagination: PaginationMeta;
  isAdmin: boolean;
  email: string;
}

const LeadTableClient = ({
  initialLeads,
  pagination,
  isAdmin,
  email,
}: LeadTableClientProps) => {
  const router = useRouter();
  const [page, setPage] = useState(pagination.page);

  const goToPage = (p: number) => {
    setPage(p);
    router.push(`/leads?page=${p}`);
  };

  return (
    <section className="p-4">
      <LeadTable leads={initialLeads} isAdmin={isAdmin} email={email} />

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 w-2/3">
        <Button
          disabled={!pagination.hasPrevPage}
          onClick={() => goToPage(page - 1)}
        >
          Previous
        </Button>

        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>

        <Button
          disabled={!pagination.hasNextPage}
          onClick={() => goToPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </section>
  );
};

export default LeadTableClient;
