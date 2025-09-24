"use client";

import { useState, useMemo } from "react";
import { deleteAdmin } from "@/lib/actions/admin.actions";
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
import { IAdmin } from "@/lib/database/models/admin.model";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const AdminTable = ({
  admins,
  currentAdminCountries,
}: {
  admins: Array<IAdmin>;
  currentAdminCountries: string[];
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "email" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isRestricted = currentAdminCountries.length > 0;

  const filteredAdmins = useMemo(() => {
    const filtered = admins.filter((admin) =>
      [admin.name, admin.email || ""].some((value) =>
        value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valueA = a[sortKey]?.toLowerCase?.() || "";
        const valueB = b[sortKey]?.toLowerCase?.() || "";
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [admins, searchQuery, sortKey, sortOrder]);

  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAdmins.slice(start, start + itemsPerPage);
  }, [filteredAdmins, currentPage, itemsPerPage]);

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const response = await deleteAdmin(adminId);
      if (response) {
        toast.success("Admin deleted successfully");
      }
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete admin");
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "name" | "email") => {
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
        placeholder="Search by name, or email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full md:w-1/2 lg:w-1/3 rounded-2xl"
      />
      <div
        className="overflow-x-auto rounded-2xl bg-blue-50 dark:bg-gray-800 scrollbar-hide"
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
              <TableHead>Permissions</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAdmins.map((admin, index) => (
              <TableRow
                key={admin._id}
                className="hover:bg-blue-100 dark:hover:bg-gray-800"
              >
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email || "No email provided"}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        {admin.rolePermissions?.length || 0} Permissions
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <ul className="list-disc pl-4 space-y-1 text-sm">
                        {admin.rolePermissions?.map(
                          (perm: string, i: number) => (
                            <li key={i}>{perm}</li>
                          )
                        )}
                      </ul>
                    </PopoverContent>
                  </Popover>
                </TableCell>

                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        {admin.countries?.length || 0} Country
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <ul className="list-disc pl-4 space-y-1 text-sm">
                        {admin.countries?.map((country: string, i: number) => (
                          <li key={i}>{country}</li>
                        ))}
                      </ul>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="flex items-center space-x-2">
                  {isRestricted ? (
                    <span className="text-muted-foreground italic text-xs">
                      Restricted
                    </span>
                  ) : (
                    <>
                      <a href={`/admins/${admin._id}/update`}>
                        <Button variant="outline" size="icon">
                          <Pencil className="w-4 h-4 text-purple-500" />
                        </Button>
                      </a>

                      <Button
                        onClick={() => setConfirmDeleteId(admin._id)}
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                      >
                        <Trash />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground">
          Showing {Math.min(itemsPerPage * currentPage, filteredAdmins.length)}{" "}
          of {filteredAdmins.length} admins
        </span>
        <div className="flex items-center space-x-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            size="sm"
            className="rounded-2xl"
          >
            Previous
          </Button>
          <Button
            disabled={
              currentPage === Math.ceil(filteredAdmins.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
            size="sm"
            className="rounded-2xl"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-black p-6 rounded-md space-y-4">
            <p>Are you sure you want to delete this admin?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteAdmin(confirmDeleteId)}
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

export default AdminTable;
