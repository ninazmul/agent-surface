"use client";

import { useMemo, useState } from "react";
import { deleteCourse } from "@/lib/actions/course.actions";
import { ICourse } from "@/lib/database/models/course.model";
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
import { Trash, SortAsc, SortDesc, Info } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UpdateCourseDialog from "@/components/shared/UpdateCourseDialog";

const CourseTable = ({ courses }: { courses: ICourse[] }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredCourses = useMemo(() => {
    const filtered = courses.filter((course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        let valA: string | number = "";
        let valB: string | number = "";

        if (sortKey === "name") {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        }

        return sortOrder === "asc"
          ? valA < valB
            ? -1
            : 1
          : valA > valB
            ? -1
            : 1;
      });
    }

    return filtered;
  }, [courses, searchQuery, sortKey, sortOrder]);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(start, start + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteCourse(id);
      toast.success("Course deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete course");
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "name") => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-1">
        <Input
          placeholder="Search by course name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-auto sm:min-w-[220px] rounded-2xl"
        />
      </div>

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
              <TableHead className="text-white cursor-pointer">
                <div
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  Name
                  {sortKey === "name" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead className="text-white cursor-pointer">Type</TableHead>
              <TableHead className="text-white cursor-pointer">
                Duration
              </TableHead>
              {/* Removed global Course Fee */}
              <TableHead className="text-white cursor-pointer">
                Start Date
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                End Date
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Campuses
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedCourses.map((course, index) => (
              <TableRow
                key={course._id.toString()}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b-0"
              >
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>
                  <div className="w-40 line-clamp-1 truncate">
                    {course.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="whitespace-nowrap">
                    {course.courseType || "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="whitespace-nowrap">
                    {course.courseDuration || "-"}
                  </div>
                </TableCell>
                <TableCell>
                  {course.startDate
                    ? new Date(course.startDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {course.endDate
                    ? new Date(course.endDate).toLocaleDateString()
                    : "-"}
                </TableCell>

                {/* Campuses Popover */}
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <span className="flex gap-2 items-center px-4 py-2 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border text-center">
                        <Info className="w-4 h-4" />
                        View
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 text-sm">
                      <div className="space-y-2">
                        {course.campuses.map((campus, idx) => (
                          <div key={idx} className="border-b pb-2">
                            <p className="font-medium">{campus.campus}</p>
                            {campus.shifts?.morning?.seats &&
                              campus.shifts?.morning?.seats > 0 && (
                                <p>
                                  Morning: {campus.shifts?.morning?.seats ?? 0}{" "}
                                  seats — Fee: €
                                  {campus.shifts?.morning?.fee ?? "N/A"}
                                </p>
                              )}
                            {campus.shifts?.afternoon?.seats &&
                              campus.shifts?.afternoon?.seats > 0 && (
                                <p>
                                  Afternoon:{" "}
                                  {campus.shifts?.afternoon?.seats ?? 0} seats —
                                  Fee: €{campus.shifts?.afternoon?.fee ?? "N/A"}
                                </p>
                              )}
                            {campus.shifts?.general?.seats &&
                              campus.shifts?.general?.seats > 0 && (
                                <p>
                                  general: {campus.shifts?.general?.seats ?? 0}{" "}
                                  seats — Fee: €
                                  {campus.shifts?.general?.fee ?? "N/A"}
                                </p>
                              )}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>

                {/* Actions */}
                <TableCell className="w-max space-x-2 whitespace-nowrap">
                  <UpdateCourseDialog
                    course={course}
                    courseId={course._id.toString()}
                  />
                  <Button
                    onClick={() => setConfirmDeleteId(course._id.toString())}
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
          Showing {Math.min(itemsPerPage * currentPage, filteredCourses.length)}{" "}
          of {filteredCourses.length} courses
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
              currentPage === Math.ceil(filteredCourses.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white text-black p-6 rounded-md space-y-4 w-full max-w-sm shadow-lg">
            <p className="text-center text-lg font-medium">
              Are you sure you want to delete this course?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteCourse(confirmDeleteId)}
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

export default CourseTable;
