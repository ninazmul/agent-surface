"use client";

import { useState, useMemo } from "react";
import { deleteService } from "@/lib/actions/service.actions";
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
import { Trash, SortAsc, SortDesc, StickyNote, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { IServices } from "@/lib/database/models/service.model";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ServiceTable = ({ services }: { services: Array<IServices> }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "createdAt" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredServices = useMemo(() => {
    const filtered = services.filter((service) =>
      [service.title, service.description].some((value) =>
        value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valueA =
          sortKey === "createdAt"
            ? new Date(a.createdAt).getTime()
            : a[sortKey]?.toLowerCase?.() || "";
        const valueB =
          sortKey === "createdAt"
            ? new Date(b.createdAt).getTime()
            : b[sortKey]?.toLowerCase?.() || "";
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [services, searchQuery, sortKey, sortOrder]);

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await deleteService(serviceId);
      if (response) {
        toast.success("Service deleted successfully");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to delete service");
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "title" | "createdAt") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search by title or description"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full sm:w-auto sm:min-w-[220px] rounded-2xl"
      />
      <div
        className="overflow-x-auto rounded-2xl bg-white dark:bg-gray-800"
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
        <Table className="table-fixed min-w-[1400px]">
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead className="text-white cursor-pointer">#</TableHead>
              <TableHead className="text-white cursor-pointer">
                <div
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Title
                  {sortKey === "title" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Description
              </TableHead>
              <TableHead className="text-white cursor-pointer">Type</TableHead>
              <TableHead className="text-white cursor-pointer">
                Start Date
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                End Date
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Amount
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.map((service, index) => (
              <TableRow
                key={service._id.toString()}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b-0"
              >
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="line-clamp-1 truncate">
                  {service.title}
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border">
                        <StickyNote size={14} />
                        Description
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-xs text-sm">
                      {service.description}
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>{service.serviceType}</TableCell>
                <TableCell>
                  {new Date(service.startDate).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell>
                  {service.endDate
                    ? new Date(service.endDate).toLocaleDateString("en-GB")
                    : "N/A"}
                </TableCell>
                <TableCell>{`€${service.amount}` || "N/A"}</TableCell>
                <TableCell className="flex items-center space-x-2">
                  <a href={`/services/${service._id.toString()}/update`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-4 h-4 text-black" />
                    </Button>
                  </a>
                  <Button
                    onClick={() => setConfirmDeleteId(service._id.toString())}
                    variant={"ghost"}
                    size={"icon"}
                  >
                    <Trash className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredServices.length)} of{" "}
          {filteredServices.length} services
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="rounded-2xl bg-black disabled:bg-muted-foreground  hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-500 text-white dark:text-gray-100 w-full flex items-center gap-2 justify-center"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            size="sm"
            className="rounded-2xl bg-black disabled:bg-muted-foreground  hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-500 text-white dark:text-gray-100 w-full flex items-center gap-2 justify-center"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={
              currentPage === Math.ceil(filteredServices.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white text-black p-6 rounded-md space-y-4 shadow-md">
            <p>Are you sure you want to delete this service?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteService(confirmDeleteId)}
                variant="destructive"
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

export default ServiceTable;
