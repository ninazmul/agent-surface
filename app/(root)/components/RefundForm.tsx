"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { useRouter } from "next/navigation";
import { createRefund, updateRefund } from "@/lib/actions/refund.actions";
import { IRefund } from "@/lib/database/models/refund.model";
import { ILead } from "@/lib/database/models/lead.model";
import { useEffect } from "react";
import { createNotification } from "@/lib/actions/notification.actions";
import Select from "react-select";

const RefundFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Invalid email."),
  number: z.string().min(10, "Number must be at least 10 digits."),
  country: z.string().min(2, "Country must be at least 2 characters."),
  leadNumber: z.string().min(5, "leadNumber must be at least 5 characters."),
  note: z.string().optional(),
  author: z.string().min(1, "Author is required."),
  amount: z.string().min(1, "Amount is required."),
});

type RefundFormProps = {
  type: "Create" | "Update";
  Refund?: IRefund;
  RefundId?: string;
  leads?: Array<ILead>;
};

const RefundForm = ({ type, Refund, RefundId, leads }: RefundFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof RefundFormSchema>>({
    resolver: zodResolver(RefundFormSchema),
    defaultValues: {
      name: Refund?.name || "",
      email: Refund?.email || "",
      number: Refund?.number || "",
      country: Refund?.country || "",
      leadNumber: Refund?.leadNumber || "",
      note: Refund?.note ?? "",
      author: Refund?.author || "",
      amount: Refund?.amount || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RefundFormSchema>) => {
    try {
      const refundData = {
        ...values,
        note: values.note ?? "",
        progress: "Pending",
      };

      if (type === "Create") {
        const created = await createRefund(refundData);
        if (created) {
          await createNotification({
            title: `New refund request created for ${values.name}`,
            agency: values.author || "",
            country: values.country,
            route: `/applications`,
          });
          form.reset();
          router.push("/applications/refund");
        }
      } else if (type === "Update" && RefundId) {
        const updated = await updateRefund(RefundId, refundData);
        if (updated) {
          await createNotification({
            title: `${values.name}'s refund request updated!`,
            agency: values.author || "",
            country: values.country,
            route: `/applications`,
          });
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Refund form submission failed", error);
    }
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        const selectedStudent = leads?.find((r) => r.name === value.name);
        if (selectedStudent) {
          form.setValue("email", selectedStudent.email);
          form.setValue("number", selectedStudent.number);
          form.setValue("country", selectedStudent.home.country);
          // form.setValue("leadNumber", selectedStudent.leadNumber);
          // form.setValue("amount", selectedStudent.amount || "");
          form.setValue("author", selectedStudent.author);
        }
      }
    });

    return () => subscription.unsubscribe?.();
  }, [form, leads]);

  // Build options for react-select
  const studentOptions =
    leads?.map((r) => ({
      value: r.name,
      label: r.name,
    })) || [];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-2xl bg-green-50 dark:bg-gray-900 p-6 shadow-sm"
      >
        {/* Name Select with react-select */}
        <FormItem className="w-full">
          <FormLabel>Select Student</FormLabel>
          <FormControl>
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <Select
                  {...field}
                  options={studentOptions}
                  placeholder="Select a student"
                  classNamePrefix="react-select"
                  value={studentOptions.find(
                    (opt) => opt.value === field.value
                  )}
                  onChange={(option) => field.onChange(option?.value)}
                  isClearable
                />
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* ReadOnly Autofilled Inputs */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="leadNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>lead Number</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agency</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Optional Note Field */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Input placeholder="Additional Notes" {...field} />
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
          className="button col-span-2 w-full"
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : type === "Create"
            ? "Request Refund"
            : "Update Request"}
        </Button>
      </form>
    </Form>
  );
};

export default RefundForm;
