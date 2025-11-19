"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
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
import { createAdmin, updateAdmin } from "@/lib/actions/admin.actions";
import { IAdmin } from "@/lib/database/models/admin.model";
import countries from "world-countries";
import { MultiValue } from "react-select";
import toast from "react-hot-toast";

type OptionType = {
  value: string;
  label: string;
};

const rolePermissionOptions = [
  { value: "dashboard", label: "Dashboard" },
  { value: "users", label: "Users" },
  { value: "quotations", label: "Quotations" },
  { value: "events", label: "Events" },
  { value: "leads", label: "Leads" },
  { value: "courses", label: "Courses" },
  { value: "resources", label: "Resources" },
  { value: "promotions", label: "Promotions" },
  { value: "finance", label: "Finance" },
  { value: "invoices", label: "Invoices" },
  { value: "downloads", label: "Downloads" },
  { value: "messages", label: "Messages" },
  { value: "notifications", label: "Notifications" },
  { value: "services", label: "Services" },
  { value: "profile", label: "Profile" },
  { value: "admins", label: "Admins" },
];

const countryOptions = countries
  .map((country) => ({
    value: country.name.common,
    label: `${country.flag} ${country.name.common}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label)); // Optional: alphabetically sort

const AdminFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Invalid email format"),
  rolePermissions: z
    .array(z.string())
    .min(1, "Select at least one permission."),
  countries: z.array(z.string()).optional(),
});

type AdminFormProps = {
  type: "Create" | "Update";
  Admin?: IAdmin;
  AdminId?: string;
};

const AdminForm = ({ type, Admin, AdminId }: AdminFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof AdminFormSchema>>({
    resolver: zodResolver(AdminFormSchema),
    defaultValues: {
      name: Admin?.name || "",
      email: Admin?.email || "",
      rolePermissions: Admin?.rolePermissions || [],
      countries: Admin?.countries || [],
    },
  });

  const onSubmit = async (values: z.infer<typeof AdminFormSchema>) => {
    try {
      const adminData = {
        name: values.name,
        email: values.email,
        rolePermissions: values.rolePermissions,
        countries: values.countries || [],
      };

      if (type === "Create") {
        const created = await createAdmin(adminData);
        if (created) {
          form.reset();
          toast.success("Admin Created Successfully!");
          router.push("/admins");
        }
      } else if (type === "Update" && AdminId) {
        const updated = await updateAdmin(AdminId, adminData);
        if (updated) {
          toast.success("Admin's profile Updated Successfully!");
          router.push("/admins");
        }
      }
    } catch (error) {
      console.error("Admin form submission failed", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-2xl bg-blue-100 dark:bg-gray-800 p-6 shadow-sm"
      >
        {/* ===== Admin Info ===== */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-gray-100">
            Admin Information
          </h2>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter admin email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ===== Access Control ===== */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100">
            Access Permissions
          </h2>

          {/* Role Permissions */}
          <FormField
            control={form.control}
            name="rolePermissions"
            render={() => (
              <FormItem>
                <FormLabel>Role Permissions</FormLabel>
                <FormControl>
                  <Controller
                    control={form.control}
                    name="rolePermissions"
                    render={({ field }) => {
                      const selectAllOption: OptionType = {
                        value: "*",
                        label: "Select All",
                      };

                      const handleChange = (
                        selectedOptions: MultiValue<OptionType>
                      ) => {
                        if (!selectedOptions) return field.onChange([]);

                        const values = selectedOptions.map((opt) => opt.value);

                        const allValues = rolePermissionOptions.map(
                          (opt) => opt.value
                        );

                        if (values.includes("*")) {
                          field.onChange(allValues);
                        } else {
                          field.onChange(values);
                        }
                      };

                      const currentValues = field.value || [];
                      const isAllSelected = rolePermissionOptions.every((opt) =>
                        currentValues.includes(opt.value)
                      );

                      const value: OptionType[] = isAllSelected
                        ? [selectAllOption, ...rolePermissionOptions].filter(
                            (opt) => currentValues.includes(opt.value)
                          )
                        : rolePermissionOptions.filter((opt) =>
                            currentValues.includes(opt.value)
                          );

                      return (
                        <Select
                          isMulti
                          options={[selectAllOption, ...rolePermissionOptions]}
                          value={value}
                          onChange={handleChange}
                          placeholder="Select permissions..."
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Countries */}
          <FormField
            control={form.control}
            name="countries"
            render={() => (
              <FormItem>
                <FormLabel>Allowed Countries</FormLabel>
                <FormControl>
                  <Controller
                    control={form.control}
                    name="countries"
                    render={({ field }) => (
                      <Select
                        isMulti
                        options={countryOptions}
                        value={countryOptions.filter((opt) =>
                          field.value?.includes(opt.value)
                        )}
                        onChange={(selected) =>
                          field.onChange(selected.map((opt) => opt.value))
                        }
                        placeholder="Select countries..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ===== Submit Button ===== */}
        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-2xl"
          >
            {form.formState.isSubmitting
              ? "Submitting..."
              : type === "Create"
              ? "Create Admin"
              : "Update Admin"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdminForm;
