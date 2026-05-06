"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash, SortAsc, SortDesc, Info } from "lucide-react";
import toast from "react-hot-toast";

import { deleteCourse } from "@/lib/actions/course.actions";
import type {
  ICountryFee,
  ICourseSafe,
} from "@/lib/database/models/course.model";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UpdateCourseDialog from "@/components/shared/UpdateCourseDialog";

type CourseTableProps = {
  courses: ICourseSafe[];
};

type ShiftDisplay = {
  seats: number;
  fees?: ICountryFee[];
};

const formatDate = (date?: string) => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString();
};

const CourseTable = ({ courses }: CourseTableProps) => {
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

    if (sortKey === "name") {
      filtered.sort((a, b) => {
        const valA = a.name.toLowerCase();
        const valB = b.name.toLowerCase();

        if (valA === valB) return 0;

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / itemsPerPage),
  );

  const paginatedCourses = useMemo(() => {
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const start = (safeCurrentPage - 1) * itemsPerPage;

    return filteredCourses.slice(start, start + itemsPerPage);
  }, [filteredCourses, currentPage, totalPages, itemsPerPage]);

  const handleDeleteCourse = async (id: string) => {
    try {
      const result = await deleteCourse(id);

      if (!result) {
        toast.error("Failed to delete course");
        return;
      }

      toast.success("Course deleted successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete course");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "name") => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortOrder("asc");
  };

  const renderShift = (label: string, shift?: ShiftDisplay) => {
    if (!shift || shift.seats <= 0) return null;

    return (
      <div className="space-y-1">
        <p className="font-medium">
          {label}: {shift.seats} seats
        </p>

        {shift.fees && shift.fees.length > 0 ? (
          <div className="pl-3 text-muted-foreground">
            {shift.fees.map((fee, index) => (
              <p key={`${fee.country}-${index}`}>
                {fee.country}: €{fee.fee}
              </p>
            ))}
          </div>
        ) : (
          <p className="pl-3 text-muted-foreground">No fees added</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-1">
        <Input
          placeholder="Search by course name"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-2xl sm:w-auto sm:min-w-[220px]"
        />
      </div>

      <div
        className="overflow-x-auto rounded-2xl bg-white dark:bg-gray-800"
        style={{ cursor: "grab" }}
        onMouseDown={(event) => {
          const el = event.currentTarget;
          el.style.cursor = "grabbing";

          const startX = event.pageX - el.offsetLeft;
          const scrollLeft = el.scrollLeft;

          const onMouseMove = (moveEvent: MouseEvent) => {
            const x = moveEvent.pageX - el.offsetLeft;
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
              <TableHead className="text-white">#</TableHead>

              <TableHead className="text-white">
                <button
                  type="button"
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 select-none"
                >
                  Name
                  {sortKey === "name" &&
                    (sortOrder === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    ))}
                </button>
              </TableHead>

              <TableHead className="text-white">Type</TableHead>
              <TableHead className="text-white">Duration</TableHead>
              <TableHead className="text-white">Start Date</TableHead>
              <TableHead className="text-white">End Date</TableHead>
              <TableHead className="text-white">Campuses</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedCourses.length > 0 ? (
              paginatedCourses.map((course, index) => (
                <TableRow
                  key={course._id}
                  className="border-b-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>

                  <TableCell>
                    <div className="w-40 truncate">{course.name}</div>
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

                  <TableCell>{formatDate(course.startDate)}</TableCell>
                  <TableCell>{formatDate(course.endDate)}</TableCell>

                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                        >
                          <Info className="h-4 w-4" />
                          View
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-80 text-sm">
                        <div className="space-y-3">
                          {course.campuses.length > 0 ? (
                            course.campuses.map((campus, index) => (
                              <div
                                key={`${campus.campus}-${index}`}
                                className="space-y-2 border-b pb-3 last:border-b-0 last:pb-0"
                              >
                                <p className="font-semibold">{campus.campus}</p>

                                {renderShift("Morning", campus.shifts?.morning)}
                                {renderShift(
                                  "Afternoon",
                                  campus.shifts?.afternoon,
                                )}
                                {renderShift("General", campus.shifts?.general)}

                                {!campus.shifts?.morning &&
                                  !campus.shifts?.afternoon &&
                                  !campus.shifts?.general && (
                                    <p className="text-muted-foreground">
                                      No shifts added
                                    </p>
                                  )}
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">
                              No campuses added
                            </p>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  <TableCell className="w-max space-x-2 whitespace-nowrap">
                    <UpdateCourseDialog course={course} courseId={course._id} />

                    <Button
                      type="button"
                      onClick={() => setConfirmDeleteId(course._id)}
                      variant="ghost"
                      size="icon"
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  No courses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Showing {Math.min(itemsPerPage * currentPage, filteredCourses.length)}{" "}
          of {filteredCourses.length} courses
        </span>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="rounded-2xl bg-black text-white hover:bg-gray-500 disabled:bg-muted-foreground dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-500"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <Button
            size="sm"
            className="rounded-2xl bg-black text-white hover:bg-gray-500 disabled:bg-muted-foreground dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-500"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm space-y-4 rounded-md bg-white p-6 text-black shadow-lg">
            <p className="text-center text-lg font-medium">
              Are you sure you want to delete this course?
            </p>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>

              <Button
                type="button"
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
