"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/shared/FileUploader";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const settingSchema = z.object({
  logo: z.string().min(1, "Logo is required"),
  favicon: z.string().min(1, "Favicon is required"),
  name: z.string().min(1, "Name is required"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
  twitter: z.string().url().optional(),
  facebookGroup: z.string().url().optional(),
  youtube: z.string().url().optional(),
  aboutUs: z.string().optional(),
  returnPolicy: z.string().optional(),
  termsOfService: z.string().optional(),
  privacyPolicy: z.string().optional(),
  contractAgreement: z.string().optional(),
});

export type SettingFormValues = z.infer<typeof settingSchema>;

type Props = {
  initialData?: Partial<SettingFormValues>;
  onSubmit: (data: SettingFormValues) => Promise<void>;
};

export default function SettingForm({ initialData, onSubmit }: Props) {
  const router = useRouter();

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: initialData || {},
  });

  const saveField = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    try {
      await onSubmit(form.getValues());
      toast.success("Settings saved!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings.");
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-md">
        <Accordion
          type="multiple"
          defaultValue={["branding", "basic"]}
          className="space-y-4"
        >
          {/* ================= BRANDING ================= */}
          <AccordionItem
            value="branding"
            className="bg-white dark:bg-gray-800 shadow rounded-lg"
          >
            <AccordionTrigger className="text-lg font-semibold text-gray-800 dark:text-gray-100 px-4 py-2 rounded-t-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              Branding
            </AccordionTrigger>
            <AccordionContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Logo *</FormLabel>
                    <FormControl>
                      <FileUploader
                        fileUrl={field.value || ""}
                        onFieldChange={(url) => {
                          form.setValue("logo", url, { shouldValidate: true });
                          saveField();
                        }}
                        setFiles={() => {}}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="favicon"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Favicon *</FormLabel>
                    <FormControl>
                      <FileUploader
                        fileUrl={field.value || ""}
                        onFieldChange={(url) => {
                          form.setValue("favicon", url, {
                            shouldValidate: true,
                          });
                          saveField();
                        }}
                        setFiles={() => {}}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* ================= BASIC INFO ================= */}
          <AccordionItem
            value="basic"
            className="bg-white dark:bg-gray-800 shadow rounded-lg"
          >
            <AccordionTrigger className="text-lg font-semibold text-gray-800 dark:text-gray-100 px-4 py-2 rounded-t-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              Basic Information
            </AccordionTrigger>
            <AccordionContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Site Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Site name"
                          {...field}
                          onBlur={saveField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tagline"
                          {...field}
                          onBlur={saveField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={(val) => {
                          field.onChange(val);
                          saveField();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email"
                          {...field}
                          onBlur={saveField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Phone number"
                          {...field}
                          onBlur={saveField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} onBlur={saveField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* ================= POLICIES ================= */}
          <AccordionItem
            value="policies"
            className="bg-white dark:bg-gray-800 shadow rounded-lg"
          >
            <AccordionTrigger className="text-lg font-semibold text-gray-800 dark:text-gray-100 px-4 py-2 rounded-t-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              Policies & Information
            </AccordionTrigger>
            <AccordionContent className="p-4 space-y-4">
              {[
                "aboutUs",
                "returnPolicy",
                "termsOfService",
                "privacyPolicy",
                "contractAgreement",
              ].map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName as keyof SettingFormValues}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>
                        {fieldName
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={(val) => {
                            field.onChange(val);
                            saveField();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  );
}
