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
import { Trash, SortAsc, SortDesc, Clock, Check, Pencil } from "lucide-react";
import { deleteProfile, updateProfile } from "@/lib/actions/profile.actions";
import { IProfile } from "@/lib/database/models/profile.model";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ProfileTable = ({ profiles }: { profiles: Array<IProfile> }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "name" | "email" | "number" | "country" | "role" | "status" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<
    Record<string, { salesTarget: string }>
  >({});

  const filteredProfiles = useMemo(() => {
    const filtered = profiles.filter((profile) => {
      const query = searchQuery.toLowerCase();
      return (
        (profile.name?.toLowerCase().includes(query) ?? false) ||
        (profile.email?.toLowerCase().includes(query) ?? false) ||
        (profile.number?.toLowerCase().includes(query) ?? false) ||
        (profile.country?.toLowerCase().includes(query) ?? false) ||
        (profile.role?.toLowerCase().includes(query) ?? false) ||
        (profile.status?.toLowerCase().includes(query) ?? false)
      );
    });

    if (sortKey) {
      filtered.sort((a, b) => {
        let valueA: string | number, valueB: string | number;

        switch (sortKey) {
          case "name":
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
          case "email":
            valueA = a.email.toLowerCase();
            valueB = b.email.toLowerCase();
            break;
          case "number":
            valueA = a.number.toLowerCase();
            valueB = b.number.toLowerCase();
            break;
          case "country":
            valueA = a.country.toLowerCase();
            valueB = b.country.toLowerCase();
            break;
          case "role":
            valueA = a.role.toLowerCase();
            valueB = b.role.toLowerCase();
            break;
          case "status":
            valueA = a.status.toLowerCase();
            valueB = b.status.toLowerCase();
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
  }, [profiles, searchQuery, sortKey, sortOrder]);

  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProfiles.slice(start, start + itemsPerPage);
  }, [filteredProfiles, currentPage, itemsPerPage]);

  const handleDeleteProfile = async (profileId: string) => {
    try {
      const response = await deleteProfile(profileId);
      if (response) {
        toast.success("Profile deleted successfully");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to delete profile");
      console.error("Error deleting profile:", error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSalesTarget = async (profileId: string) => {
    const value = editedData[profileId]?.salesTarget ?? "";
    const original =
      profiles.find((r) => r._id.toString() === profileId)?.salesTarget ?? "";
    if (value && value !== original) {
      try {
        await updateProfile(profileId, { salesTarget: value });
        toast.success(`Sales Target updated to €${value}`);
        router.refresh();
      } catch {
        toast.error("Failed to update Sales Target");
      }
    }
  };

  const handleToggleStatus = async (
    profileId: string,
    currentStatus: string
  ) => {
    try {
      const newStatus = currentStatus === "Pending" ? "Approved" : "Pending";
      const response = await updateProfile(profileId, {
        status: newStatus,
      });
      if (response) {
        toast.success(`Status updated to ${newStatus}`);
        router.refresh();

        if (newStatus === "Approved") {
          await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: response.email,
              name: response.name,
              role: response.role,
            }),
          });
        }
      }
    } catch (error) {
      toast.error("Failed to update status");
      console.log(error);
    }
  };

  const handleSort = (
    key: "name" | "email" | "number" | "country" | "role" | "status"
  ) => {
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
        placeholder="Search by name, email, number, or country"
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
        <Table className="table-fixed">
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead className="text-white cursor-pointer">#</TableHead>
              <TableHead className="text-white cursor-pointer">
                <div
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Name
                  {sortKey === "name" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                <div
                  onClick={() => handleSort("email")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Email
                  {sortKey === "email" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                <div
                  onClick={() => handleSort("number")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Number
                  {sortKey === "number" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                <div
                  onClick={() => handleSort("country")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Country
                  {sortKey === "country" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                <div
                  onClick={() => handleSort("role")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Role
                  {sortKey === "role" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                <div
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Status
                  {sortKey === "status" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead className="text-white cursor-pointer">S/T</TableHead>
              <TableHead className="text-white cursor-pointer">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProfiles.map((profile, index) => (
              <TableRow
                key={profile._id.toString()}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b-0"
              >
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>
                  <a
                    href={`/profile/${profile._id.toString()}`}
                    className="line-clamp-1 truncate w-40 md:w-auto hover:underline"
                  >
                    {profile.name}
                  </a>
                </TableCell>
                <TableCell>
                  <a
                    href={`mailto:${profile.email}`}
                    className=""
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profile.email}
                  </a>
                </TableCell>
                <TableCell>{profile.number}</TableCell>
                <TableCell>{profile.country}</TableCell>
                <TableCell>{profile.role}</TableCell>
                <TableCell>
                  <Button
                    onClick={() =>
                      handleToggleStatus(profile._id.toString(), profile.status)
                    }
                    className={`flex items-center gap-1 px-4 py-2 text-xs font-medium rounded-full w-full border text-center 
                    ${
                      profile.status === "Pending"
                        ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-300 border-yellow-300"
                        : "text-green-700 bg-green-100 hover:bg-green-300 border-green-300"
                    }`}
                  >
                    {profile.status === "Pending" ? <Clock /> : <Check />}
                    <span>{profile.status}</span>
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="relative w-24">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      €
                    </span>
                    <Input
                      type="number"
                      className="w-full pl-6 rounded-full text-center"
                      value={
                        editedData[profile._id.toString()]?.salesTarget ??
                        profile.salesTarget ??
                        ""
                      }
                      onChange={(e) =>
                        setEditedData((prev) => ({
                          ...prev,
                          [profile._id.toString()]: {
                            salesTarget: e.target.value,
                          },
                        }))
                      }
                      onBlur={() => handleSalesTarget(profile._id.toString())}
                      placeholder="100"
                    />
                  </div>
                </TableCell>

                <TableCell className="flex items-center space-x-2">
                  <a href={`/profile/${profile._id.toString()}/update`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-4 h-4 text-black" />
                    </Button>
                  </a>

                  <Button
                    onClick={() => setConfirmDeleteId(profile._id.toString())}
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

      <div className="flex justify-between items-center mt-4 w-full">
        <span className="text-sm text-muted-foreground line-clamp-1 truncate">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredProfiles.length)} of{" "}
          {filteredProfiles.length} profiles
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
              currentPage === Math.ceil(filteredProfiles.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-black p-6 rounded-md space-y-4">
            <p>Are you sure you want to delete this profile?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant={"outline"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteProfile(confirmDeleteId)}
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

export default ProfileTable;
