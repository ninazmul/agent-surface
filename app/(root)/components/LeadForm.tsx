"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Select from "react-select";
import countries from "world-countries";
import { Info } from "lucide-react";
import toast from "react-hot-toast";
import { Types } from "mongoose";

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

import { createLead, updateLead } from "@/lib/actions/lead.actions";
import { createNotification } from "@/lib/actions/notification.actions";
import { createTrack } from "@/lib/actions/track.actions";
import { useUploadThing } from "@/lib/uploadthing";
import { courseKey, normalizeCourses } from "@/lib/utils";

import type { ILead } from "@/lib/database/models/lead.model";
import type { IProfile } from "@/lib/database/models/profile.model";
import type { ICourseByCountrySafe } from "@/lib/database/models/course.model";
import type { IServices } from "@/lib/database/models/service.model";

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
      }),
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

type LeadFormValues = z.infer<typeof LeadFormSchema>;

type LeadFormProps = {
  type: "Create" | "Update";
  Lead?: ILead;
  LeadId?: string;
  agency?: IProfile[];
  courses?: ICourseByCountrySafe[];
  services?: IServices[];
  isAdmin?: boolean;
  email: string;
  country?: string;
  onSuccess?: () => void;
};

const LeadForm = ({
  type,
  Lead,
  LeadId,
  agency,
  isAdmin,
  email,
  country,
  courses,
  services,
  onSuccess,
}: LeadFormProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { startUpload } = useUploadThing("mediaUploader");

  const [passportFile, setPassportFile] = useState<File[]>([]);
  const [arrivalFile, setArrivalFile] = useState<File[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const previousAgencyCountryRef = useRef<string | undefined>(undefined);

  const countryOptions = useMemo(
    () =>
      countries.map((item) => ({
        label: `${item.flag} ${item.name.common}`,
        value: item.name.common,
      })),
    [],
  );

  const form = useForm<LeadFormValues>({
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
        country: !isAdmin ? country || "" : "",
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
          _id: c._id,
          name: c.name,
          courseType: c.courseType || "General",
          courseDuration: c.courseDuration,
          startDate: c.startDate ? new Date(c.startDate) : undefined,
          endDate: c.endDate ? new Date(c.endDate) : undefined,
          campus: {
            name: c.campus!.name,
            shift: c.campus!.shift as "morning" | "afternoon" | "general",
          },
          courseFee: c.courseFee,
        })) || [],
      services:
        Lead?.services?.map((s) => ({
          _id: s._id,
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

  const selectedAuthor = useWatch({
    control: form.control,
    name: "author",
  });

  const selectedCourses =
    useWatch({
      control: form.control,
      name: "course",
    }) ?? [];

  const selectedAgencyCountry = useMemo(() => {
    if (!isAdmin) return country;

    return agency?.find((item) => item.email === selectedAuthor)?.country;
  }, [agency, country, isAdmin, selectedAuthor]);

  const selectableCourses = useMemo(
    () => (courses ? normalizeCourses(courses, selectedAgencyCountry) : []),
    [courses, selectedAgencyCountry],
  );

  useEffect(() => {
    if (!selectedAgencyCountry) return;

    form.setValue("home.country", selectedAgencyCountry, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (
      previousAgencyCountryRef.current &&
      previousAgencyCountryRef.current !== selectedAgencyCountry
    ) {
      form.setValue("course", [], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    previousAgencyCountryRef.current = selectedAgencyCountry;
  }, [form, selectedAgencyCountry]);

  const onSubmit = async (values: LeadFormValues) => {
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

    const uploadedPassport = await safeUpload(passportFile);
    const uploadedArrival = await safeUpload(arrivalFile);

    const leadCountry = !isAdmin
      ? country || values.home.country
      : selectedAgencyCountry || values.home.country;

    const leadValues = {
      ...values,
      home: {
        ...values.home,
        country: leadCountry,
      },
    };

    const resolveAuthor = () => {
      if (type === "Update") {
        if (isAdmin && values.author) return values.author;
        return Lead?.author;
      }

      return values.author || email;
    };

    const finalAuthor = resolveAuthor();

    try {
      if (type === "Create") {
        const created = await createLead({
          ...leadValues,
          author: finalAuthor || email,
          passport: {
            ...leadValues.passport,
            file: uploadedPassport || leadValues.passport?.file,
          },
          arrival: {
            ...leadValues.arrival,
            file: uploadedArrival || leadValues.arrival?.file,
          },
          course: leadValues.course?.map((c) => ({
            _id: c._id,
            name: c.name,
            courseType: c.courseType,
            courseDuration: c.courseDuration,
            startDate: c.startDate,
            endDate: c.endDate,
            campus: c.campus,
            courseFee: c.courseFee,
          })),
          services: leadValues.services?.map((s) => ({
            ...s,
            _id: new Types.ObjectId(s._id),
          })),
          others: leadValues.others || [],
        });

        if (created) {
          await createNotification({
            title: `New lead created for ${leadValues.name}`,
            agency: finalAuthor || email,
            country: leadCountry,
            route: "/leads",
          });

          await createTrack({
            student: leadValues.email,
            event: `${leadValues.name}'s Lead Created`,
            route: `/leads/${created._id.toString()}`,
            status: "created",
          });

          toast.success("Lead created successfully!");
          router.refresh();
          if (onSuccess) {
            onSuccess();
          } else {
            if (pathname.startsWith("/lead")) {
              router.push("/profile");
            } else {
              router.push("/leads");
            }
          }
        }
      }

      if (type === "Update" && LeadId) {
        const updated = await updateLead(LeadId, {
          ...leadValues,
          author: finalAuthor || Lead?.author || email,
          passport: {
            ...(leadValues.passport || {}),
            file: uploadedPassport || leadValues.passport?.file,
          },
          arrival: {
            ...(leadValues.arrival || {}),
            file: uploadedArrival || leadValues.arrival?.file,
          },
          course: leadValues.course?.map((c) => ({
            _id: c._id,
            name: c.name,
            courseType: c.courseType,
            courseDuration: c.courseDuration,
            startDate: c.startDate,
            endDate: c.endDate,
            campus: c.campus,
            courseFee: c.courseFee,
          })),
          services:
            leadValues.services?.map((s) => ({
              ...s,
              _id:
                typeof s._id === "string" ? new Types.ObjectId(s._id) : s._id,
            })) || [],
          date: leadValues.date ? new Date(leadValues.date) : new Date(),
          others: leadValues.others || [],
        });

        if (updated) {
          await createNotification({
            title: `${leadValues.name}'s lead updated!`,
            agency: finalAuthor || Lead?.author || email,
            country: leadCountry,
            route: "/leads",
          });

          await createTrack({
            student: leadValues.email,
            event: `${leadValues.name}'s Lead Updated`,
            route: `/leads/${updated._id.toString()}`,
            status: "updated",
          });

          toast.success("Lead updated successfully!");
          router.refresh();
          if (onSuccess) {
            onSuccess();
          } else {
            if (pathname.startsWith("/lead")) {
              router.push("/profile");
            } else {
              router.push("/leads");
            }
          }
        }
      }
    } catch (error) {
      console.error("Lead form submission failed", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <Form {...form}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit(onSubmit)(event);
          }}
          className="w-full min-w-0 rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm space-y-4"
        >
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
                <FormItem className="min-w-0">
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
                <FormItem className="min-w-0">
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
                        !Number.isNaN(field.value.getTime())
                          ? field.value.toISOString().slice(0, 10)
                          : ""
                      }
                      onChange={(event) => {
                        field.onChange(
                          event.target.value
                            ? new Date(event.target.value)
                            : undefined,
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAdmin && (
              <FormField
                name="author"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Agency</FormLabel>
                    <FormControl>
                      <Select
                        options={agency?.map((item) => ({
                          value: item.email,
                          label: item.name || item.email,
                        }))}
                        value={
                          agency
                            ?.map((item) => ({
                              value: item.email,
                              label: item.name || item.email,
                            }))
                            .find((option) => option.value === field.value) ||
                          null
                        }
                        onChange={(selected) => {
                          field.onChange(selected?.value);

                          const selectedAgency = agency?.find(
                            (item) => item.email === selected?.value,
                          );

                          form.setValue("course", [], {
                            shouldDirty: true,
                            shouldValidate: true,
                          });

                          if (selectedAgency?.country) {
                            form.setValue(
                              "home.country",
                              selectedAgency.country,
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            );
                          }
                        }}
                        placeholder="Select agency"
                        classNamePrefix="react-select"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

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
                  <FormItem className="min-w-0">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Select
                        options={countryOptions}
                        isSearchable
                        isDisabled={!isAdmin && !!country}
                        value={
                          countryOptions.find(
                            (option) => option.value === field.value,
                          ) || null
                        }
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

          <section className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
              IRISH Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["address", "city", "state", "zip"] as const).map(
                (fieldName) => (
                  <FormField
                    key={fieldName}
                    name={`irish.${fieldName}`}
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
                                ? "Zip code in Ireland"
                                : `Your ${fieldName} in Ireland`
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ),
              )}

              <FormField
                control={form.control}
                name="irish.country"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Select
                        options={countryOptions}
                        isSearchable
                        value={
                          countryOptions.find(
                            (option) => option.value === field.value,
                          ) || null
                        }
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

          <section className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm space-y-6">
            <h3 className="text-xl font-semibold">Courses & Services</h3>

            <div>
              <h4 className="font-semibold mb-2">Courses</h4>

              {isAdmin && !selectedAgencyCountry ? (
                <p className="text-sm text-muted-foreground">
                  Select an agency first to show courses with the correct
                  country fee.
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
                        className={`relative flex-shrink-0 rounded-2xl border p-4 shadow-sm w-[260px] transition-all duration-200 bg-white dark:bg-gray-900 ${
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

                          {selectedAgencyCountry && (
                            <p className="text-xs text-gray-500">
                              Fee country: {selectedAgencyCountry}
                            </p>
                          )}
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
                                        course.campus.shift
                                    ),
                                ),
                                {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                },
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
                              {
                                shouldValidate: true,
                                shouldDirty: true,
                              },
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
                  const isSelected = form
                    .watch("services")
                    ?.some(
                      (s) =>
                        s._id && s._id.toString() === service._id?.toString(),
                    );

                  const key = `service-${service._id}`;
                  const isExpanded = expandedItem === key;

                  return (
                    <div
                      key={service._id.toString()}
                      className={`relative flex-shrink-0 rounded-2xl border p-4 shadow-sm w-[260px] transition-all duration-200 bg-white dark:bg-gray-900 ${
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

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-1">
                          {service.description && <p>{service.description}</p>}
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
                                (s) =>
                                  s._id.toString() !== service._id.toString(),
                              ),
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
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
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            },
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
                <FormItem className="min-w-0">
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Select
                      options={countryOptions}
                      isSearchable
                      value={
                        countryOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
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
                        !Number.isNaN(field.value.getTime())
                          ? field.value.toISOString().slice(0, 10)
                          : ""
                      }
                      onChange={(event) => {
                        field.onChange(
                          event.target.value
                            ? new Date(event.target.value)
                            : undefined,
                        );
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
                        !Number.isNaN(field.value.getTime())
                          ? field.value.toISOString().slice(0, 10)
                          : ""
                      }
                      onChange={(event) => {
                        field.onChange(
                          event.target.value
                            ? new Date(event.target.value)
                            : undefined,
                        );
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

          <h3 className="text-xl font-semibold">Arrival</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        !Number.isNaN(field.value.getTime())
                          ? field.value.toISOString().slice(0, 10)
                          : ""
                      }
                      onChange={(event) => {
                        field.onChange(
                          event.target.value
                            ? new Date(event.target.value)
                            : undefined,
                        );
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
                      value={
                        field.value instanceof Date &&
                        !Number.isNaN(field.value.getTime())
                          ? field.value.toISOString().slice(11, 16)
                          : ""
                      }
                      onChange={(event) => {
                        if (!event.target.value) {
                          field.onChange(undefined);
                          return;
                        }

                        const date = new Date();
                        const [hours, minutes] = event.target.value.split(":");
                        date.setHours(Number(hours));
                        date.setMinutes(Number(minutes));
                        field.onChange(date);
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

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Additional Documents</h3>

            {form.watch("others")?.map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-4 items-center border p-4 rounded-md bg-muted/40"
              >
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
                            files?: File[],
                          ) => {
                            if (files && files.length > 0) {
                              const uploaded = await startUpload(files);
                              if (uploaded?.[0]) {
                                field.onChange(uploaded[0].url);
                              }
                              return;
                            }

                            field.onChange(fileUrl);
                          }}
                          fileUrl={field.value || ""}
                          setFiles={() => {}}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    const current = form.getValues("others") || [];
                    form.setValue(
                      "others",
                      [...current.slice(0, index), ...current.slice(index + 1)],
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    );
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const current = form.getValues("others") || [];
                form.setValue(
                  "others",
                  [...current, { fileName: "", fileUrl: "" }],
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                );
              }}
            >
              Add Document
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Social Links</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["facebook", "instagram", "twitter", "skype"] as const).map(
                (fieldName) => (
                  <FormField
                    key={fieldName}
                    name={`social.${fieldName}`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {fieldName.charAt(0).toUpperCase() +
                            fieldName.slice(1)}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              fieldName === "skype"
                                ? "Skype username or link"
                                : `${fieldName} profile link`
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
          </div>

          <Button
            type="submit"
            className="w-full col-span-2 rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LeadForm;
