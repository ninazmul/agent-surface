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
import { useMemo, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { FileUploader } from "@/components/shared/FileUploader";
import {
  createPromotion,
  updatePromotion,
} from "@/lib/actions/promotion.actions";
import { IPromotion } from "@/lib/database/models/promotion.model";
import { promotionDefaultValues } from "@/constants";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import countries from "world-countries";
import Select from "react-select";
import { courseKey, expandCourses } from "@/lib/course.utils";
import { ICourse } from "@/lib/database/models/course.model";
import { IServices } from "@/lib/database/models/service.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { Types } from "mongoose";

export const promotionFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  criteria: z.string().min(2, "Criteria must be at least 2 characters."),
  startDate: z.date(),
  endDate: z.date(),
  photo: z.string().optional(),
  agencies: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  course: z
    .array(
      z.object({
        name: z.string(),
        courseDuration: z.string().optional(),
        courseType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        campus: z.object({
          name: z.string(),
          shift: z.string(),
        }),
        courseFee: z.string().optional(),
      })
    )
    .optional(),
  services: z
    .array(
      z.object({
        _id: z.string(),
        title: z.string(),
        serviceType: z.string(),
        amount: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
  discount: z.string().optional(),
  sku: z.string(),
});

type PromotionFormProps = {
  type: "Create" | "Update";
  promotion?: IPromotion;
  promotionId?: string;
  courses?: ICourse[];
  services?: IServices[];
  agencies: IProfile[];
};

const PromotionForm = ({
  type,
  promotion,
  promotionId,
  courses,
  services,
  agencies,
}: PromotionFormProps) => {
  const [photo, setPhoto] = useState<File[]>([]);
  const router = useRouter();

  const countryOptions = countries
    .map((country) => ({
      value: country.name.common,
      label: `${country.flag} ${country.name.common}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label)); // Optional: alphabetically sort

  const agencyOptions = agencies.map((agency) => ({
    value: agency.email,
    label: agency.name,
  }));

  const expandedCourses = useMemo(
    () => courses?.flatMap(expandCourses) || [],
    [courses]
  );

  const initialValues =
    promotion && type === "Update"
      ? {
          ...promotion,
          course:
            promotion?.course?.map((c) => ({
              name: c.name,
              courseDuration: c.courseDuration,
              courseType: c.courseType,
              startDate: c.startDate ? new Date(c.startDate) : undefined,
              endDate: c.endDate ? new Date(c.endDate) : undefined,
              campus: c.campus ? { ...c.campus } : { name: "", shift: "" },
              courseFee: c.courseFee || "0",
            })) || [],

          services:
            promotion?.services?.map((s) => ({
              _id: s._id.toString(),
              title: s.title,
              serviceType: s.serviceType,
              amount: s.amount || "0",
              description: s.description,
            })) || [],
          startDate: new Date(promotion.startDate),
          endDate: new Date(promotion.endDate),
          sku: promotion.sku || "",
          countries: promotion.countries || [],
          agencies: promotion.agencies || [],
        }
      : promotionDefaultValues;

  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<z.infer<typeof promotionFormSchema>>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof promotionFormSchema>) {
    let uploadedPhotoUrl = values.photo;

    if (photo.length > 0) {
      const uploaded = await startUpload(photo);
      if (uploaded && uploaded.length > 0) {
        uploadedPhotoUrl = uploaded[0].url;
      }
    }

    async function notifyAgencies(emails: string[], promotionTitle: string) {
      if (!emails || emails.length === 0) return;
      try {
        await fetch("/api/send-promotion-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients: emails,
            promotionTitle,
            promotionLink: `/promotions`,
          }),
        });
        toast.success("Agencies notified via email!");
      } catch (err) {
        console.error("Failed to notify agencies", err);
        toast.error("Failed to send emails to agencies.");
      }
    }

    async function notifyAgenciesViaWhatsApp(
      emails: string[],
      promotionTitle: string
    ) {
      if (!emails || emails.length === 0) return;

      try {
        const numbers = await Promise.all(
          emails.map(async (email) => {
            const profile = await getProfileByEmail(email);
            return profile?.number;
          })
        );

        const validNumbers = numbers.filter(Boolean);

        if (validNumbers.length === 0) return;

        await fetch("/api/send-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients: validNumbers,
            promotionTitle,
            promotionLink: `/promotions`,
          }),
        });

        toast.success("Agencies notified via WhatsApp!");
      } catch (err) {
        console.error("Failed to notify agencies via WhatsApp", err);
        toast.error("Failed to send WhatsApp messages to agencies.");
      }
    }

    try {
      if (type === "Create") {
        const newPromotion = await createPromotion({
          ...values,
          photo: uploadedPhotoUrl || "",
          course: values.course || [],
          services: values.services?.map((s) => ({
            ...s,
            _id: new Types.ObjectId(s._id),
          })),
          createdAt: new Date(),
        });
        if (newPromotion) {
          form.reset();
          toast.success("Promotion created successfully!");
          // Notify all agencies on creation
          await notifyAgencies(values.agencies || [], newPromotion.title);
          await notifyAgenciesViaWhatsApp(
            values.agencies || [],
            newPromotion.title
          );
          router.push(`/promotions`);
        }
      } else if (type === "Update" && promotionId && promotion) {
        const updatedPromotion = await updatePromotion(promotionId, {
          ...values,
          photo: uploadedPhotoUrl || "",
          course: values.course || [],
          services: values.services?.map((s) => ({
            ...s,
            _id: new Types.ObjectId(s._id),
          })),
        });
        if (updatedPromotion) {
          form.reset();
          toast.success("Promotion updated successfully!");

          // Compute newly added agencies
          const previousAgencies = promotion.agencies || [];
          const updatedAgencies = values.agencies || [];
          const newAgencies = updatedAgencies.filter(
            (email) => !previousAgencies.includes(email)
          );

          // Notify only newly added agencies
          await notifyAgencies(newAgencies, updatedPromotion.title);
          await notifyAgenciesViaWhatsApp(newAgencies, updatedPromotion.title);
          router.push(`/promotions`);
        }
      }
    } catch (error) {
      console.error("Promotion submission failed", error);
      toast.error("Something went wrong.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-2xl bg-fuchsia-50 dark:bg-gray-800 p-6 shadow-sm"
      >
        {/* Section: Promotion Info */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-fuchsia-800">
            Promotion Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter promotion title"
                    {...field}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
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
                  <Input
                    placeholder="Enter description"
                    {...field}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Criteria */}
          <FormField
            control={form.control}
            name="criteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Criteria</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter eligibility criteria"
                    {...field}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
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
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date &&
                      !isNaN(field.value.getTime())
                        ? field.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const dateValue = e.target.value
                        ? new Date(e.target.value)
                        : undefined;
                      field.onChange(dateValue);
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
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
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date &&
                      !isNaN(field.value.getTime())
                        ? field.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const dateValue = e.target.value
                        ? new Date(e.target.value)
                        : undefined;
                      field.onChange(dateValue);
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SKU */}
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter SKU"
                    {...field}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

          {/* Agencies */}
          <FormField
            control={form.control}
            name="agencies"
            render={() => (
              <FormItem>
                <FormLabel>Agencies</FormLabel>
                <FormControl>
                  <Controller
                    control={form.control}
                    name="agencies"
                    render={({ field }) => (
                      <Select
                        isMulti
                        options={agencyOptions}
                        value={agencyOptions.filter((opt) =>
                          field.value?.includes(opt.value)
                        )}
                        onChange={(selected) =>
                          field.onChange(selected.map((opt) => opt.value))
                        }
                        placeholder="Select agencies..."
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

          {/* Photo */}
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Banner (Optional)</FormLabel>
                <FormControl className="h-72">
                  <FileUploader
                    onFieldChange={field.onChange}
                    fileUrl={field.value || ""}
                    setFiles={setPhoto}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ✅ Courses & Services */}
        <section className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm space-y-6">
          <h3 className="text-xl font-semibold">Courses & Services</h3>

          {/* Courses */}
          <div>
            <h4 className="font-semibold mb-2">Courses</h4>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {expandedCourses.map((course) => {
                const isSelected = form
                  .watch("course")
                  ?.some(
                    (c) =>
                      c.name === course.name &&
                      c.campus?.name === course.campus.name &&
                      c.campus?.shift === course.campus.shift
                  );

                return (
                  <div
                    key={courseKey(course)} // ✅ use unique courseKey
                    className={`flex-shrink-0 rounded-xl border p-4 shadow-md
                          w-[260px] transition-all duration-200
                          ${
                            isSelected
                              ? "border-blue-600 dark:border-blue-500 scale-105"
                              : "border-gray-200 dark:border-gray-500"
                          }`}
                  >
                    <h4 className="font-semibold mb-1">{course.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Type: {course.courseType}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Duration: {course.courseDuration}
                    </p>
                    <p>Campus: {course.campus.name}</p>
                    <p>Shift: {course.campus.shift}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Fee: €{course.courseFee}
                    </p>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const current = form.getValues("course") || [];
                        if (isSelected) {
                          form.setValue(
                            "course",
                            current.filter(
                              (c) =>
                                !(
                                  c.name === course.name &&
                                  c.campus?.name === course.campus.name &&
                                  c.campus?.shift === course.campus.shift
                                )
                            )
                          );
                        } else {
                          form.setValue("course", [...current, course]);
                        }
                      }}
                      className={`w-full mt-2  ${
                        isSelected ? "bg-blue-600 text-white" : ""
                      }`}
                    >
                      {isSelected ? "Selected ✅" : "Select Course"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-2">Services</h4>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {services?.map((service) => {
                const isSelected = form
                  .watch("services")
                  ?.some((s) => s._id.toString() === service._id.toString());
                return (
                  <div
                    key={service._id.toString()}
                    className={`flex-shrink-0 rounded-xl border p-4 shadow-md w-[260px]
                      ${
                        isSelected
                          ? "border-blue-600 dark:border-blue-500 scale-105"
                          : "border-gray-200 dark:border-gray-500"
                      }`}
                  >
                    <h4 className="font-semibold">{service.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Type: {service.serviceType}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Amount: €{service.amount}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {service.description}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const current = form.getValues("services") || [];
                        if (isSelected) {
                          form.setValue(
                            "services",
                            current.filter(
                              (s) => s._id.toString() !== service._id.toString()
                            )
                          );
                        } else {
                          form.setValue("services", [
                            ...current,
                            {
                              _id: service._id.toString(),
                              title: service.title,
                              serviceType: service.serviceType || "",
                              amount: service.amount || "",
                              description: service.description || "",
                            },
                          ]);
                        }
                      }}
                      className={`w-full mt-2 ${
                        isSelected ? "bg-blue-600 text-white" : ""
                      }`}
                    >
                      {isSelected ? "Selected ✅" : "Select Service"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Discount */}
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fixed Discount</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter fixed discount"
                  {...field}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
            className="w-full rounded-2xl"
          >
            {form.formState.isSubmitting
              ? "Submitting..."
              : `${type} Promotion`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PromotionForm;
