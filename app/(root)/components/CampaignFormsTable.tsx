"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortAsc, SortDesc, ExternalLink, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface CampaignForm {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
}

const CampaignFormsTable = ({ forms }: { forms: CampaignForm[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "createdAt" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  /* ---------------------------- filtering + sorting ---------------------------- */
  const filteredForms = useMemo(() => {
    const filtered = forms.filter((form) =>
      [form.title, form.slug].some((value) =>
        value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valueA =
          sortKey === "createdAt"
            ? new Date(a.createdAt).getTime()
            : a[sortKey].toLowerCase();
        const valueB =
          sortKey === "createdAt"
            ? new Date(b.createdAt).getTime()
            : b[sortKey].toLowerCase();

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [forms, searchQuery, sortKey, sortOrder]);

  const paginatedForms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredForms.slice(start, start + itemsPerPage);
  }, [filteredForms, currentPage]);

  const handleSort = (key: "title" | "createdAt") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  /* -------------------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Search */}
      <Input
        placeholder="Search by title or slug"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full sm:w-auto sm:min-w-[220px] rounded-2xl"
      />

      {/* Table */}
      <div
        className="overflow-x-auto rounded-2xl bg-white dark:bg-gray-800 scrollbar-hide"
        style={{ cursor: "grab" }}
      >
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead className="text-white">#</TableHead>

              <TableHead className="text-white">
                <div
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Title
                  {sortKey === "title" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>

              <TableHead className="text-white">Slug</TableHead>

              <TableHead className="text-white">
                <div
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Created
                  {sortKey === "createdAt" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>

              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedForms.map((form, index) => {
              const shareUrl = `${baseUrl}/campaign/${form.slug}`;

              return (
                <TableRow
                  key={form._id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b-0"
                >
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>

                  <TableCell className="font-medium">{form.title}</TableCell>

                  <TableCell className="text-sm text-gray-500">
                    {form.slug}
                  </TableCell>

                  <TableCell>
                    {new Date(form.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>

                  <TableCell className="flex items-center gap-2">
                    {/* Open */}
                    <a href={shareUrl} target="_blank">
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>

                    {/* Copy */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success("Link copied");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground">
          Showing {Math.min(itemsPerPage * currentPage, filteredForms.length)}{" "}
          of {filteredForms.length} forms
        </span>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="rounded-2xl bg-black disabled:bg-muted-foreground hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-500 text-white"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <Button
            size="sm"
            className="rounded-2xl bg-black disabled:bg-muted-foreground hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-500 text-white"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={
              currentPage === Math.ceil(filteredForms.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignFormsTable;
