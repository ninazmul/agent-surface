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
import { deleteResource } from "@/lib/actions/resource.actions";
import { IResource } from "@/lib/database/models/resource.model";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ResourceTable = ({
  resources,
  isAdmin,
}: {
  resources: Array<IResource>;
  isAdmin: boolean;
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"fileName" | "category" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredResources = useMemo(() => {
    const filtered = resources.filter(
      (resource) =>
        resource.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        let valueA: string, valueB: string;

        switch (sortKey) {
          case "fileName":
            valueA = `${a.fileName}`.toLowerCase();
            valueB = `${b.fileName}`.toLowerCase();
            break;
          case "category":
            valueA = a.category.toLowerCase();
            valueB = b.category.toLowerCase();
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
  }, [resources, searchQuery, sortKey, sortOrder]);

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResources.slice(start, start + itemsPerPage);
  }, [filteredResources, currentPage, itemsPerPage]);

  const handleDeleteResource = async (resourceId: string) => {
    try {
      const response = await deleteResource(resourceId);
      if (response) {
        toast.success("Resource deleted successfully");
      }
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete resource");
      console.error("Error deleting resource:", error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "fileName" | "category") => {
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
        placeholder="Search by File Name or category"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full md:w-1/2 lg:w-1/3 rounded-2xl"
      />
      <div
        className="overflow-x-auto rounded-2xl bg-purple-50 dark:bg-gray-800 scrollbar-hide"
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
              <TableHead>#</TableHead>
              <TableHead>
                <div
                  onClick={() => handleSort("fileName")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  File Name
                  {sortKey === "fileName" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead>
                <div
                  onClick={() => handleSort("category")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Category
                  {sortKey === "category" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead>Download</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedResources.map((resource, index) => (
              <TableRow key={resource._id} className="hover:bg-purple-100">
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>
                  <a
                    href={`/applications/${resource._id}`}
                    className="line-clamp-1 w-40 md:w-auto hover:underline"
                  >
                    {resource.fileName}
                  </a>
                </TableCell>
                <TableCell className="line-clamp-1 w-40 md:w-auto">
                  {resource.category}
                </TableCell>
                <TableCell>
                  <a href={resource.link} target="_blank">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      Download
                    </Button>
                  </a>
                </TableCell>

                {isAdmin && (
                  <>
                    <TableCell className="flex items-center space-x-2">
                      <a href={`/resources/${resource._id}/update`}>
                        <Button variant="outline" size="icon">
                          <Pencil className="w-4 h-4 text-purple-500" />
                        </Button>
                      </a>
                      <Button
                        onClick={() => setConfirmDeleteId(resource._id)}
                        variant={"outline"}
                        className="text-red-500"
                      >
                        <Trash />
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4 w-full">
        <span className="text-sm text-muted-foreground line-clamp-1">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredResources.length)} of{" "}
          {filteredResources.length} resources
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
              currentPage === Math.ceil(filteredResources.length / itemsPerPage)
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
            <p>Are you sure you want to delete this resource?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant={"outline"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteResource(confirmDeleteId)}
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

export default ResourceTable;
