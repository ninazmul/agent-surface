"use client";

import * as z from "zod";
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
import { useRouter } from "next/navigation";
import { createLead, updateLead } from "@/lib/actions/lead.actions";
import { ILead } from "@/lib/database/models/lead.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { createNotification } from "@/lib/actions/notification.actions";
import { ICourse } from "@/lib/database/models/course.model";
import countries from "world-countries";
import { FileUploader } from "@/components/shared/FileUploader";
import { useUploadThing } from "@/lib/uploadthing";
import { useMemo, useState } from "react";
import Select from "react-select";
import { IServices } from "@/lib/database/models/service.model";
import { courseKey, expandCourses } from "@/lib/course.utils";
import { createTrack } from "@/lib/actions/track.actions";
import { Types } from "mongoose";
import toast from "react-hot-toast";

// ✅ Schema
const LeadFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  number: z.string().min(10, "Number must be at least 10 digits."),
  gender: z.string().min(1, "Gender is required."),
  maritalStatus: z.string().min(1, "Marital status is required."),
  dateOfBirth: z.date(),
  home: z.object({
    address: z.string(),
    zip: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string(),
  }),
  irish: z
    .object({
      address: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
    })
    .optional(),
  passport: z
    .object({
      visa: z.boolean().optional(),
      number: z.string().optional(),
      country: z.string().optional(),
      file: z.string().optional(),
      issueDate: z.date().optional(),
      expirationDate: z.date().optional(),
    })
    .optional(),
  arrival: z
    .object({
      flight: z.string().optional(),
      file: z.string().optional(),
      date: z.date().optional(),
      time: z.date().optional(),
    })
    .optional(),
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
  note: z.string().optional(),
  progress: z.enum(["Open", "Contacted", "Converted", "Closed"]),
  status: z.enum(["Perception", "Cold", "Warm", "Hot"]),
  date: z.date(),
  author: z.string().optional(),
  isPinned: z.boolean().optional(),
  others: z
    .array(
      z.object({
        fileName: z.string(),
        fileUrl: z.string(),
      })
    )
    .optional(),
  social: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      skype: z.string().optional(),
    })
    .optional(),
});

type LeadFormProps = {
  type: "Create" | "Update";
  Lead?: ILead;
  LeadId?: string;
  agency?: IProfile[];
  courses?: ICourse[];
  services?: IServices[];
  isAdmin?: boolean;
  email: string;
};

const LeadForm = ({
  type,
  Lead,
  LeadId,
  agency,
  isAdmin,
  email,
  courses,
  services,
}: LeadFormProps) => {
  const router = useRouter();
  const { startUpload } = useUploadThing("mediaUploader");

  const [passportFile, setPassportFile] = useState<File[]>([]);
  const [arrivalFile, setArrivalFile] = useState<File[]>([]);

  const countryOptions = countries.map((country) => ({
    label: `${country.flag} ${country.name.common}`,
    value: country.name.common,
  }));

  const expandedCourses = useMemo(
    () => courses?.flatMap(expandCourses) || [],
    [courses]
  );

  const form = useForm<z.infer<typeof LeadFormSchema>>({
    resolver: zodResolver(LeadFormSchema),
    defaultValues: {
      name: Lead?.name || "",
      email: Lead?.email || "",
      number: Lead?.number || "",
      gender: Lead?.gender || "",
      maritalStatus: Lead?.maritalStatus || "",
      dateOfBirth: Lead?.dateOfBirth ? new Date(Lead.dateOfBirth) : new Date(),
      home: Lead?.home || {
        address: "",
        zip: "",
        country: "",
        state: "",
        city: "",
      },

      irish: Lead?.irish ?? undefined,

      passport: Lead?.passport
        ? {
            ...Lead.passport,
            issueDate: Lead.passport.issueDate
              ? new Date(Lead.passport.issueDate)
              : undefined,
            expirationDate: Lead.passport.expirationDate
              ? new Date(Lead.passport.expirationDate)
              : undefined,
          }
        : undefined,

      arrival: Lead?.arrival
        ? {
            ...Lead.arrival,
            date: Lead.arrival.date ? new Date(Lead.arrival.date) : undefined,
            time: Lead.arrival.time ? new Date(Lead.arrival.time) : undefined,
          }
        : undefined,

      course:
        Lead?.course?.map((c) => ({
          name: c.name,
          courseDuration: c.courseDuration,
          courseType: c.courseType,
          startDate: c.startDate ? new Date(c.startDate) : undefined,
          endDate: c.endDate ? new Date(c.endDate) : undefined,
          campus: c.campus ? { ...c.campus } : { name: "", shift: "" },
          courseFee: c.courseFee || "0",
        })) || [],

      services:
        Lead?.services?.map((s) => ({
          _id: s._id.toString(),
          title: s.title,
          serviceType: s.serviceType,
          amount: s.amount || "0",
          description: s.description,
        })) || [],

      note: Lead?.note || "",
      author: isAdmin ? Lead?.author || "" : email || "",
      progress:
        (Lead?.progress as "Open" | "Contacted" | "Converted" | "Closed") ||
        "Open",
      status:
        (Lead?.status as "Perception" | "Cold" | "Warm" | "Hot") ||
        "Perception",
      date: Lead?.date ? new Date(Lead.date) : new Date(),
      isPinned: Lead?.isPinned || false,
      others: Lead?.others || [],
      social: Lead?.social || undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof LeadFormSchema>) => {
    const safeUpload = async (files: File[] | undefined) => {
      if (!files || files.length === 0) return "";
      try {
        const uploaded = await startUpload(files);
        return uploaded?.[0]?.url || "";
      } catch (err) {
        console.error("Upload failed", err);
        return "";
      }
    };

    // Upload files if provided
    const uploadedPassport = await safeUpload(passportFile);
    const uploadedArrival = await safeUpload(arrivalFile);

    const resolveAuthor = () => {
      // Update: preserve unless explicitly changed by admin
      if (type === "Update") {
        if (isAdmin && values.author) return values.author;
        return Lead?.author; // 🔒 preserve existing
      }
    };

    const finalAuthor = resolveAuthor();

    try {
      if (type === "Create") {
        const created = await createLead({
          ...values,
          author: values.author || email,
          passport: {
            ...values.passport,
            file: uploadedPassport || values?.passport?.file,
          },
          arrival: {
            ...values.arrival,
            file: uploadedArrival || values?.arrival?.file,
          },
          course: values.course || [],
          services: values.services?.map((s) => ({
            ...s,
            _id: new Types.ObjectId(s._id),
          })),
          others: values.others || [],
        });

        if (created) {
          await createNotification({
            title: `New lead created for ${values.name}`,
            agency: values.author || email,
            country: values.home.country,
            route: `/leads`,
          });

          await createTrack({
            student: values.email,
            event: `${values.name}'s Lead Created`,
            route: `/leads/${created._id.toString()}`,
            status: "created",
          });

          toast.success("Lead created successfully!");
          router.push("/leads");
        }
      } else if (type === "Update" && LeadId) {
        const updated = await updateLead(LeadId, {
          ...values,
          author: finalAuthor || Lead?.author || email,
          passport: {
            ...(values.passport || {}),
            file: uploadedPassport || values?.passport?.file,
          },
          arrival: {
            ...(values.arrival || {}),
            file: uploadedArrival || values?.arrival?.file,
          },
          course:
            values.course?.map((c) => ({
              ...c,
              startDate: c.startDate ? new Date(c.startDate) : undefined,
              endDate: c.endDate ? new Date(c.endDate) : undefined,
              campus: c.campus || { name: "", shift: "" },
            })) || [],
          services:
            values.services?.map((s) => ({
              ...s,
              _id:
                typeof s._id === "string" ? new Types.ObjectId(s._id) : s._id,
            })) || [],
          date: values.date ? new Date(values.date) : new Date(),
          others: values.others || [],
        });
        if (updated) {
          await createNotification({
            title: `${values.name}'s lead updated!`,
            agency: finalAuthor || Lead?.author || email,
            country: values.home.country,
            route: `/leads`,
          });

          await createTrack({
            student: values.email,
            event: `${values.name}'s Lead Updated`,
            route: `/leads/${updated._id.toString()}`,
            status: "updated",
          });
          toast.success("Lead updated successfully!");
          router.push("/leads");
        }
      }
    } catch (error) {
      console.error("Lead form submission failed", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
        className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4"
      >
        {/* ✅ Personal Information */}
        <h3 className="text-xl font-semibold">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your email" />
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
                  <Input {...field} placeholder="Your number" />
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
                  <Select
                    options={[
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Other", value: "Other" },
                    ]}
                    isSearchable={false}
                    value={
                      field.value
                        ? { label: field.value, value: field.value }
                        : null
                    }
                    onChange={(selected) => field.onChange(selected?.value)}
                    placeholder="Select gender"
                    classNamePrefix="react-select"
                  />
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
                <FormLabel>Marital Status</FormLabel>
                <FormControl>
                  <Select
                    options={[
                      { label: "Single", value: "Single" },
                      { label: "Married", value: "Married" },
                      { label: "Divorced", value: "Divorced" },
                      { label: "Widowed", value: "Widowed" },
                    ]}
                    isSearchable={false}
                    value={
                      field.value
                        ? { label: field.value, value: field.value }
                        : null
                    }
                    onChange={(selected) => field.onChange(selected?.value)}
                    placeholder="Select status"
                    classNamePrefix="react-select"
                  />
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

          {/* Agency (Admin only) */}
          {isAdmin && (
            <FormField
              name="author"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agency</FormLabel>
                  <FormControl>
                    <Select
                      options={agency?.map((a) => ({
                        value: a.email,
                        label: a.name || a.email,
                      }))}
                      value={
                        agency
                          ?.map((a) => ({
                            value: a.email,
                            label: a.name || a.email,
                          }))
                          .find((option) => option.value === field.value) ||
                        null
                      }
                      onChange={(val) => field.onChange(val?.value)}
                      placeholder="Select agency"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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
                    <Select
                      options={countryOptions}
                      isSearchable
                      value={countryOptions.find(
                        (opt) => opt.value === field.value
                      )}
                      onChange={(selected) => field.onChange(selected?.value)}
                      placeholder="Select a country"
                      classNamePrefix="react-select"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* ===== IRISH Address ===== */}
        <section className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
            IRISH Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="irish.address"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your address in Ireland" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="irish.city"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your city in Ireland" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="irish.state"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your state in Ireland" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="irish.zip"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Zip code in Ireland" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="irish.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Select
                      options={countryOptions}
                      isSearchable
                      value={countryOptions.find(
                        (opt) => opt.value === field.value
                      )}
                      onChange={(selected) => field.onChange(selected?.value)}
                      placeholder="Select a country"
                      classNamePrefix="react-select"
                    />
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
                  ?.some((s) => s._id.toString() === service._id.toString());
                return (
                  <div
                    key={service._id.toString()}
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

        {/* ✅ Passport */}
        <h3 className="text-xl font-semibold">Passport</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="passport.visa"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visa Required</FormLabel>
                <FormControl>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="true"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                        className="w-4 h-4"
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="false"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                        className="w-4 h-4"
                      />
                      No
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="passport.number"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passport Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your passport number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passport.country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Select
                    options={countryOptions}
                    isSearchable
                    value={countryOptions.find(
                      (opt) => opt.value === field.value
                    )}
                    onChange={(selected) => field.onChange(selected?.value)}
                    placeholder="Select a country"
                    classNamePrefix="react-select"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="passport.issueDate"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date &&
                      !isNaN(field.value.getTime())
                        ? field.value.toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) => {
                      const dateValue = e.target.value
                        ? new Date(e.target.value)
                        : undefined;
                      field.onChange(dateValue);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="passport.expirationDate"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date &&
                      !isNaN(field.value.getTime())
                        ? field.value.toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) => {
                      const dateValue = e.target.value
                        ? new Date(e.target.value)
                        : undefined;
                      field.onChange(dateValue);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passport.file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passport</FormLabel>
                <FormControl>
                  <FileUploader
                    onFieldChange={field.onChange}
                    fileUrl={field.value || ""}
                    setFiles={setPassportFile}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ✅ Arrival */}
        <h3 className="text-xl font-semibold">Arrival</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {" "}
          <FormField
            name="arrival.flight"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Flight Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your flight number" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="arrival.date"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date &&
                      !isNaN(field.value.getTime())
                        ? field.value.toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) => {
                      const dateValue = e.target.value
                        ? new Date(e.target.value)
                        : undefined;
                      field.onChange(dateValue);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="arrival.time"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    value={new Date(field.value || new Date())
                      .toISOString()
                      .slice(11, 16)}
                    onChange={(e) => {
                      const d = new Date();
                      const [h, m] = e.target.value.split(":");
                      d.setHours(+h);
                      d.setMinutes(+m);
                      field.onChange(d);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="arrival.file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arrival File</FormLabel>
                <FormControl>
                  <FileUploader
                    onFieldChange={field.onChange}
                    fileUrl={field.value || ""}
                    setFiles={setArrivalFile}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ✅ SECTION 6: Additional Documents (Others) */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Additional Documents</h3>
          {form.watch("others")?.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-4 items-center border p-4 rounded-md bg-muted/40"
            >
              {/* File Name */}
              <FormField
                control={form.control}
                name={`others.${index}.fileName`}
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
                name={`others.${index}.fileUrl`}
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
                  const current = form.getValues("others") || [];
                  const updated = [
                    ...current.slice(0, index),
                    ...current.slice(index + 1),
                  ];
                  form.setValue("others", updated);
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
              const current = form.getValues("others") || [];
              form.setValue("others", [
                ...current,
                { fileName: "", fileUrl: "" },
              ]);
            }}
          >
            Add Document
          </Button>
        </div>

        {/* ✅ Social Links */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="social.facebook"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Facebook profile link" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="social.instagram"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Instagram profile link" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="social.twitter"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Twitter profile link" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="social.skype"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skype</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Skype username or link" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ✅ Submit */}
        <Button
          type="submit"
          className="w-full col-span-2 rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default LeadForm;
