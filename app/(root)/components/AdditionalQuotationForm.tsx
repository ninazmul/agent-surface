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
import * as z from "zod";
import { useEffect, useMemo } from "react";
import {
  createQuotation,
  updateQuotation,
} from "@/lib/actions/quotation.actions";
import { IQuotation } from "@/lib/database/models/quotation.model";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IProfile } from "@/lib/database/models/profile.model";
import { ILead } from "@/lib/database/models/lead.model";
import { IServices } from "@/lib/database/models/service.model";
import { ICourse } from "@/lib/database/models/course.model";
import { createNotification } from "@/lib/actions/notification.actions";
import { Input } from "@/components/ui/input";
import { courseKey, expandCourses } from "@/lib/course.utils";
import Select from "react-select";

// ✅ Schema
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
  date: z.date(),
  author: z.string(),
  isPinned: z.boolean().optional(),
  isAdditional: z.boolean().optional(),
});

type AdditionalQuotationFormProps = {
  type: "Create" | "Update";
  quotation?: IQuotation;
  quotationId?: string;
  agency?: IProfile[];
  leads?: ILead[];
  services?: IServices[];
  courses?: ICourse[];
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

  const expandedCourses = useMemo(
    () => courses?.flatMap(expandCourses) || [],
    [courses]
  );

  const form = useForm<z.infer<typeof additionalQuotationFormSchema>>({
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
        quotation?.course?.map((c) => ({
          name: c.name,
          courseDuration: c.courseDuration,
          courseType: c.courseType,
          startDate: c.startDate ? new Date(c.startDate) : undefined,
          endDate: c.endDate ? new Date(c.endDate) : undefined,
          campus: c.campus ? { ...c.campus } : { name: "", shift: "" },
          courseFee: c.courseFee || "0",
        })) || [],
      services:
        quotation?.services?.map((s) => ({
          _id: s._id,
          title: s.title,
          serviceType: s.serviceType,
          amount: s.amount || "0",
          description: s.description,
        })) || [],
      author: isAdmin ? "" : email || "",
      date: quotation?.date ? new Date(quotation.date) : new Date(),
      isPinned: quotation?.isPinned || false,
      isAdditional: quotation?.isAdditional || true,
    },
  });

  async function onSubmit(
    values: z.infer<typeof additionalQuotationFormSchema>
  ) {
    try {
      if (type === "Create") {
        const newQuotation = await createQuotation({
          ...values,
          dateOfBirth: quotation?.dateOfBirth
            ? new Date(quotation.dateOfBirth)
            : new Date(),
          course: values.course || [],
          services: values.services || [],
        });
        if (newQuotation) {
          await createNotification({
            title: `New quotation request for ${values.name}`,
            agency: values.author || "",
            country: values.home.country,
            route: `/quotations`,
          });

          form.reset();
          toast.success("Quotation created successfully!");
          router.push(`/quotations`);
        }
      } else if (type === "Update" && quotationId) {
        const updatedQuotation = await updateQuotation(quotationId, {
          ...values,
          course: values.course || [],
          services: values.services || [],
        });
        if (updatedQuotation) {
          await createNotification({
            title: `${values.name}'s quotation request updated!`,
            agency: values.author || "",
            country: values.home.country,
            route: `/quotations`,
          });
          form.reset();
          toast.success("Updated Successfully!");
          router.push(`/quotations`);
        }
      }
    } catch (error) {
      console.error("Quotation failed", error);
    }
  }

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        const selectedStudent = leads?.find((r) => r.name === value.name);
        if (selectedStudent) {
          form.setValue("email", selectedStudent.email);
          form.setValue("number", selectedStudent.number);
          form.setValue("home", selectedStudent.home);
          form.setValue("gender", selectedStudent.gender);
          form.setValue("maritalStatus", selectedStudent.maritalStatus);
          form.setValue(
            "dateOfBirth",
            selectedStudent.dateOfBirth
              ? new Date(selectedStudent.dateOfBirth)
              : new Date()
          );
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
        className="flex flex-col gap-6 rounded-2xl bg-slate-50 dark:bg-gray-900 p-6 shadow-sm"
      >
        {/* ✅ Personal Information */}
        <h3 className="text-xl font-semibold">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="number"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="gender"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="maritalStatus"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>MaritalStatus</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                      !isNaN(field.value.getTime())
                        ? field.value.toISOString().slice(0, 10)
                        : ""
                    }
                    placeholder="Date of Birth"
                    onChange={(e) => {
                      const dateValue = e.target.value
                        ? new Date(e.target.value)
                        : undefined;
                      field.onChange(dateValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ===== Home Address ===== */}
        <section className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Home Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="home.address"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="home.city"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your city" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="home.state"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your state" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="home.zip"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Zip code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="home.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Country" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
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
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  >
                    <h4 className="font-semibold mb-1">{course.name}</h4>
                    <p className="text-sm text-gray-600">
                      Type: {course.courseType}
                    </p>
                    <p className="text-sm text-gray-600">
                      Duration: {course.courseDuration}
                    </p>
                    <p>Campus: {course.campus.name}</p>
                    <p>Shift: {course.campus.shift}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      Fee: €{course.courseFee}
                    </p>

                    <Button
                      type="button"
                      variant="outline"
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
                      className={`w-full mt-2 ${
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
                  ?.some((s) => s._id === service._id);
                return (
                  <div
                    key={service._id}
                    className={`flex-shrink-0 rounded-xl border p-4 shadow-md w-[260px]
              ${
                isSelected
                  ? "border-blue-600 dark:border-blue-500 scale-105"
                  : "border-gray-200 dark:border-gray-700"
              }`}
                  >
                    <h4 className="font-semibold">{service.title}</h4>
                    <p className="text-sm text-gray-600">
                      Type: {service.serviceType}
                    </p>
                    <p className="text-sm text-gray-600">
                      Amount: €{service.amount}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {service.description}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const current = form.getValues("services") || [];
                        if (isSelected) {
                          form.setValue(
                            "services",
                            current.filter((s) => s._id !== service._id)
                          );
                        } else {
                          form.setValue("services", [
                            ...current,
                            {
                              _id: service._id,
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

        {/* ✅ Submit Button */}
        <div className="mt-6">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-2xl"
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
