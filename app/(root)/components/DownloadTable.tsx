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
import { Trash, SortAsc, SortDesc, Pencil } from "lucide-react";
import { deleteDownload } from "@/lib/actions/download.actions";
import { formatDateTime } from "@/lib/utils";
import { IDownload } from "@/lib/database/models/download.model";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const DownloadTable = ({
  downloads,
  isAdmin,
}: {
  downloads: Array<IDownload>;
  isAdmin: boolean;
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "email" | "author" | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredDownloads = useMemo(() => {
    const filtered = downloads.filter(
      (download) =>
        download.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        download.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        download.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        let valueA: string, valueB: string;

        switch (sortKey) {
          case "name":
            valueA = `${a.name}`.toLowerCase();
            valueB = `${b.name}`.toLowerCase();
            break;
          case "email":
            valueA = a.email.toLowerCase();
            valueB = b.email.toLowerCase();
            break;
          case "author":
            valueA = a.author?.toLowerCase() ?? "";
            valueB = b.author?.toLowerCase() ?? "";
            break;
          default:
            return 0;
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [downloads, searchQuery, sortKey, sortOrder]);

  const paginatedDownloads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDownloads.slice(start, start + itemsPerPage);
  }, [filteredDownloads, currentPage, itemsPerPage]);

  const handleDeleteDownload = async (downloadId: string) => {
    try {
      const response = await deleteDownload(downloadId);
      if (response) {
        toast.success("Download deleted successfully");
      }
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete download");
      console.error("Error deleting download:", error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "name" | "email" | "author") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name or email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full md:w-1/2 lg:w-1/3 rounded-2xl"
      />
      <div
        className="overflow-x-auto rounded-2xl bg-yellow-50 dark:bg-gray-800 scrollbar-hide"
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
        {" "}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>
                <div
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Name
                  {sortKey === "name" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead>
                <div
                  onClick={() => handleSort("email")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Email
                  {sortKey === "email" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead>
                <div
                  onClick={() => handleSort("author")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Agency
                  {sortKey === "author" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDownloads.map((download, index) => (
              <TableRow
                key={download._id.toString()}
                className="hover:bg-yellow-100 hover:dark:bg-gray-800"
              >
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>
                  <a
                    href={`/applications/${download._id.toString()}`}
                    className="line-clamp-1 w-40 md:w-auto hover:underline"
                  >
                    {download.name}
                  </a>
                </TableCell>
                <TableCell>
                  <a
                    href={`mailto:${download.email}`}
                    className="text-blue-800 dark:text-blue-400 font-semibold underline"
                    target="_blank"
                  >
                    {download.email}
                  </a>
                </TableCell>
                <TableCell>
                  <a
                    href={`mailto:${download.author}`}
                    className="text-blue-800 dark:text-blue-400 font-semibold underline"
                    target="_blank"
                  >
                    {download.author}
                  </a>
                </TableCell>
                <TableCell>{formatDateTime(download.date).dateOnly}</TableCell>
                <TableCell>
                  {download.documents?.length > 0 ? (
                    <select
                      onChange={(e) => {
                        const selectedUrl = e.target.value;
                        if (selectedUrl) window.open(selectedUrl, "_blank");
                      }}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="">Select Document</option>
                      {download.documents.map((doc, idx) => (
                        <option key={idx} value={doc.fileUrl}>
                          {doc.fileName || `Document ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-500 text-sm italic">
                      No documents
                    </span>
                  )}
                </TableCell>

                {isAdmin && (
                  <TableCell className="flex items-center space-x-2">
                    <a href={`/downloads/${download._id.toString()}/update`}>
                      <Button variant="outline" size="icon">
                        <Pencil className="w-4 h-4 text-purple-500" />
                      </Button>
                    </a>
                    <Button
                      onClick={() =>
                        setConfirmDeleteId(download._id.toString())
                      }
                      variant={"outline"}
                      size={"icon"}
                      className="text-red-500"
                    >
                      <Trash />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4 w-full">
        <span className="text-sm text-muted-foreground line-clamp-1">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredDownloads.length)} of{" "}
          {filteredDownloads.length} downloads
        </span>
        <div className="flex items-center space-x-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            size={"sm"}
            className="rounded-2xl"
          >
            Previous
          </Button>
          <Button
            disabled={
              currentPage === Math.ceil(filteredDownloads.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
            size={"sm"}
            className="rounded-2xl"
          >
            Next
          </Button>
        </div>
      </div>
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-black p-6 rounded-md space-y-4">
            <p>Are you sure you want to delete this download?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant={"outline"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteDownload(confirmDeleteId)}
                variant={"destructive"}
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

export default DownloadTable;
