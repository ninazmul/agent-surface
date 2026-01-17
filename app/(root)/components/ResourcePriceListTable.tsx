"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, SortAsc, SortDesc, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteStudentResource } from "@/lib/actions/student-resource.actions";
import { IResourcePriceList } from "@/lib/database/models/resource-pricelist.model";
import Image from "next/image";
import UpdateResourcePricelistDialog from "@/components/shared/UpdateResourcePricelistDialog";

const ResourcePriceListCards = ({
  resources,
  isAdmin,
}: {
  resources: Array<IResourcePriceList>;
  isAdmin: boolean;
}) => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"fileName" | "country" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewResource, setPreviewResource] =
    useState<IResourcePriceList | null>(null);
  const [isPdfFile, setIsPdfFile] = useState(false);

  /* ---------------- Filtering & Sorting ---------------- */

  const filteredResources = useMemo(() => {
    const filtered = resources.filter(
      (r) =>
        r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const A =
          sortKey === "fileName"
            ? a.fileName.toLowerCase()
            : a.country.toLowerCase();
        const B =
          sortKey === "fileName"
            ? b.fileName.toLowerCase()
            : b.country.toLowerCase();

        if (A < B) return sortOrder === "asc" ? -1 : 1;
        if (A > B) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [resources, searchQuery, sortKey, sortOrder]);

  /* ---------------- Pagination ---------------- */

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResources.slice(start, start + itemsPerPage);
  }, [filteredResources, currentPage]);

  /* ---------------- Actions ---------------- */

  const handleSort = (key: "fileName" | "country") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudentResource(id);
      toast.success("Resource deleted successfully");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete resource");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  /* ---------------- PDF Detection ---------------- */

  const checkIsPDF = async (url: string) => {
    try {
      const res = await fetch(url, { method: "HEAD" });
      const contentType = res.headers.get("content-type") || "";
      return contentType.includes("pdf");
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (previewResource) {
      (async () => {
        const pdf = await checkIsPDF(previewResource.link);
        setIsPdfFile(pdf);
      })();
    }
  }, [previewResource]);

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-6">
      {/* Search & Sort */}
      <div className="flex flex-wrap gap-3 items-center p-1">
        <Input
          placeholder="Search by file name or country"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-2xl sm:max-w-xs"
        />

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSort("fileName")}
          className="flex items-center gap-2 rounded-2xl"
        >
          File Name
          {sortKey === "fileName" &&
            (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSort("country")}
          className="flex items-center gap-2 rounded-2xl"
        >
          Country
          {sortKey === "country" &&
            (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedResources.map((resource) => (
          <div
            key={resource._id.toString()}
            onClick={() => setPreviewResource(resource)}
            className="cursor-pointer rounded-2xl border bg-white dark:bg-gray-800 p-5 space-y-3 hover:shadow-lg transition"
          >
            <div>
              <h3 className="font-semibold line-clamp-1 truncate">
                {resource.fileName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {resource.country}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Download
              </a>

              {isAdmin && (
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <UpdateResourcePricelistDialog
                    resource={resource}
                    resourceId={resource._id.toString()}
                  />
                  <Trash
                    className="w-4 h-4 text-red-600 cursor-pointer"
                    onClick={() => setConfirmDeleteId(resource._id.toString())}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min(currentPage * itemsPerPage, filteredResources.length)} of{" "}
          {filteredResources.length}
        </span>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="rounded-2xl bg-black disabled:bg-muted-foreground hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-500 text-white dark:text-gray-100 w-full flex items-center gap-2 justify-center"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            size="sm"
            className="rounded-2xl bg-black disabled:bg-muted-foreground hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-500 text-white dark:text-gray-100 w-full flex items-center gap-2 justify-center"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={
              currentPage === Math.ceil(filteredResources.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full p-6">
            <button
              onClick={() => setPreviewResource(null)}
              className="absolute top-4 right-4 text-gray-700 dark:text-gray-200"
            >
              <X />
            </button>

            <h2 className="font-semibold mb-4">{previewResource.fileName}</h2>

            {isPdfFile ? (
              <iframe
                src={previewResource.link}
                className="w-full h-[70vh] rounded-xl"
              />
            ) : (
              <div className="relative w-full h-[70vh]">
                <Image
                  src={previewResource.link}
                  alt={previewResource.fileName}
                  fill
                  className="object-contain rounded-xl"
                  sizes="100vw"
                />
              </div>
            )}

            <div className="flex justify-end mt-4">
              <a
                href={previewResource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-black text-white"
              >
                Open / Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl space-y-4">
            <p>Are you sure you want to delete this resource?</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(confirmDeleteId)}
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

export default ResourcePriceListCards;
