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
import { Trash, SortAsc, SortDesc, Pencil, Info } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CourseTable = ({ courses }: { courses: ICourse[] }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "createdAt" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredCourses = useMemo(() => {
    const filtered = courses.filter((course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        let valA: string | number = "";
        let valB: string | number = "";

        if (sortKey === "name") {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortKey === "createdAt") {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
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

  const handleSort = (key: "name" | "createdAt") => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by course name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full md:w-1/2 lg:w-1/3 rounded-2xl"
      />

      <div
        className="overflow-x-auto rounded-2xl bg-orange-50 dark:bg-gray-800 scrollbar-hide"
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
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  Name
                  {sortKey === "name" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Course Fee</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Campuses</TableHead>
              <TableHead>
                <div
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  Created At
                  {sortKey === "createdAt" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedCourses.map((course, index) => (
              <TableRow
                key={course._id}
                className="hover:bg-orange-100 dark:bg-gray-800"
              >
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>{course.name}</TableCell>
                <TableCell>
                  {course.courseType === "Full Time"
                    ? "Full Time"
                    : course.courseType === "Part Time"
                    ? "Part Time"
                    : "-"}
                </TableCell>
                <TableCell>{course.courseDuration || "-"}</TableCell>
                <TableCell>{course.courseFee || 0}</TableCell>
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

                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex gap-2 items-center"
                      >
                        <Info className="w-4 h-4" />
                        View
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 text-sm">
                      <div className="space-y-2">
                        {course.campuses.map((campus, idx) => (
                          <div key={idx} className="border-b pb-2">
                            <p className="font-medium">{campus.campus}</p>
                            <p>Morning: {campus.shifts.morning}</p>
                            <p>Afternoon: {campus.shifts.afternoon}</p>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>

                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell>

                <TableCell className="space-x-2">
                  {/* Edit */}
                  <a href={`/courses/${course._id}/update`}>
                    <Button variant="outline" size="icon">
                      <Pencil className="w-4 h-4 text-purple-500" />
                    </Button>
                  </a>

                  {/* Delete */}
                  <Button
                    onClick={() => setConfirmDeleteId(course._id)}
                    variant="outline"
                    size="icon"
                    className="text-red-500"
                  >
                    <Trash className="h-4 w-4" />
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
              currentPage === Math.ceil(filteredCourses.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
            size="sm"
            className="rounded-2xl"
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
