"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createPayment, updatePayment } from "@/lib/actions/payment.actions";
import { IPayment } from "@/lib/database/models/payment.model";
import { createNotification } from "@/lib/actions/notification.actions";
import { IProfile } from "@/lib/database/models/profile.model";
import { useForm } from "react-hook-form";

const PaymentFormSchema = z.object({
  agency: z.string().min(3, "Agency must be at least 3 characters."),
  amount: z.string().min(1, "Amount is required."),
  paymentMethod: z
    .string()
    .min(1, "Payment Method must be at least 1 characters."),
  accountDetails: z.string().optional(),
  country: z.string().min(2, "Country is required."),
  progress: z.enum(["Pending", "In Progress", "Paid"]).default("Pending"),
  author: z.string().optional(),
});

type PaymentFormProps = {
  type: "Create" | "Update";
  Payment?: IPayment;
  PaymentId?: string;
  agency?: IProfile;
  isAdmin?: boolean;
};

const PaymentForm = ({
  type,
  Payment,
  PaymentId,
  agency,
}: PaymentFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof PaymentFormSchema>>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      agency: Payment?.agency || "",
      amount: Payment?.amount || "",
      paymentMethod: Payment?.paymentMethod || "",
      accountDetails: Payment?.accountDetails || "",
      country: Payment?.country || "",
      progress:
        (Payment?.progress as "Pending" | "In Progress" | "Paid") || "Pending",
    },
  });

  const onSubmit = async (values: z.infer<typeof PaymentFormSchema>) => {
    try {
      const paymentData = {
        ...values,
        accountDetails: values.accountDetails ?? "",
        progress: "Pending",
        createdAt: new Date(),
      };

      if (type === "Create") {
        const created = await createPayment(paymentData);
        if (created) {
          await createNotification({
            title: `New payment request created for ${values.agency}`,
            agency: values.agency,
            country: values.country,
            route: `/commissions`,
          });
          form.reset();
          router.push("/commissions");
        }
      } else if (type === "Update" && PaymentId) {
        const updated = await updatePayment(PaymentId, {
          ...paymentData,
          progress: Payment?.progress || "Pending",
        });
        if (updated) {
          await createNotification({
            title: `${values.agency}'s payment request updated!`,
            agency: values.agency,
            country: values.country,
            route: `/commissions`,
          });
          router.push("/commissions");
        }
      }
    } catch (error) {
      console.error("Payment form submission failed", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-2xl bg-green-50 dark:bg-gray-900 p-6 shadow-sm"
      >
        {/* Agency Field (react-select) */}
         <FormField
          control={form.control}
          name="agency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agency</FormLabel>
              <FormControl>
                <Input disabled {...field} placeholder="Your Agency..." value={agency?.email} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country Field (auto-filled, disabled) */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input disabled {...field} placeholder="Country" value={agency?.country} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount Field */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter amount" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Method Field */}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border border-input bg-background dark:bg-gray-700 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select Method</option>
                  <option value="Bank">Bank</option>
                  <option value="Paypal">Paypal</option>
                  <option value="Wise">Wise</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Details Field */}
        <FormField
          control={form.control}
          name="accountDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Details</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. IBAN, Email, etc." />
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
          className="w-full"
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : type === "Create"
            ? "Create Payment"
            : "Update Payment"}
        </Button>
      </form>
    </Form>
  );
};

export default PaymentForm;
