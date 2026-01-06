"use client";

import { useMemo, useState } from "react";
import { deleteRefund, updateRefund } from "@/lib/actions/refund.actions";
import { IRefund } from "@/lib/database/models/refund.model";
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
import { Trash, SortAsc, SortDesc, StickyNote } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import RefundForm from "./RefundForm";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ICourse } from "@/lib/database/models/course.model";

const RefundTable = ({
  refunds,
  isAdmin,
}: {
  refunds: IRefund[];
  courses?: ICourse[];
  isAdmin?: boolean;
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "name" | "email" | "author" | "progress" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredRefunds = useMemo(() => {
    const filtered = refunds.filter((refund) =>
      [
        refund.name,
        refund.email,
        refund.number,
        refund.leadNumber,
        refund.note,
        refund.progress,
      ].some((value) =>
        (value ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valueA =
          sortKey === "author" ? a.author : a[sortKey]?.toLowerCase?.() || "";
        const valueB =
          sortKey === "author" ? b.author : b[sortKey]?.toLowerCase?.() || "";
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [refunds, searchQuery, sortKey, sortOrder]);

  const paginatedRefunds = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRefunds.slice(start, start + itemsPerPage);
  }, [filteredRefunds, currentPage, itemsPerPage]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleDeleteRefund = async (id: string) => {
    try {
      const res = await deleteRefund(id);
      if (res) toast.success("Refund deleted successfully.");
      router.refresh();
    } catch {
      toast.error("Failed to delete refund.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleProgressChange = async (
    refundId: string,
    newProgress: string
  ) => {
    try {
      const response = await updateRefund(refundId, {
        progress: newProgress,
      });
      if (response) {
        toast.success(`Progress upauthord to ${newProgress}`);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to upauthor progress");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search by any field"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-md rounded-2xl"
      />

      <div className="overflow-auto rounded-2xl bg-green-50 dark:bg-gray-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">#</TableHead>
              <TableHead className="whitespace-nowrap">Regi.</TableHead>
              <TableHead
                onClick={() => handleSort("name")}
                className="cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  Name{" "}
                  {sortKey === "name" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Number</TableHead>
              {isAdmin && (
                <TableHead
                  onClick={() => handleSort("author")}
                  className="cursor-pointer whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Agency{" "}
                    {sortKey === "author" &&
                      (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                  </div>
                </TableHead>
              )}
              <TableHead className="whitespace-nowrap">Note</TableHead>
              <TableHead
                onClick={() => handleSort("progress")}
                className="cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  Progress{" "}
                  {sortKey === "progress" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>

              {isAdmin && (
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRefunds.map((refund, idx) => (
              <TableRow
                key={refund._id.toString()}
                className="hover:bg-green-100 dark:hover:bg-gray-800"
              >
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </TableCell>
                <TableCell>{refund.leadNumber}</TableCell>
                <TableCell>{refund.name}</TableCell>
                <TableCell>{refund.email}</TableCell>
                <TableCell>{refund.number}</TableCell>
                {isAdmin && <TableCell>{refund.author}</TableCell>}
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-blue-500"
                      >
                        <StickyNote size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-xs text-sm">
                      {refund.note || "No note available."}
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <select
                    value={refund.progress}
                    onChange={(e) =>
                      handleProgressChange(
                        refund._id.toString(),
                        e.target.value
                      )
                    }
                    disabled={!isAdmin}
                    className={`border rounded-md px-2 py-1 text-sm font-semibold ${
                      refund.progress === "Pending"
                        ? "bg-gray-100 text-gray-700"
                        : refund.progress === "Processing"
                        ? "bg-yellow-100 text-yellow-700"
                        : refund.progress === "Paid"
                        ? "bg-green-100 text-green-700"
                        : refund.progress === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : ""
                    } ${!isAdmin && "appearance-none text-center"}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Paid">Paid</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-blue-500"
                            >
                              <Image
                                src="/assets/icons/edit.svg"
                                alt="edit"
                                width={18}
                                height={18}
                              />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="bg-white w-full sm:max-w-md">
                            <SheetHeader>
                              <SheetTitle>Update Refund</SheetTitle>
                              <SheetDescription>
                                Modify this refund&apos;s information.
                              </SheetDescription>
                            </SheetHeader>
                            <div className="py-5">
                              <RefundForm
                                Refund={refund}
                                RefundId={refund._id.toString()}
                                type="Update"
                              />
                            </div>
                          </SheetContent>
                        </Sheet>
                        <Button
                          onClick={() =>
                            setConfirmDeleteId(refund._id.toString())
                          }
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                        >
                          <Trash size={18} />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
        <span className="text-sm text-muted-foreground">
          Showing {Math.min(itemsPerPage * currentPage, filteredRefunds.length)}{" "}
          of {filteredRefunds.length} refunds
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="rounded-2xl"
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={
              currentPage === Math.ceil(filteredRefunds.length / itemsPerPage)
            }
            className="rounded-2xl"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-80 space-y-4">
            <p className="text-center text-sm">
              Are you sure you want to delete this refund?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteRefund(confirmDeleteId!)}
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

export default RefundTable;
