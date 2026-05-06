"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { Types } from "mongoose";
import { Info } from "lucide-react";
import toast from "react-hot-toast";

import {
  createQuotation,
  updateQuotation,
} from "@/lib/actions/quotation.actions";
import { createNotification } from "@/lib/actions/notification.actions";
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

import type { IQuotation } from "@/lib/database/models/quotation.model";
import type { IProfile } from "@/lib/database/models/profile.model";
import type { ILead } from "@/lib/database/models/lead.model";
import type { IServices } from "@/lib/database/models/service.model";
import type { ICourseByCountrySafe } from "@/lib/database/models/course.model";
import { courseKey, normalizeCourses } from "@/lib/utils";

export const additionalQuotationFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  number: z.string().min(10, "Number is required."),
  gender: z.string().min(1, "Gender is required."),
  maritalStatus: z.string().min(1, "Marital status is required."),
  dateOfBirth: z.preprocess((val) => {
    if (!val) return undefined;
    return val instanceof Date ? val : new Date(val as string);
  }, z.date()),
  home: z.object({
    address: z.string(),
    zip: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string(),
  }),
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
  date: z.date(),
  author: z.string(),
  isPinned: z.boolean().optional(),
  isAdditional: z.boolean().optional(),
});

type AdditionalQuotationFormValues = z.infer<
  typeof additionalQuotationFormSchema
>;

type AdditionalQuotationFormProps = {
  type: "Create" | "Update";
  quotation?: IQuotation;
  quotationId?: string;
  agency?: IProfile[];
  leads?: ILead[];
  services?: IServices[];
  courses?: ICourseByCountrySafe[];
  isAdmin?: boolean;
  email: string;
};

const AdditionalQuotationForm = ({
  type,
  quotation,
  quotationId,
  leads,
  services,
  courses,
  isAdmin,
  email,
}: AdditionalQuotationFormProps) => {
  const router = useRouter();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const form = useForm<AdditionalQuotationFormValues>({
    resolver: zodResolver(additionalQuotationFormSchema),
    defaultValues: {
      name: quotation?.name || "",
      email: quotation?.email || "",
      number: quotation?.number || "",
      gender: quotation?.gender || "",
      maritalStatus: quotation?.maritalStatus || "",
      dateOfBirth: quotation?.dateOfBirth
        ? new Date(quotation.dateOfBirth)
        : new Date(),
      home: quotation?.home || {
        address: "",
        zip: "",
        country: "",
        state: "",
        city: "",
      },
      course:
        quotation?.course?.map((course) => ({
          _id: course._id.toString(),
          name: course.name,
          courseType: course.courseType,
          courseDuration: course.courseDuration,
          startDate: course.startDate ? new Date(course.startDate) : undefined,
          endDate: course.endDate ? new Date(course.endDate) : undefined,
          campus: {
            name: course.campus?.name || "",
            shift: course.campus?.shift as "morning" | "afternoon" | "general",
          },
          courseFee: course.courseFee,
        })) || [],
      services:
        quotation?.services?.map((service) => ({
          _id: service._id.toString(),
          title: service.title,
          serviceType: service.serviceType,
          amount: service.amount || "0",
          description: service.description,
        })) || [],
      author: quotation?.author || (isAdmin ? "" : email || ""),
      date: quotation?.date ? new Date(quotation.date) : new Date(),
      isPinned: quotation?.isPinned || false,
      isAdditional: quotation?.isAdditional ?? true,
    },
  });

  const selectedCountry = useWatch({
    control: form.control,
    name: "home.country",
  });

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

  const selectableCourses = useMemo(
    () => (courses ? normalizeCourses(courses, selectedCountry) : []),
    [courses, selectedCountry],
  );

  const leadOptions = useMemo(
    () =>
      leads?.map((lead) => ({
        label: `${lead.name} (${lead.email})`,
        value: lead.name,
      })) || [],
    [leads],
  );

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name !== "name") return;

      const selectedStudent = leads?.find((lead) => lead.name === value.name);
      if (!selectedStudent) return;

      form.setValue("email", selectedStudent.email || "");
      form.setValue("number", selectedStudent.number || "");
      form.setValue(
        "home",
        selectedStudent.home || {
          address: "",
          zip: "",
          country: "",
          state: "",
          city: "",
        },
      );
      form.setValue("gender", selectedStudent.gender || "");
      form.setValue("maritalStatus", selectedStudent.maritalStatus || "");
      form.setValue(
        "dateOfBirth",
        selectedStudent.dateOfBirth
          ? new Date(selectedStudent.dateOfBirth)
          : new Date(),
      );
      form.setValue("author", selectedStudent.author || email);
      form.setValue("course", [], {
        shouldDirty: true,
        shouldValidate: true,
      });
    });

    return () => subscription.unsubscribe?.();
  }, [email, form, leads]);

  async function onSubmit(values: AdditionalQuotationFormValues) {
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth,
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
        const newQuotation = await createQuotation(payload);

        if (newQuotation) {
          await createNotification({
            title: `New quotation request for ${values.name}`,
            agency: values.author || "",
            country: values.home.country,
            route: "/quotations",
          });

          form.reset();
          toast.success("Quotation created successfully!");
          router.push("/quotations");
        }

        return;
      }

      if (type === "Update" && quotationId) {
        const updatedQuotation = await updateQuotation(quotationId, payload);

        if (updatedQuotation) {
          await createNotification({
            title: `${values.name}'s quotation request updated!`,
            agency: values.author || "",
            country: values.home.country,
            route: "/quotations",
          });

          form.reset();
          toast.success("Updated Successfully!");
          router.push("/quotations");
        }
      }
    } catch (error) {
      console.error("Quotation failed", error);
      toast.error("Quotation failed");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4"
      >
        <h3 className="text-xl font-semibold">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Student</FormLabel>
            <FormControl>
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Select
                    options={leadOptions}
                    isSearchable
                    value={
                      leadOptions.find((opt) => opt.value === field.value) ||
                      null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                    placeholder="Select a student"
                    classNamePrefix="react-select"
                  />
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          {(["email", "number", "gender", "maritalStatus"] as const).map(
            (fieldName) => (
              <FormField
                key={fieldName}
                name={fieldName}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {fieldName === "maritalStatus"
                        ? "Marital Status"
                        : fieldName.charAt(0).toUpperCase() +
                          fieldName.slice(1)}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ),
          )}

          <FormField
            name="dateOfBirth"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date &&
                      !Number.isNaN(field.value.getTime())
                        ? field.value.toISOString().slice(0, 10)
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
        </div>

        <section className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Home Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["address", "city", "state", "zip", "country"] as const).map(
              (fieldName) => (
                <FormField
                  key={fieldName}
                  name={`home.${fieldName}`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {fieldName === "zip"
                          ? "Zip"
                          : fieldName.charAt(0).toUpperCase() +
                            fieldName.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            fieldName === "zip"
                              ? "Zip code"
                              : fieldName.charAt(0).toUpperCase() +
                                fieldName.slice(1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ),
            )}
          </div>
        </section>

        <section className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm space-y-6">
          <h3 className="text-xl font-semibold">Courses & Services</h3>

          <div>
            <h4 className="font-semibold mb-2">Courses</h4>

            {!selectedCountry ? (
              <p className="text-sm text-muted-foreground">
                Select a student first to show country-based course fees.
              </p>
            ) : selectableCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No courses available for this country.
              </p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {selectableCourses.map((course) => {
                  const isSelected = selectedCourses.some(
                    (selectedCourse) =>
                      selectedCourse._id === course._id &&
                      selectedCourse.campus.name === course.campus.name &&
                      selectedCourse.campus.shift === course.campus.shift,
                  );

                  const key = `course-${courseKey(course)}`;
                  const isExpanded = expandedItem === key;

                  return (
                    <div
                      key={courseKey(course)}
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

                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          {course.campus.name} - {course.campus.shift}
                        </p>
                        <p className="text-xs text-gray-500">
                          Fee country: {selectedCountry}
                        </p>
                      </div>

                      <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                        €{course.courseFee}
                      </p>

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
                                      course.campus.shift
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
                        onClick={() => setExpandedItem(isExpanded ? null : key)}
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

        <div className="mt-6">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
          >
            {form.formState.isSubmitting
              ? type === "Update"
                ? "Updating..."
                : "Creating..."
              : type === "Update"
                ? "Update Quotation"
                : "Create Quotation"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdditionalQuotationForm;
