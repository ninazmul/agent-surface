"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { useEffect, useMemo, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { FileUploader } from "@/components/shared/FileUploader";
import {
  createPromotion,
  updatePromotion,
} from "@/lib/actions/promotion.actions";
import { IPromotion } from "@/lib/database/models/promotion.model";
import { promotionDefaultValues } from "@/constants";
import toast from "react-hot-toast";
import countries from "world-countries";
import Select from "react-select";
import { ICourse } from "@/lib/database/models/course.model";
import { IServices } from "@/lib/database/models/service.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { Types } from "mongoose";
import { courseKey, normalizeCourses } from "@/lib/utils";
import { Info } from "lucide-react";

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
        _id: z.string(),
        name: z.string(),
        courseDuration: z.string().optional(),
        courseType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        campus: z.object({
          name: z.string(),
          shift: z.enum(["morning", "afternoon", "general"]),
        }),
        courseFee: z.string().optional(),
      }),
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
      }),
    )
    .optional(),
  discount: z.string().optional(),
  commissionPercent: z.string().optional(),
  commissionAmount: z.string().optional(),
  sku: z.string(),
});

type PromotionFormProps = {
  type: "Create" | "Update";
  promotion?: IPromotion;
  promotionId?: string;
  courses?: ICourse[];
  services?: IServices[];
  agencies: IProfile[];
  onSuccess?: () => void;
};

const PromotionForm = ({
  type,
  promotion,
  promotionId,
  courses,
  services,
  agencies,
  onSuccess,
}: PromotionFormProps) => {
  const [photo, setPhoto] = useState<File[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

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

  const selectableCourses = useMemo(
    () => (courses ? normalizeCourses(courses) : []),
    [courses],
  );

  const initialValues =
    promotion && type === "Update"
      ? {
          ...promotion,
          course:
            promotion?.course?.map((c) => ({
              _id: c._id?.toString() ?? "",
              name: c.name ?? "",
              courseType: c.courseType,
              courseDuration: c.courseDuration,
              startDate: c.startDate ? new Date(c.startDate) : undefined,
              endDate: c.endDate ? new Date(c.endDate) : undefined,
              campus: c.campus
                ? {
                    name: c.campus.name ?? "",
                    shift: (c.campus.shift === "morning" ||
                    c.campus.shift === "afternoon" ||
                    c.campus.shift === "general"
                      ? c.campus.shift
                      : "morning") as "morning" | "afternoon" | "general",
                  }
                : { name: "Unknown", shift: "morning" as const },
              courseFee: c.courseFee ?? "0",
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
          commissionPercent: promotion?.commissionPercent,
          commissionAmount: promotion?.commissionAmount,
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

  const commissionPercent = form.watch("commissionPercent");
  const commissionAmount = form.watch("commissionAmount");

  useEffect(() => {
    if (commissionPercent) {
      form.setValue("commissionAmount", "");
    }
    if (commissionAmount) {
      form.setValue("commissionPercent", "");
    }
  }, [commissionPercent, commissionAmount, form]);

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
            promotionLink: `${process.env.NEXT_PUBLIC_APP_URL}/promotions`,
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
      promotionTitle: string,
    ) {
      if (!emails || emails.length === 0) return;

      try {
        const numbers = await Promise.all(
          emails.map(async (email) => {
            const profile = await getProfileByEmail(email);
            return profile?.number;
          }),
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
          course: values.course?.map((c) => ({
            _id: c._id,
            name: c.name,
            courseType: c.courseType,
            courseDuration: c.courseDuration,
            startDate: c.startDate,
            endDate: c.endDate,
            campus: c.campus,
            courseFee: c.courseFee,
          })),
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
            newPromotion.title,
          );
          onSuccess?.();
        }
      } else if (type === "Update" && promotionId && promotion) {
        const updatedPromotion = await updatePromotion(promotionId, {
          ...values,
          photo: uploadedPhotoUrl || "",
          course: values.course?.map((c) => ({
            _id: c._id,
            name: c.name,
            courseType: c.courseType,
            courseDuration: c.courseDuration,
            startDate: c.startDate,
            endDate: c.endDate,
            campus: c.campus,
            courseFee: c.courseFee,
          })),
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
            (email) => !previousAgencies.includes(email),
          );

          // Notify only newly added agencies
          await notifyAgencies(newAgencies, updatedPromotion.title);
          await notifyAgenciesViaWhatsApp(newAgencies, updatedPromotion.title);
          onSuccess?.();
        }
      }
    } catch (error) {
      console.error("Promotion submission failed", error);
      toast.error("Something went wrong.");
    }
  }

  const selectedCourses =
    useWatch({
      control: form.control,
      name: "course",
    }) ?? [];

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="
        w-full
        min-w-0
        rounded-2xl
        bg-white dark:bg-gray-800
        p-4 sm:p-6
        shadow-sm
        space-y-4
      "
        >
          <h2 className="text-xl font-semibold">Promotion Information</h2>

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
                            field.value?.includes(opt.value),
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
                            field.value?.includes(opt.value),
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
                {selectableCourses.map((course) => {
                  const isSelected = selectedCourses.some(
                    (c) =>
                      c._id === course._id &&
                      c.campus.name === course.campus.name &&
                      c.campus.shift === course.campus.shift,
                  );

                  const key = `course-${courseKey(course)}`;
                  const isExpanded = expandedItem === key;

                  return (
                    <div
                      key={courseKey(course)}
                      className={`relative flex-shrink-0 rounded-2xl border p-4 shadow-sm
                      w-[260px] transition-all duration-200 bg-white dark:bg-gray-900
                      ${
                        isSelected
                          ? "border-blue-600 dark:border-blue-500"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {/* Top Row */}
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-base leading-tight">
                          {course.name}
                        </h4>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedItem(isExpanded ? null : key)
                          }
                          className="text-gray-500 hover:text-blue-600 transition"
                        >
                          <Info size={16} />
                        </button>
                      </div>

                      {/* Primary Info (Decision Data Only) */}
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          {course.campus.name} • {course.campus.shift}
                        </p>
                      </div>

                      <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                        €{course.courseFee}
                      </p>

                      {/* Expandable Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-2">
                          <p>Type: {course.courseType || "Not specified"}</p>

                          <p>
                            Duration: {course.courseDuration || "Not specified"}
                          </p>

                          <p>
                            Start:{" "}
                            {course.startDate
                              ? new Date(course.startDate).toLocaleDateString()
                              : "Not scheduled"}
                          </p>

                          <p>
                            End:{" "}
                            {course.endDate
                              ? new Date(course.endDate).toLocaleDateString()
                              : "Not scheduled"}
                          </p>

                          {course.description && (
                            <div className="pt-2 text-gray-600 leading-relaxed text-justify">
                              {course.description}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Select Button */}
                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = form.getValues("course") || [];

                          if (isSelected) {
                            form.setValue(
                              "course",
                              current.filter(
                                (c) =>
                                  !(
                                    c._id === course._id &&
                                    c.campus.name === course.campus.name &&
                                    c.campus.shift === course.campus.shift
                                  ),
                              ),
                            );
                          } else {
                            if (course._id) {
                              const snapshot = {
                                _id: course._id,
                                name: course.name,
                                courseDuration: course.courseDuration,
                                courseType: course.courseType || "General",
                                startDate: course.startDate
                                  ? new Date(course.startDate)
                                  : undefined,
                                endDate: course.endDate
                                  ? new Date(course.endDate)
                                  : undefined,
                                campus: {
                                  name: course.campus.name,
                                  shift: course.campus.shift,
                                },
                                courseFee: course.courseFee,
                              };

                              form.setValue("course", [...current, snapshot]);
                            }
                          }
                        }}
                        className={`w-full mt-4 ${
                          isSelected
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : ""
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

                  const key = `service-${service._id}`;
                  const isExpanded = expandedItem === key;

                  return (
                    <div
                      key={service._id.toString()}
                      className={`relative flex-shrink-0 rounded-2xl border p-4 shadow-sm
                      w-[260px] transition-all duration-200 bg-white dark:bg-gray-900
                      ${
                        isSelected
                          ? "border-blue-600 dark:border-blue-500"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {/* Top Row */}
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-base leading-tight">
                          {service.title}
                        </h4>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedItem(isExpanded ? null : key)
                          }
                          className="text-gray-500 hover:text-blue-600 transition"
                        >
                          <Info size={16} />
                        </button>
                      </div>

                      {/* Primary Info (Decision Data Only) */}
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{service.serviceType}</p>
                      </div>

                      <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                        €{service.amount}
                      </p>

                      {/* Expandable Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-1">
                          {service.description && <p>{service.description}</p>}
                        </div>
                      )}

                      {/* Select Button */}
                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = form.getValues("services") || [];

                          if (isSelected) {
                            form.setValue(
                              "services",
                              current.filter(
                                (s) =>
                                  s._id.toString() !== service._id.toString(),
                              ),
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
                        className={`w-full mt-4 ${
                          isSelected
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : ""
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CommissionPercent */}
            <FormField
              control={form.control}
              name="commissionPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission Percent</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter commission percent"
                      {...field}
                      disabled={!!commissionAmount}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CommissionAmount */}
            <FormField
              control={form.control}
              name="commissionAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter commission amount"
                      {...field}
                      disabled={!!commissionPercent}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="w-full col-span-2 rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
            >
              {form.formState.isSubmitting
                ? "Submitting..."
                : `${type} Promotion`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PromotionForm;
