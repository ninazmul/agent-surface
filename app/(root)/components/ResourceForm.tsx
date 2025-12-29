"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { FileUploader } from "@/components/shared/FileUploader";
import { createResource, updateResource } from "@/lib/actions/resource.actions";
import { IResource } from "@/lib/database/models/resource.model";
import { resourceDefaultValues } from "@/constants";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const resourceFormSchema = z
  .object({
    fileName: z.string().min(2, "File name must be at least 2 characters."),
    link: z.string().optional(),
    category: z.string().optional(),
    customCategory: z.string().optional(),
  })
  .refine((data) => data.category || data.customCategory, {
    message: "Either select a category or enter a new one.",
    path: ["category"],
  });

type ResourceFormProps = {
  type: "Create" | "Update";
  resource?: IResource;
  resourceId?: string;
};

const ResourceForm = ({ type, resource, resourceId }: ResourceFormProps) => {
  const [link, setLink] = useState<File[]>([]);
  const router = useRouter();

  const initialValues =
    resource && type === "Update"
      ? {
          ...resource,
          customCategory: "",
        }
      : resourceDefaultValues;

  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof resourceFormSchema>) {
    let uploadedLinkUrl = values.link;
    const finalCategory = values.customCategory || values.category;

    if (link.length > 0) {
      const uploaded = await startUpload(link);
      if (uploaded && uploaded.length > 0) {
        uploadedLinkUrl = uploaded[0].url;
      }
    }

    try {
      const resourceData = {
        ...values,
        category: finalCategory,
        link: uploadedLinkUrl || "",
      };

      if (type === "Create") {
        const newResource = await createResource({
          ...resourceData,
          category: finalCategory || "",
          createdAt: new Date(),
        });
        if (newResource) {
          form.reset();
          toast.success("Docs upload successful!!");
          const navigate = () => {
            router.replace("/resources");
            router.refresh();
          };

          if (newResource) {
            navigate();
          }
        }
      } else if (type === "Update" && resourceId) {
        const updatedResource = await updateResource(resourceId, resourceData);
        if (updatedResource) {
          form.reset();
          toast.success("Updated Successfully!");
          const navigate = () => {
            router.replace("/resources");
            router.refresh();
          };

          if (updatedResource) {
            navigate();
          }
        }
      }
    } catch (error) {
      console.error("Docs Resource failed", error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm"
      >
        {/* Section: Resource Info */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 text-center">
            Add New Resource
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Name */}
          <FormField
            control={form.control}
            name="fileName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter file name"
                    {...field}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Category</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full rounded-md border border-input bg-background dark:bg-gray-700 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onChange={(e) => {
                      const selected = e.target.value;
                      field.onChange(selected);
                      if (selected) form.setValue("customCategory", "");
                    }}
                  >
                    <option value="">Select a category</option>
                    <option value="Marketing Materials">
                      Marketing Materials
                    </option>
                    <option value="Guidelines & Admission Requirements">
                      Guidelines & Admission Requirements
                    </option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="customCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Or Add New Category</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter custom category"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    if (e.target.value) form.setValue("category", "");
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload */}
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Resource File</FormLabel>
              <FormControl className="h-72">
                <FileUploader
                  onFieldChange={field.onChange}
                  fileUrl={field.value || ""}
                  setFiles={setLink}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full col-span-2 rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
          >
            {form.formState.isSubmitting
              ? "Uploading..."
              : type === "Create"
              ? "Upload Resource"
              : "Update Resource"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ResourceForm;
