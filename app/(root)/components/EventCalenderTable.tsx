"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
} from "date-fns";
import { getAllEventCalendars } from "@/lib/actions/eventCalender.actions";
import { IEventCalendar } from "@/lib/database/models/eventCalender.model";
import { Button } from "@/components/ui/button";

type CalendarEvent = {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    description: string;
    type?: string;
    offerExpiryDate?: Date | string;
    email?: string;
  };
};

const typeColors: Record<string, { bg: string; border: string }> = {
  application_deadline: { bg: "#f87171", border: "#b91c1c" },
  enrollment_period: { bg: "#60a5fa", border: "#2563eb" },
  course_start: { bg: "#34d399", border: "#059669" },
  offer_promotion: { bg: "#fbbf24", border: "#b45309" },
  webinar_event: { bg: "#a78bfa", border: "#6b21a8" },
  holiday_closure: { bg: "#fcd34d", border: "#92400e" },
  default: { bg: "#9ca3af", border: "#6b7280" },
};

type DateFilterType = "week" | "month" | "year" | "custom";

const EventCalendar = ({ isAdmin }: { isAdmin: boolean }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>("all");
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("month");
  const [customRange, setCustomRange] = useState<{
    start?: string;
    end?: string;
  }>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const result: IEventCalendar[] = await getAllEventCalendars();

        const formatted = result.map((event) => {
          const colors =
            (event.eventType && typeColors[event.eventType]) ||
            typeColors.default;

          return {
            id: event._id.toString(),
            title: event.title,
            start: event.startDate || new Date(),
            end: event.endDate || event.startDate || new Date(),
            backgroundColor: colors.bg,
            borderColor: colors.border,
            extendedProps: {
              description: event.description,
              type: event.eventType,
              offerExpiryDate: event.offerExpiryDate,
              email: event.email,
            },
          };
        });

        setEvents(formatted);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, []);

  const getFilterRange = (): { start: Date; end: Date } | null => {
    if (!selectedDate) return null;
    switch (dateFilterType) {
      case "week":
        return {
          start: startOfWeek(selectedDate),
          end: endOfWeek(selectedDate),
        };
      case "month":
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate),
        };
      case "year":
        return {
          start: startOfYear(selectedDate),
          end: endOfYear(selectedDate),
        };
      case "custom":
        if (customRange.start && customRange.end) {
          return {
            start: new Date(customRange.start),
            end: new Date(customRange.end),
          };
        }
        return null;
      default:
        return null;
    }
  };

  const filterRange = getFilterRange();

  const filteredEvents = events.filter((event) => {
    const typeMatch =
      activeTypeFilter === "all"
        ? true
        : event.extendedProps.type === activeTypeFilter;

    if (!typeMatch) return false;

    if (!filterRange) return true;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end || event.start);

    return (
      isWithinInterval(eventStart, filterRange) ||
      isWithinInterval(eventEnd, filterRange) ||
      (eventStart < filterRange.start && eventEnd > filterRange.end)
    );
  });

  const eventsOnSelectedDate = filteredEvents.filter((evt) => {
    const selected = selectedDate.toDateString();
    const start = new Date(evt.start).toDateString();
    const end = new Date(evt.end || evt.start).toDateString();

    return (
      selected === start ||
      selected === end ||
      (new Date(evt.start) <= selectedDate &&
        new Date(evt.end || evt.start) >= selectedDate)
    );
  });

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        {/* Date Filter Dropdown */}
        <div>
          <select
            value={dateFilterType}
            onChange={(e) =>
              setDateFilterType(e.target.value as DateFilterType)
            }
            className="border-none text-black dark:text-gray-100"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Custom Date Picker */}
        {dateFilterType === "custom" && (
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-cyan-700 dark:text-gray-100">
                From
              </label>
              <input
                type="date"
                value={customRange.start || ""}
                onChange={(e) =>
                  setCustomRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-cyan-700 dark:text-gray-100">
                To
              </label>
              <input
                type="date"
                value={customRange.end || ""}
                onChange={(e) =>
                  setCustomRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar */}
        <div className="w-full md:w-2/3 bg-gray-100 dark:bg-gray-500 border rounded">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            required={true}
            modifiers={{
              highlighted: filteredEvents.flatMap((evt) => {
                const start = new Date(evt.start);
                const end = new Date(evt.end || evt.start);
                const dates = [];
                for (
                  let d = new Date(start);
                  d <= end;
                  d.setDate(d.getDate() + 1)
                ) {
                  dates.push(new Date(d));
                }
                return dates;
              }),
            }}
            modifiersClassNames={{
              highlighted:
                "bg-blue-100 border-2 border-blue-500 dark:bg-gray-600",
            }}
            className="w-full"
          />
        </div>

        <div className="w-full md:w-1/3">
          {isAdmin && (
            <a href={`/events/create`} className="w-full">
              <Button
                size="lg"
                className="rounded-2xl w-full bg-black text-gray-100"
              >
                Create Event
              </Button>
            </a>
          )}

          <h3 className="text-xl font-semibold mb-2 text-cyan-700 dark:text-gray-100 mt-6">
            {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
          </h3>

          {eventsOnSelectedDate.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">
              No events for this date.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-500 dark:text-gray-300">
                Running Events:
              </p>

              {/* Events Grid */}
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventsOnSelectedDate.map((evt) => (
                  <li
                    key={evt.id}
                    className="p-4 rounded-2xl cursor-pointer border h-full flex flex-col justify-between transition hover:shadow-lg"
                    style={{
                      backgroundColor: evt.backgroundColor,
                      borderColor: evt.borderColor,
                      borderWidth: "2px",
                    }}
                    onClick={() => setSelectedEvent(evt)}
                  >
                    <h4 className="text-lg font-bold dark:text-black">
                      {evt.title}
                    </h4>
                    <p className="text-sm capitalize dark:text-black">
                      {evt.extendedProps.type?.replace(/_/g, " ") || "N/A"}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Event Type Filters */}
              <div className="space-y-4">
                <p className="text-gray-500 dark:text-gray-300">Event Types:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "all",
                    ...Object.keys(typeColors).filter((t) => t !== "default"),
                  ].map((type) => {
                    const isActive = activeTypeFilter === type;

                    // "All" button full width on large screens
                    const widthClass =
                      type === "all"
                        ? "w-full md:w-full md:col-span-2"
                        : "w-auto";

                    return (
                      <div
                        key={type}
                        onClick={() => setActiveTypeFilter(type)}
                        className={`${widthClass} uppercase text-center p-4 rounded-2xl cursor-pointer border h-full transition hover:shadow-lg
                  ${
                    isActive
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                  }
                  hover:bg-purple-400 dark:hover:bg-purple-500`}
                      >
                        {type.replace(/_/g, " ")}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setSelectedEvent(null)}
          role="dialog"
        >
          <div
            className="bg-cyan-50 text-black p-6 rounded-2xl shadow-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-2">{selectedEvent.title}</h3>
            <p className="mb-2">
              <strong>Type:</strong>{" "}
              {selectedEvent.extendedProps.type?.replace(/_/g, " ") || "N/A"}
            </p>
            <p className="mb-2">{selectedEvent.extendedProps.description}</p>
            <p className="mb-2">
              <strong>Start:</strong>{" "}
              {new Date(selectedEvent.start).toLocaleDateString()}
            </p>
            <p className="mb-2">
              <strong>End:</strong>{" "}
              {selectedEvent.end
                ? new Date(selectedEvent.end).toLocaleDateString()
                : "-"}
            </p>
            {selectedEvent.extendedProps.offerExpiryDate && (
              <p className="mb-2 text-yellow-700 font-semibold">
                Offer Expires:{" "}
                {new Date(
                  selectedEvent.extendedProps.offerExpiryDate
                ).toLocaleDateString()}
              </p>
            )}
            {selectedEvent.extendedProps.email && (
              <p className="mb-2">
                <strong>Contact Email:</strong>{" "}
                {selectedEvent.extendedProps.email}
              </p>
            )}
            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
