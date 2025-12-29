"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/actions/event.actions";
import { IEvent } from "@/lib/database/models/event.model";
import toast from "react-hot-toast";

const EventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  date: z.string().min(1, "Date and time are required."),
});

type EventFormProps = {
  type: "Create" | "Update";
  Event?: IEvent;
  EventId?: string;
  email?: string;
};

const EventForm = ({ type, Event, EventId, email }: EventFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof EventFormSchema>>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      title: Event?.title || "",
      description: Event?.description || "",
      date: Event?.date
        ? new Date(Event.date).toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM
        : new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = async (values: z.infer<typeof EventFormSchema>) => {
    try {
      const eventData = {
        ...values,
        date: new Date(values.date), // Convert from ISO string to Date object
        email: email || "",
      };

      if (type === "Create") {
        const created = await createEvent(eventData);
        if (created) {
          form.reset();
          toast.success("Event created Successfully!");
          const navigate = () => {
            router.replace("/events");
            router.refresh();
          };

          if (created) {
            navigate();
          }
        }
      } else if (type === "Update" && EventId) {
        const updated = await updateEvent(EventId, eventData);
        if (updated) {
          toast.success("Event updated Successfully!");
          const navigate = () => {
            router.replace("/events");
            router.refresh();
          };

          if (updated) {
            navigate();
          }
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
        className="flex flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Event Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Event Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full col-span-2 rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : type === "Create"
            ? "Create"
            : "Update"}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;
