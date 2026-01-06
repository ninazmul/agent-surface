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
import {
  SortAsc,
  SortDesc,
  ExternalLink,
  Copy,
  Trash2,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteCampaignFormById } from "@/lib/actions/campaign.actions";

interface CampaignForm {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
}

interface CampaignFormsTableProps {
  forms: CampaignForm[];
  onDeleted?: () => void;
}

const CampaignFormsTable = ({
  forms: initialForms,
  onDeleted,
}: CampaignFormsTableProps) => {
  const [forms, setForms] = useState(initialForms);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "createdAt" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!selectedFormId) return;

    try {
      await deleteCampaignFormById(selectedFormId); // assume it throws if fails
      toast.success("Form deleted successfully");

      // Remove deleted form from state
      setForms((prev) => prev.filter((f) => f._id !== selectedFormId));

      // Close modal and reset
      setShowConfirm(false);
      setSelectedFormId(null);

      // Optional callback to refresh parent
      onDeleted?.();
    } catch (err) {
      toast.error("Error deleting form");
      console.error(err);
    }
  };

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
        className="overflow-x-auto rounded-2xl bg-white dark:bg-gray-800"
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
                  <TableCell className="font-medium hover:underline">
                    <a href={`/leads/campaigns/${form._id}`}>{form.title}</a>
                  </TableCell>
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

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        const link = `${shareUrl}`;
                        if (navigator.share) {
                          await navigator.share({
                            title: "Share Campaign Form",
                            url: link,
                          });
                        } else {
                          navigator.clipboard.writeText(link);
                          toast.success("Link copied (Share unavailable)");
                        }
                      }}
                    >
                      <Share2 size={16} />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedFormId(form._id);
                        setShowConfirm(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
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

      {/* Delete Confirmation Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this form? This action cannot be
            undone.
          </p>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignFormsTable;
