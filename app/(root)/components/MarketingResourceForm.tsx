"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Select from "react-select";
import countries from "world-countries";
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
import { FileUploader } from "@/components/shared/FileUploader";
import { useUploadThing } from "@/lib/uploadthing";
import { IMarketingResource } from "@/lib/database/models/marketing-resource.model";
import {
  createMarketingResource,
  updateMarketingResource,
} from "@/lib/actions/marketing-resource.actions";

/* =======================
   ZOD SCHEMA
======================= */
const MarketingResourceFormSchema = z
  .object({
    fileName: z.string().min(2),
    link: z.string().optional(),
    category: z.string().optional(),
    customCategory: z.string().optional(),

    priceList: z
      .array(
        z.object({
          country: z.string().min(1, "Country required"),
          price: z.number().positive("Price must be > 0"),
        })
      )
      .min(1, "At least one country price is required"),
  })
  .refine((data) => data.category || data.customCategory, {
    message: "Select or enter a category",
    path: ["category"],
  });

type FormValues = z.infer<typeof MarketingResourceFormSchema>;

type Props = {
  type: "Create" | "Update";
  resource?: IMarketingResource;
  resourceId?: string;
};

/* =======================
   COUNTRY OPTIONS
======================= */
const countryOptions = countries.map((country) => ({
  label: `${country.flag} ${country.name.common}`,
  value: country.name.common,
}));

/* =======================
   COMPONENT
======================= */
const MarketingResourceForm = ({ type, resource, resourceId }: Props) => {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<FormValues>({
    resolver: zodResolver(MarketingResourceFormSchema),
    defaultValues:
      type === "Update" && resource
        ? {
            fileName: resource.fileName,
            link: resource.link,
            category: resource.category,
            customCategory: "",
            priceList: resource.priceList,
          }
        : {
            fileName: "",
            link: "",
            category: "",
            customCategory: "",
            priceList: [{ country: "", price: 0 }],
          },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "priceList",
  });

  /* =======================
     SUBMIT
  ======================= */
  const onSubmit = async (values: FormValues) => {
    let uploadedUrl = values.link;

    if (files.length > 0) {
      const uploaded = await startUpload(files);
      uploadedUrl = uploaded?.[0]?.url;
    }

    const payload = {
      fileName: values.fileName,
      category: values.customCategory || values.category || "",
      link: uploadedUrl || "",
      priceList: values.priceList,
    };

    try {
      if (type === "Create") {
        await createMarketingResource(payload);
        toast.success("Resource created");
      } else if (resourceId) {
        await updateMarketingResource(resourceId, payload);
        toast.success("Resource updated");
      }

      router.push("/resources");
    } catch {
      toast.error("Operation failed");
    }
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl bg-white dark:bg-gray-800 p-6"
      >
        {/* FILE NAME */}
        <FormField
          control={form.control}
          name="fileName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CATEGORY */}
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

        {/* PRICE LIST */}
        <div className="space-y-4">
          <FormLabel>Country Pricing</FormLabel>

          {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-3 gap-3 items-center">
              {/* COUNTRY SELECT */}
              <FormField
                control={form.control}
                name={`priceList.${index}.country`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        options={countryOptions}
                        isSearchable
                        value={countryOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(selected) => field.onChange(selected?.value)}
                        placeholder="Select country"
                        classNamePrefix="react-select"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* PRICE */}
              <FormField
                control={form.control}
                name={`priceList.${index}.price`}
                render={({ field }) => (
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Price"
                  />
                )}
              />

              {/* REMOVE */}
              <Button
                type="button"
                variant="outline"
                onClick={() => remove(index)}
              >
                ✕
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ country: "", price: 0 })}
          >
            + Add Country
          </Button>
        </div>

        {/* FILE UPLOAD */}
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload File</FormLabel>
              <FormControl>
                <FileUploader
                  onFieldChange={field.onChange}
                  fileUrl={field.value || ""}
                  setFiles={setFiles}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full">
          {type === "Create" ? "Create Resource" : "Update Resource"}
        </Button>
      </form>
    </Form>
  );
};

export default MarketingResourceForm;
