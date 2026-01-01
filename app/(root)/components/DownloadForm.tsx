"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import * as z from "zod";
import { useEffect } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { FileUploader } from "@/components/shared/FileUploader";
import { createDownload, updateDownload } from "@/lib/actions/download.actions";
import { IDownload } from "@/lib/database/models/download.model";
import { downloadDefaultValues } from "@/constants";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IProfile } from "@/lib/database/models/profile.model";
import { ILead } from "@/lib/database/models/lead.model";
import Select from "react-select";
import { createNotification } from "@/lib/actions/notification.actions";

export const downloadFormSchema = z.object({
  name: z.string().min(2, "First name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  date: z.date(),
  country: z.string().min(1, "Country is required."),
  documents: z
    .array(
      z.object({
        fileName: z.string().min(1, "Filename is required"),
        fileUrl: z.string().min(1, "File URL is required"),
      })
    )
    .optional(),
  author: z.string().min(1, "Author is required."),
});

type DownloadFormProps = {
  type: "Create" | "Update";
  download?: IDownload;
  downloadId?: string;
  agency?: IProfile[];
  leads?: ILead[];
};

const DownloadForm = ({
  type,
  download,
  downloadId,
  agency,
  leads,
}: DownloadFormProps) => {
  const router = useRouter();

  const initialValues =
    download && type === "Update"
      ? {
          ...download,
          date: new Date(download.date),
          documents: Array.isArray(download?.documents)
            ? download.documents.map((file) => ({
                fileName: file.fileName || "",
                fileUrl: file.fileUrl || "",
              }))
            : [],
        }
      : downloadDefaultValues;

  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<z.infer<typeof downloadFormSchema>>({
    resolver: zodResolver(downloadFormSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof downloadFormSchema>) {
    try {
      if (type === "Create") {
        const newDownload = await createDownload({
          ...values,
          documents: values.documents || [],
          createdAt: new Date(),
        });
        if (newDownload) {
          await createNotification({
            title: `New document added for ${values.name}`,
            agency: values.author,
            country: values.country,
            route: `/downloads`,
          });
          form.reset();
          toast.success("Docs uploaded successfully!");
          router.push("/downloads");
          window.location.reload();
        }
      } else if (type === "Update" && downloadId) {
        const updatedDownload = await updateDownload(downloadId, {
          ...values,
          documents: values.documents || [],
        });
        if (updatedDownload) {
          await createNotification({
            title: `${values.name}'s document updated!`,
            agency: values.author,
            country: values.country,
            route: `/downloads`,
          });
          form.reset();
          toast.success("Docs updated successfully!");
          router.push("/downloads");
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Docs Download failed", error);
    }
  }

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        const selectedStudent = leads?.find((r) => r.name === value.name);
        if (selectedStudent) {
          form.setValue("email", selectedStudent.email);
          form.setValue("country", selectedStudent.home.country);
          form.setValue("author", selectedStudent.author);
        }
      }
    });

    return () => subscription.unsubscribe?.();
  }, [form, leads]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4"
      >
        <h2 className="text-xl font-semibold">Document Information</h2>

        {/* Student Name (react-select) */}
        <FormItem>
          <FormLabel>Student</FormLabel>
          <FormControl>
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <Select
                  options={leads?.map((r) => ({
                    label: `${r.name} (${r.email})`,
                    value: r.name,
                  }))}
                  isSearchable
                  value={leads
                    ?.map((r) => ({
                      label: `${r.name} (${r.email})`,
                      value: r.name,
                    }))
                    .find((opt) => opt.value === field.value)}
                  onChange={(selected) => field.onChange(selected?.value || "")}
                  placeholder="Select a student"
                  classNamePrefix="react-select"
                />
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input disabled {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Agency (react-select) */}
        <FormItem>
          <FormLabel>Agency</FormLabel>
          <FormControl>
            <Controller
              control={form.control}
              name="author"
              render={({ field }) => (
                <Select
                  options={agency?.map((a) => ({
                    label: `${a.name} (${a.email})`,
                    value: a.email,
                  }))}
                  isSearchable
                  isDisabled
                  value={agency
                    ?.map((a) => ({
                      label: `${a.name}`,
                      value: a.email,
                    }))
                    .find((opt) => opt.value === field.value)}
                  onChange={(selected) => field.onChange(selected?.value || "")}
                  placeholder="Agency auto-filled"
                  classNamePrefix="react-select"
                />
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={
                    field.value
                      ? typeof field.value === "string"
                        ? field.value
                        : field.value instanceof Date
                        ? field.value.toISOString().slice(0, 10)
                        : ""
                      : ""
                  }
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ✅ SECTION 6: Documents (Documents) */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Documents</h3>
          {form.watch("documents")?.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-4 items-center border p-4 rounded-md bg-muted/40"
            >
              {/* File Name */}
              <FormField
                control={form.control}
                name={`documents.${index}.fileName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter file name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Uploader */}
              <FormField
                control={form.control}
                name={`documents.${index}.fileUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload File</FormLabel>
                    <FormControl>
                      <FileUploader
                        onFieldChange={async (
                          fileUrl: string,
                          files?: File[]
                        ) => {
                          // If a file is selected, upload it and set the URL
                          if (files && files.length > 0) {
                            const uploaded = await startUpload(files);
                            if (uploaded && uploaded[0]) {
                              field.onChange(uploaded[0].url);
                            }
                          } else {
                            // If just a URL is provided, set it directly
                            field.onChange(fileUrl);
                          }
                        }}
                        fileUrl={field.value || ""}
                        setFiles={() => {}} // No-op to satisfy the prop type
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remove Button */}
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  const current = form.getValues("documents") || [];
                  const updated = [
                    ...current.slice(0, index),
                    ...current.slice(index + 1),
                  ];
                  form.setValue("documents", updated);
                }}
              >
                Remove
              </Button>
            </div>
          ))}

          {/* Add New Document Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const current = form.getValues("documents") || [];
              form.setValue("documents", [
                ...current,
                { fileName: "", fileUrl: "" },
              ]);
            }}
          >
            Add Document
          </Button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full col-span-2 rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
        >
          {form.formState.isSubmitting ? "Uploading..." : "Submit Form"}
        </Button>
      </form>
    </Form>
  );
};

export default DownloadForm;
