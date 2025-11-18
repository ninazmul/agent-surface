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
        router.refresh();
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
    <div className="space-y-4">
      <Input
        placeholder="Search title, description, country..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-md rounded-2xl"
      />
      <div
        className="overflow-x-auto rounded-2xl bg-fuchsia-50 dark:bg-gray-800 scrollbar-hide"
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
              <TableHead
                onClick={() => handleSort("title")}
                className="cursor-pointer"
              >
                Title{" "}
                {sortKey === "title" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Criteria</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Courses & Services</TableHead>
              <TableHead>Countries</TableHead>
              <TableHead>Agencies</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Photo</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedPromotions.map((promotion, index) => (
              <TableRow
                key={promotion._id.toString()}
                className="hover:bg-fuchsia-100 dark:hover:bg-gray-800"
              >
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>{promotion.title}</TableCell>
                <TableCell className="max-w-40 truncate">
                  {promotion.description}
                </TableCell>
                <TableCell className="max-w-40 truncate">
                  {promotion.criteria}
                </TableCell>
                <TableCell>
                  {formatDateTime(promotion.startDate).dateOnly} -{" "}
                  {formatDateTime(promotion.endDate).dateOnly}
                </TableCell>

                {/* Courses & Services */}
                <TableCell>
                  {promotion.course?.length || promotion.services?.length ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs"
                        >
                          View
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
                <TableCell>
                  {promotion.countries?.length ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs"
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
                <TableCell>
                  {promotion.agencies?.length ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs"
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

                <TableCell>{promotion.sku}</TableCell>

                {/* Photo */}
                <TableCell>
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

                {/* Actions */}
                <TableCell className="relative text-right">
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
                        variant={promotion.isPaused ? "destructive" : "outline"}
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
                            router.refresh();
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
        <div className="space-x-2">
          <Button
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="rounded-2xl"
          >
            Previous
          </Button>
          <Button
            size="sm"
            disabled={
              currentPage ===
              Math.ceil(filteredPromotions.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((p) => p + 1)}
            className="rounded-2xl"
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
