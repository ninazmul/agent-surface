"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useEffect, useMemo, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { FileUploader } from "@/components/shared/FileUploader";
import {
  createPromotion,
  updatePromotion,
} from "@/lib/actions/promotion.actions";
import { promotionDefaultValues } from "@/constants";
import toast from "react-hot-toast";
import countries from "world-countries";
import Select from "react-select";
import { Types } from "mongoose";
import { Info } from "lucide-react";

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
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { normalizeCourses, type SelectableCourse } from "@/lib/utils";

import type { IPromotion } from "@/lib/database/models/promotion.model";
import type { ICourseByCountrySafe } from "@/lib/database/models/course.model";
import type { IServices } from "@/lib/database/models/service.model";
import type { IProfile } from "@/lib/database/models/profile.model";

type PromotionSelectableCourse = SelectableCourse & {
  feeCountry: string;
};

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

type PromotionFormValues = z.infer<typeof promotionFormSchema>;

type PromotionFormProps = {
  type: "Create" | "Update";
  promotion?: IPromotion;
  promotionId?: string;
  courses?: ICourseByCountrySafe[];
  services?: IServices[];
  agencies: IProfile[];
  onSuccess?: () => void;
};

type CourseKeyLike = {
  _id: string;
  campus: {
    name: string;
    shift: "morning" | "afternoon" | "general";
  };
  courseFee?: string;
  feeCountry?: string;
};

const promotionCourseKey = (course: CourseKeyLike) => {
  return `${course._id}-${course.campus.name}-${course.campus.shift}-${course.courseFee || "0"}-${course.feeCountry || ""}`;
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
  const { startUpload } = useUploadThing("mediaUploader");

  const countryOptions = useMemo(
    () =>
      countries
        .map((country) => ({
          value: country.name.common,
          label: `${country.flag} ${country.name.common}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  const agencyOptions = useMemo(
    () =>
      agencies.map((agency) => ({
        value: agency.email,
        label: agency.name || agency.email,
      })),
    [agencies],
  );

  const initialValues: PromotionFormValues =
    promotion && type === "Update"
      ? {
          title: promotion.title || "",
          description: promotion.description || "",
          criteria: promotion.criteria || "",
          startDate: new Date(promotion.startDate),
          endDate: new Date(promotion.endDate),
          photo: promotion.photo || "",
          agencies: promotion.agencies || [],
          countries: promotion.countries || [],
          course:
            promotion.course?.map((course) => ({
              _id: course._id?.toString() ?? "",
              name: course.name ?? "",
              courseType: course.courseType,
              courseDuration: course.courseDuration,
              startDate: course.startDate
                ? new Date(course.startDate)
                : undefined,
              endDate: course.endDate ? new Date(course.endDate) : undefined,
              campus: {
                name: course.campus?.name ?? "Unknown",
                shift:
                  course.campus?.shift === "morning" ||
                  course.campus?.shift === "afternoon" ||
                  course.campus?.shift === "general"
                    ? course.campus.shift
                    : "morning",
              },
              courseFee: course.courseFee ?? "0",
            })) || [],
          services:
            promotion.services?.map((service) => ({
              _id: service._id.toString(),
              title: service.title,
              serviceType: service.serviceType,
              amount: service.amount || "0",
              description: service.description,
            })) || [],
          discount: promotion.discount || "",
          commissionPercent: promotion.commissionPercent || "",
          commissionAmount: promotion.commissionAmount || "",
          sku: promotion.sku || "",
        }
      : {
          title: promotionDefaultValues.title || "",
          description: promotionDefaultValues.description || "",
          criteria: promotionDefaultValues.criteria || "",
          startDate: promotionDefaultValues.startDate
            ? new Date(promotionDefaultValues.startDate)
            : new Date(),
          endDate: promotionDefaultValues.endDate
            ? new Date(promotionDefaultValues.endDate)
            : new Date(),
          photo: promotionDefaultValues.photo || "",
          agencies: [],
          countries: [],
          course: [],
          services: [],
          discount: "",
          commissionPercent: "",
          commissionAmount: "",
          sku: "",
        };

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: initialValues,
  });

  const watchedCountries = useWatch({
    control: form.control,
    name: "countries",
  });

  const selectedCountries = useMemo(
    () => watchedCountries ?? [],
    [watchedCountries],
  );

  const selectedCourses =
    useWatch({
      control: form.control,
      name: "course",
    }) ?? [];

  const selectedServices =
    useWatch({
      control: form.control,
      name: "services",
    }) ?? [];

  const selectableCourses = useMemo<PromotionSelectableCourse[]>(() => {
    if (!courses || selectedCountries.length === 0) return [];

    return selectedCountries.flatMap((country) =>
      normalizeCourses(courses, country).map((course) => ({
        ...course,
        feeCountry: country,
      })),
    );
  }, [courses, selectedCountries]);

  const commissionPercent = form.watch("commissionPercent");
  const commissionAmount = form.watch("commissionAmount");

  useEffect(() => {
    if (commissionPercent) form.setValue("commissionAmount", "");
    if (commissionAmount) form.setValue("commissionPercent", "");
  }, [commissionPercent, commissionAmount, form]);

  const selectedCountriesKey = useMemo(
    () => selectedCountries.join("|"),
    [selectedCountries],
  );

  useEffect(() => {
    form.setValue("course", [], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form, selectedCountriesKey]);

  async function onSubmit(values: PromotionFormValues) {
    let uploadedPhotoUrl = values.photo;

    if (photo.length > 0) {
      const uploaded = await startUpload(photo);
      uploadedPhotoUrl = uploaded?.[0]?.url || uploadedPhotoUrl;
    }

    async function notifyAgencies(emails: string[], promotionTitle: string) {
      if (emails.length === 0) return;

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
      } catch (error) {
        console.error("Failed to notify agencies", error);
        toast.error("Failed to send emails to agencies.");
      }
    }

    async function notifyAgenciesViaWhatsApp(
      emails: string[],
      promotionTitle: string,
    ) {
      if (emails.length === 0) return;

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
            promotionLink: "/promotions",
          }),
        });

        toast.success("Agencies notified via WhatsApp!");
      } catch (error) {
        console.error("Failed to notify agencies via WhatsApp", error);
        toast.error("Failed to send WhatsApp messages to agencies.");
      }
    }

    try {
      const payload = {
        ...values,
        photo: uploadedPhotoUrl || "",
        course: values.course?.map((course) => ({
          _id: course._id,
          name: course.name,
          courseType: course.courseType,
          courseDuration: course.courseDuration,
          startDate: course.startDate,
          endDate: course.endDate,
          campus: course.campus,
          courseFee: course.courseFee,
        })),
        services: values.services?.map((service) => ({
          ...service,
          _id: new Types.ObjectId(service._id),
        })),
      };

      if (type === "Create") {
        const newPromotion = await createPromotion({
          ...payload,
          createdAt: new Date(),
        });

        if (newPromotion) {
          form.reset();
          toast.success("Promotion created successfully!");
          await notifyAgencies(values.agencies || [], newPromotion.title);
          await notifyAgenciesViaWhatsApp(
            values.agencies || [],
            newPromotion.title,
          );
          onSuccess?.();
        }

        return;
      }

      if (type === "Update" && promotionId && promotion) {
        const updatedPromotion = await updatePromotion(promotionId, payload);

        if (updatedPromotion) {
          form.reset();
          toast.success("Promotion updated successfully!");

          const previousAgencies = promotion.agencies || [];
          const updatedAgencies = values.agencies || [];
          const newAgencies = updatedAgencies.filter(
            (email) => !previousAgencies.includes(email),
          );

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

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full min-w-0 rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm space-y-4"
        >
          <h2 className="text-xl font-semibold">Promotion Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["title", "description", "criteria", "sku"] as const).map(
              (name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={`Enter ${name}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ),
            )}

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
                        !Number.isNaN(field.value.getTime())
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(event) =>
                        field.onChange(
                          event.target.value
                            ? new Date(event.target.value)
                            : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        !Number.isNaN(field.value.getTime())
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(event) =>
                        field.onChange(
                          event.target.value
                            ? new Date(event.target.value)
                            : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          value={countryOptions.filter((option) =>
                            field.value?.includes(option.value),
                          )}
                          onChange={(selected) =>
                            field.onChange(
                              selected.map((option) => option.value),
                            )
                          }
                          placeholder="Select countries..."
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          value={agencyOptions.filter((option) =>
                            field.value?.includes(option.value),
                          )}
                          onChange={(selected) =>
                            field.onChange(
                              selected.map((option) => option.value),
                            )
                          }
                          placeholder="Select agencies..."
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Banner Optional</FormLabel>
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

          <section className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm space-y-6">
            <h3 className="text-xl font-semibold">Courses & Services</h3>

            <div>
              <h4 className="font-semibold mb-2">Courses</h4>

              {selectedCountries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Select at least one country first to show country-based course
                  fees.
                </p>
              ) : selectableCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No courses available for the selected countries.
                </p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {selectableCourses.map((course) => {
                    const isSelected = selectedCourses.some(
                      (selectedCourse) =>
                        promotionCourseKey({
                          ...selectedCourse,
                          feeCountry: course.feeCountry,
                        }) === promotionCourseKey(course),
                    );

                    const key = `course-${promotionCourseKey(course)}`;
                    const isExpanded = expandedItem === key;

                    return (
                      <div
                        key={promotionCourseKey(course)}
                        className={`relative flex-shrink-0 rounded-2xl border p-4 shadow-sm w-[260px] bg-white dark:bg-gray-900 ${
                          isSelected
                            ? "border-blue-600 dark:border-blue-500"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
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

                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>
                            {course.campus.name} - {course.campus.shift}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fee country: {course.feeCountry}
                          </p>
                        </div>

                        <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                          €{course.courseFee}
                        </p>

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-2">
                            <p>Type: {course.courseType || "Not specified"}</p>
                            <p>
                              Duration:{" "}
                              {course.courseDuration || "Not specified"}
                            </p>
                            <p>
                              Start:{" "}
                              {course.startDate
                                ? new Date(
                                    course.startDate,
                                  ).toLocaleDateString()
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
                                  (selectedCourse) =>
                                    !(
                                      selectedCourse._id === course._id &&
                                      selectedCourse.campus.name ===
                                        course.campus.name &&
                                      selectedCourse.campus.shift ===
                                        course.campus.shift &&
                                      selectedCourse.courseFee ===
                                        course.courseFee
                                    ),
                                ),
                                { shouldDirty: true, shouldValidate: true },
                              );
                              return;
                            }

                            form.setValue(
                              "course",
                              [
                                ...current,
                                {
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
                                },
                              ],
                              { shouldDirty: true, shouldValidate: true },
                            );
                          }}
                          className={`w-full mt-4 ${
                            isSelected
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : ""
                          }`}
                        >
                          {isSelected ? "Selected" : "Select Course"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Services</h4>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {services?.map((service) => {
                  const isSelected = selectedServices.some(
                    (selectedService) =>
                      selectedService._id.toString() === service._id.toString(),
                  );

                  const key = `service-${service._id}`;
                  const isExpanded = expandedItem === key;

                  return (
                    <div
                      key={service._id.toString()}
                      className={`relative flex-shrink-0 rounded-2xl border p-4 shadow-sm w-[260px] bg-white dark:bg-gray-900 ${
                        isSelected
                          ? "border-blue-600 dark:border-blue-500"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
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

                      <div className="mt-2 text-sm text-gray-600">
                        <p>{service.serviceType}</p>
                      </div>

                      <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                        €{service.amount}
                      </p>

                      {isExpanded && service.description && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                          <p>{service.description}</p>
                        </div>
                      )}

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
                                (selectedService) =>
                                  selectedService._id.toString() !==
                                  service._id.toString(),
                              ),
                              { shouldDirty: true, shouldValidate: true },
                            );
                            return;
                          }

                          form.setValue(
                            "services",
                            [
                              ...current,
                              {
                                _id: service._id.toString(),
                                title: service.title,
                                serviceType: service.serviceType || "",
                                amount: service.amount || "",
                                description: service.description || "",
                              },
                            ],
                            { shouldDirty: true, shouldValidate: true },
                          );
                        }}
                        className={`w-full mt-4 ${
                          isSelected
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : ""
                        }`}
                      >
                        {isSelected ? "Selected" : "Select Service"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fixed Discount</FormLabel>
                <FormControl>
                  <Input placeholder="Enter fixed discount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="w-full rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
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
