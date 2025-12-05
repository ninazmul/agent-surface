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
import { IServices } from "@/lib/database/models/service.model";
import { createService, updateService } from "@/lib/actions/service.actions";

// Zod schema
const ServiceFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  serviceType: z.enum([
    "Accommodation",
    "Airport Pick-up",
    "Learner Protection",
    "Medical Insurance",
    "Other Request",
  ]),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional(),
  amount: z.string().optional(),
});

type ServiceFormProps = {
  type: "Create" | "Update";
  Service?: IServices;
  ServiceId?: string;
};

const ServiceForm = ({ type, Service, ServiceId }: ServiceFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof ServiceFormSchema>>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      title: Service?.title || "",
      description: Service?.description || "",
      serviceType: Service?.serviceType || "Accommodation",
      startDate:
        Service?.startDate?.toString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
      endDate: Service?.endDate?.toString().split("T")[0] || "",
      amount: Service?.amount || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ServiceFormSchema>) => {
    try {
      const payload = {
        ...values,
        startDate: new Date(values.startDate),
        endDate: values.endDate ? new Date(values.endDate) : undefined,
        amount: values.amount || "",
      };

      if (type === "Create") {
        const created = await createService(payload);
        if (created) {
          form.reset();
          router.push("/services");
        }
      } else if (type === "Update" && ServiceId) {
        const updated = await updateService(ServiceId, payload);
        if (updated) {
          router.push("/services");
        }
      }
    } catch (error) {
      console.error("Service form submission failed", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm space-y-4"
      >
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Service Information</h2>
        </div>
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter service title" {...field} />
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
              <FormLabel>Service Description</FormLabel>
              <FormControl>
                <Input placeholder="Describe the service" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Service Type */}
        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Type</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border border-input bg-background dark:bg-gray-700 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="Accommodation">Accommodation</option>
                  <option value="Airport Pick-up">Airport Pick-up</option>
                  <option value="Learner Protection">Learner Protection</option>
                  <option value="Medical Insurance">Medical Insurance</option>
                  <option value="Other Request">Other Request</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormLabel>End Date (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter amount (USD)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full col-span-2 rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : type === "Create"
            ? "Create Service"
            : "Update Service"}
        </Button>
      </form>
    </Form>
  );
};

export default ServiceForm;
