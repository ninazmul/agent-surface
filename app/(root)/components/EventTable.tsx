"use client";

import { useState, useMemo } from "react";
import { deleteEvent } from "@/lib/actions/event.actions";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import EventForm from "./EventForm";
import { IEvent } from "@/lib/database/models/event.model";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const EventTable = ({ events }: { events: Array<IEvent> }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "date" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    const filtered = events.filter((event) =>
      [event.title, event.description, event.email || ""].some((value) =>
        value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valueA =
          sortKey === "date"
            ? new Date(a.date).getTime()
            : a[sortKey]?.toLowerCase?.() || "";
        const valueB =
          sortKey === "date"
            ? new Date(b.date).getTime()
            : b[sortKey]?.toLowerCase?.() || "";
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [events, searchQuery, sortKey, sortOrder]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage, itemsPerPage]);

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await deleteEvent(eventId);
      if (response) {
        toast.success("Event deleted successfully");
      }
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete event");
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "title" | "date") => {
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
        placeholder="Search by title, description, or email"
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
              <TableHead className="text-white cursor-pointer">
                <div
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Date
                  {sortKey === "date" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>

              <TableHead className="text-white cursor-pointer">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.map((event, index) => (
              <TableRow
                key={event._id.toString()}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b-0"
              >
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>{event.title}</TableCell>
                <TableCell className="">{event.description}</TableCell>
                <TableCell>
                  {new Date(event.date).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </TableCell>
                <TableCell className="flex items-center space-x-2">
                  <Sheet>
                    <SheetTrigger>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4 text-black" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="bg-white">
                      <SheetHeader>
                        <SheetTitle>Update Event</SheetTitle>
                        <SheetDescription>
                          Edit event details to keep information current and
                          accurate.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-5">
                        <EventForm
                          Event={event}
                          EventId={event._id.toString()}
                          type="Update"
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                  <Button
                    onClick={() => setConfirmDeleteId(event._id.toString())}
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
          Showing {Math.min(itemsPerPage * currentPage, filteredEvents.length)}{" "}
          of {filteredEvents.length} events
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
              currentPage === Math.ceil(filteredEvents.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-black p-6 rounded-md space-y-4">
            <p>Are you sure you want to delete this event?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteEvent(confirmDeleteId)}
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

export default EventTable;
