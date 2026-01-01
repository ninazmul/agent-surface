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
  Trash,
  SortAsc,
  SortDesc,
  Pencil,
  MoreVertical,
  Play,
  Pause,
} from "lucide-react";
import {
  deletePromotion,
  updatePromotion,
} from "@/lib/actions/promotion.actions";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import { IPromotion } from "@/lib/database/models/promotion.model";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PromotionTable = ({ promotions }: { promotions: IPromotion[] }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof IPromotion | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredPromotions = useMemo(() => {
    const filtered = promotions.filter((promotion) =>
      [promotion.title, promotion.description, promotion.criteria].some(
        (field) => field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const aValue = a[sortKey]?.toString().toLowerCase() || "";
        const bValue = b[sortKey]?.toString().toLowerCase() || "";
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [promotions, searchQuery, sortKey, sortOrder]);

  const paginatedPromotions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPromotions.slice(start, start + itemsPerPage);
  }, [filteredPromotions, currentPage, itemsPerPage]);

  const handleDeletePromotion = async (id: string) => {
    try {
      const res = await deletePromotion(id);
      if (res) {
        toast.success("Promotion deleted");
        window.location.reload();
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: keyof IPromotion) => {
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
        placeholder="Search title, description, country..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full sm:w-auto sm:min-w-[220px] rounded-2xl"
      />
      <div
        className="overflow-x-auto rounded-2xl bg-white dark:bg-gray-800 scrollbar-hide"
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
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead className="text-white cursor-pointer">#</TableHead>
              <TableHead className="text-white cursor-pointer">Photo</TableHead>
              <TableHead
                className="text-white cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Title{" "}
                {sortKey === "title" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Description
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Criteria
              </TableHead>
              <TableHead className="text-white cursor-pointer">Date</TableHead>
              <TableHead className="text-white cursor-pointer">
                Courses & Services
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Countries
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Agencies
              </TableHead>
              <TableHead className="text-white cursor-pointer">SKU</TableHead>
              <TableHead className="text-white cursor-pointer">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedPromotions.map((promotion, index) => (
              <TableRow
                key={promotion._id.toString()}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b-0"
              >
                <TableCell className="align-top">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                {/* Photo */}
                <TableCell className="align-top">
                  {promotion.photo ? (
                    <Image
                      src={promotion.photo}
                      alt="Photo"
                      width={50}
                      height={50}
                      className="rounded"
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="align-top">{promotion.title}</TableCell>
                <TableCell className="max-w-40 truncate align-top">
                  {promotion.description}
                </TableCell>
                <TableCell className="max-w-40 truncate align-top">
                  {promotion.criteria}
                </TableCell>
                <TableCell className="align-top">
                  {formatDateTime(promotion.startDate).dateOnly} <br />
                  {formatDateTime(promotion.endDate).dateOnly}
                </TableCell>

                {/* Courses & Services */}
                <TableCell className="align-top">
                  {promotion.course?.length || promotion.services?.length ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full px-4 py-2 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border text-center"
                        >
                          View Details
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3 space-y-2 rounded-xl shadow-lg">
                        {promotion.course?.map((c, i) => (
                          <div
                            key={i}
                            className="border-b last:border-0 pb-2 last:pb-0 mb-2 last:mb-0"
                          >
                            <p className="font-semibold text-sm">{c.name}</p>
                            <p className="text-xs text-gray-500">
                              {c.courseType} • {c.courseDuration}
                            </p>
                            <p className="text-xs text-gray-600">
                              Fee: €{c.courseFee || 0}
                            </p>
                          </div>
                        ))}
                        {promotion.services?.map((s, i) => (
                          <div
                            key={i}
                            className="border-b last:border-0 pb-2 last:pb-0 mb-2 last:mb-0"
                          >
                            <p className="font-semibold text-sm">{s.title}</p>
                            <p className="text-xs text-gray-500">
                              {s.serviceType}
                            </p>
                            <p className="text-xs text-gray-600">
                              Amount: €{s.amount || 0}
                            </p>
                          </div>
                        ))}
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>

                {/* Countries */}
                <TableCell className="align-top">
                  {promotion.countries?.length ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full px-4 py-2 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border text-center"
                        >
                          {promotion.countries.length} Countries
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-3 rounded-xl shadow-lg">
                        <h4 className="font-semibold text-sm mb-2">
                          Available in
                        </h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {promotion.countries.map((country, i) => (
                            <li key={i} className="text-sm">
                              {country}
                            </li>
                          ))}
                        </ul>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span className="text-gray-400 text-sm text-center">-</span>
                  )}
                </TableCell>

                {/* Agencies */}
                <TableCell className="align-top">
                  {promotion.agencies?.length ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full px-4 py-2 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border text-center"
                        >
                          {promotion.agencies.length} Agencies
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3 space-y-2 rounded-xl shadow-lg">
                        <h4 className="font-semibold text-sm mb-2">
                          Assigned Agencies
                        </h4>
                        <ul className="space-y-1">
                          {promotion.agencies.map((email, i) => (
                            <li key={i} className="text-sm">
                              {email}
                            </li>
                          ))}
                        </ul>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span className="text-gray-400 text-sm text-center">-</span>
                  )}
                </TableCell>

                <TableCell className="align-top">{promotion.sku}</TableCell>

                {/* Actions */}
                <TableCell className="relative text-right align-top">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full p-1"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-56 p-2 space-y-1 rounded-xl shadow-lg"
                    >
                      {/* Edit */}
                      <a
                        href={`/promotions/${promotion._id.toString()}/update`}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-purple-500 gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit Promotion
                        </Button>
                      </a>

                      {/* Pause / Activate */}
                      <Button
                        variant={promotion.isPaused ? "destructive" : "ghost"}
                        className="w-full justify-start gap-2"
                        onClick={async () => {
                          try {
                            await updatePromotion(promotion._id.toString(), {
                              isPaused: !promotion.isPaused,
                            });
                            toast.success(
                              `Promotion ${
                                !promotion.isPaused ? "paused" : "activated"
                              }`
                            );
                            window.location.reload();
                          } catch {
                            toast.error("Failed to update status");
                          }
                        }}
                      >
                        {promotion.isPaused ? (
                          <>
                            <Play className="w-4 h-4" />
                            Activate
                          </>
                        ) : (
                          <>
                            <Pause className="w-4 h-4" />
                            Pause
                          </>
                        )}
                      </Button>

                      {/* Delete */}
                      <Button
                        onClick={() =>
                          setConfirmDeleteId(promotion._id.toString())
                        }
                        variant="ghost"
                        className="w-full justify-start text-red-500 gap-2"
                      >
                        <Trash className="w-4 h-4" />
                        Delete Lead
                      </Button>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min(currentPage * itemsPerPage, filteredPromotions.length)} of{" "}
          {filteredPromotions.length}
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
              currentPage ===
              Math.ceil(filteredPromotions.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-md space-y-4">
            <p>Are you sure you want to delete this promotion?</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeletePromotion(confirmDeleteId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionTable;
