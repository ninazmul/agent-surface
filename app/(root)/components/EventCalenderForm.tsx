"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IEventCalendar } from "@/lib/database/models/eventCalender.model";
import {
  createEventCalendar,
  updateEventCalendar,
} from "@/lib/actions/eventCalender.actions";

// Zod schema
const EventCalendarFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  eventType: z.enum([
    "application_deadline",
    "enrollment_period",
    "course_start",
    "offer_promotion",
    "webinar_event",
    "holiday_closure",
  ]),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional(),
  offerExpiryDate: z.string().optional(),
});

type EventCalendarFormProps = {
  type: "Create" | "Update";
  Event?: IEventCalendar;
  EventId?: string;
};

const EventCalendarForm = ({
  type,
  Event,
  EventId,
}: EventCalendarFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof EventCalendarFormSchema>>({
    resolver: zodResolver(EventCalendarFormSchema),
    defaultValues: {
      title: Event?.title || "",
      description: Event?.description || "",
      eventType: Event?.eventType || "application_deadline",
      startDate:
        Event?.startDate?.toString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
      endDate: Event?.endDate?.toString().split("T")[0] || "",
      offerExpiryDate: Event?.offerExpiryDate?.toString().split("T")[0] || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof EventCalendarFormSchema>) => {
    try {
      const payload = {
        ...values,
        startDate: new Date(values.startDate),
        endDate: values.endDate ? new Date(values.endDate) : undefined,
        offerExpiryDate: values.offerExpiryDate
          ? new Date(values.offerExpiryDate)
          : undefined,
      };

      if (type === "Create") {
        const created = await createEventCalendar(payload);
        if (created) {
          form.reset();
          router.push("/events");
        }
      } else if (type === "Update" && EventId) {
        const updated = await updateEventCalendar(EventId, payload);
        if (updated) {
          router.push("/events");
        }
      }
    } catch (error) {
      console.error("Event form submission failed", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm"
      >
        {/* ===== Event Info ===== */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Event Information
          </h2>
        </div>

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter event description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Event Type */}
        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="application_deadline">
                    Application Deadline
                  </option>
                  <option value="enrollment_period">Enrollment Period</option>
                  <option value="course_start">Course Start Date</option>
                  <option value="offer_promotion">Offer / Promotion</option>
                  <option value="webinar_event">Webinar / Event</option>
                  <option value="holiday_closure">
                    Holiday / College Closure
                  </option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ===== Event Dates ===== */}
        <div className="space-y-2 pt-4">
          <h2 className="text-xl font-semibold text-gray-800">Event Dates</h2>
          <p className="text-sm text-gray-500">
            Choose when the event will begin and end.
          </p>
        </div>

        {/* Start Date */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                End Date <span className="text-gray-400">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Offer Expiry Date */}
        <FormField
          control={form.control}
          name="offerExpiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Offer Expiry Date{" "}
                <span className="text-gray-400">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full col-span-2 rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
          >
            {form.formState.isSubmitting
              ? "Submitting..."
              : type === "Create"
              ? "Create Event"
              : "Update Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventCalendarForm;
