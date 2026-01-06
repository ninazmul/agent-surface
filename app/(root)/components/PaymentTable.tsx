"use client";

import { useMemo, useState } from "react";
import { deletePayment, updatePayment } from "@/lib/actions/payment.actions";
import { IPayment } from "@/lib/database/models/payment.model";
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
import {
  Trash,
  SortAsc,
  SortDesc,
  RefreshCcw,
  Pencil,
  Banknote,
  DollarSign,
  CreditCard,
  File,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const progressStatuses = ["Pending", "In Progress", "Paid"];

const PaymentTable = ({
  payments,
  isAdmin,
}: {
  payments: IPayment[];
  isAdmin: boolean;
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "agency" | "amount" | "progress" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredPayments = useMemo(() => {
    const filtered = payments.filter((payment) =>
      [
        payment.agency,
        payment.amount.toString(),
        payment.paymentMethod,
        payment.accountDetails,
        payment.progress,
      ].some((value) =>
        (value ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valueA =
          sortKey === "amount" ? a.amount : a[sortKey]?.toLowerCase?.() || "";
        const valueB =
          sortKey === "amount" ? b.amount : b[sortKey]?.toLowerCase?.() || "";
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [payments, searchQuery, sortKey, sortOrder]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      const res = await deletePayment(id);
      if (res) toast.success("Payment deleted successfully.");
      router.refresh();
    } catch {
      toast.error("Failed to delete payment.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleToggleProgress = async (id: string, current: string) => {
    const currentIndex = progressStatuses.indexOf(current);
    const nextStatus =
      progressStatuses[(currentIndex + 1) % progressStatuses.length];
    try {
      await updatePayment(id, { progress: nextStatus });
      toast.success(`Progress updated to "${nextStatus}"`);
      router.refresh();
    } catch {
      toast.error("Failed to update progress.");
    }
  };

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search by any field"
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
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead className="text-white cursor-pointer">#</TableHead>
              <TableHead
                className="text-white cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("agency")}
              >
                <div className="flex items-center gap-1">
                  Agency{" "}
                  {sortKey === "agency" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Amount
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Payment Method
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Account Details
              </TableHead>
              <TableHead
                className="text-white cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("progress")}
              >
                <div className="flex items-center gap-1">
                  Progress{" "}
                  {sortKey === "progress" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              {isAdmin && (
                <TableHead className="text-white cursor-pointer">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPayments.map((payment, idx) => (
              <TableRow
                key={payment._id.toString()}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b-0"
              >
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </TableCell>
                <TableCell>{payment.agency}</TableCell>
                <TableCell>€{payment.amount}</TableCell>
                <TableCell>
                  {{
                    Bank: (
                      <span className="px-4 py-2 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border inline-flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        Bank
                      </span>
                    ),
                    Paypal: (
                      <span className="px-4 py-2 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border inline-flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Paypal
                      </span>
                    ),
                    Wise: (
                      <span className="px-4 py-2 text-xs font-medium rounded-full bg-green-100 text-green-700 border inline-flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Wise
                      </span>
                    ),
                  }[payment.paymentMethod] ?? (
                    <span className="px-4 py-2 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border inline-flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      {payment.paymentMethod || "Unknown"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <span className="px-4 py-2 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border inline-flex items-center gap-2">
                        <File className="w-4 h-4" /> Details
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-xs text-sm">
                      {payment.accountDetails || "No note available."}
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  {(() => {
                    const progressStyles: Record<string, string> = {
                      Pending:
                        "bg-yellow-100 text-yellow-600 border-yellow-300",
                      "In Progress":
                        "bg-blue-100 text-blue-600 border-blue-300",
                      Completed: "bg-green-100 text-green-600 border-green-300",
                    };

                    const status = payment.progress || "Pending";

                    return (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleProgress(
                            payment._id.toString(),
                            payment.progress
                          )
                        }
                        className={`px-4 py-2 text-xs font-medium rounded-full border text-center flex items-center justify-center gap-1 ${progressStyles[status]}`}
                        disabled={!isAdmin}
                      >
                        {isAdmin && <RefreshCcw className="ml-1 h-3 w-3" />}
                        {status}
                      </Button>
                    );
                  })()}
                </TableCell>
                {isAdmin && (
                  <>
                    <TableCell>
                      <div className="flex gap-2">
                        <a
                          href={`/finance/payment/${payment._id.toString()}/update`}
                        >
                          <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4 text-black" />
                          </Button>
                        </a>
                        <Button
                          onClick={() =>
                            setConfirmDeleteId(payment._id.toString())
                          }
                          variant="ghost"
                          size="icon"
                        >
                          <Trash className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredPayments.length)} of{" "}
          {filteredPayments.length} payments
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
              currentPage === Math.ceil(filteredPayments.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-80 space-y-4">
            <p className="text-center text-sm">
              Are you sure you want to delete this payment?
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
                onClick={() => handleDeletePayment(confirmDeleteId!)}
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

export default PaymentTable;
