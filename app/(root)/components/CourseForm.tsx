"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { createCourse, updateCourse } from "@/lib/actions/course.actions";
import type {
  ICourseSafe,
  IShiftAvailability,
} from "@/lib/database/models/course.model";

const CountryFeeSchema = z.object({
  country: z.string().min(2, "Country is required"),
  fee: z
    .string()
    .min(1, "Fee is required")
    .regex(/^[0-9]+$/, "Fee must be a positive number"),
});

const ShiftSchema = z.object({
  seats: z.number().int().nonnegative("Seats cannot be negative"),
  fees: z.array(CountryFeeSchema).optional().default([]),
});

const CourseFormSchema = z.object({
  name: z.string().min(3, "Course name must be at least 3 characters."),
  description: z.string().optional(),
  campuses: z
    .array(
      z.object({
        campus: z.string().min(2, "Campus name is required"),
        shifts: z
          .object({
            morning: ShiftSchema.optional(),
            afternoon: ShiftSchema.optional(),
            general: ShiftSchema.optional(),
          })
          .refine(
            (shifts) => shifts.morning || shifts.afternoon || shifts.general,
            "At least one shift is required",
          ),
      }),
    )
    .min(1, "At least one campus is required"),
  courseDuration: z.string().min(1, "Course duration is required"),
  courseType: z.enum(["Full Time", "Part Time"]).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

type CourseFormValues = z.infer<typeof CourseFormSchema>;
type ShiftName = keyof IShiftAvailability;

type CourseFormProps = {
  type: "Create" | "Update";
  Course?: ICourseSafe;
  CourseId?: string;
  onSuccess?: () => void;
};

const shiftLabels: Record<ShiftName, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  general: "General",
};

const shiftNames: ShiftName[] = ["morning", "afternoon", "general"];

const CourseForm = ({ type, Course, CourseId, onSuccess }: CourseFormProps) => {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(CourseFormSchema),
    defaultValues: {
      name: Course?.name || "",
      description: Course?.description || "",
      campuses: Course?.campuses?.map((campus) => ({
        campus: campus.campus,
        shifts: campus.shifts || {},
      })) || [{ campus: "", shifts: {} }],
      courseDuration: Course?.courseDuration || "",
      courseType: Course?.courseType as "Full Time" | "Part Time" | undefined,
      startDate: Course?.startDate ? new Date(Course.startDate) : undefined,
      endDate: Course?.endDate ? new Date(Course.endDate) : undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "campuses",
  });

  const watchedCampuses = useWatch({
    control: form.control,
    name: "campuses",
    defaultValue: form.getValues("campuses"),
  });

  const handleNumberInput = (value: string) => {
    if (!value) return 0;
    return Number(value.replace(/[^0-9]/g, ""));
  };

  const handleFeeInput = (value: string) => {
    return value.replace(/[^0-9]/g, "");
  };

  const addShift = (campusIndex: number, shiftName: ShiftName) => {
    const currentShifts =
      form.getValues(`campuses.${campusIndex}.shifts`) || {};

    form.setValue(
      `campuses.${campusIndex}.shifts`,
      {
        ...currentShifts,
        [shiftName]: {
          seats: 0,
          fees: [{ country: "", fee: "" }],
        },
      },
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const removeShift = (campusIndex: number, shiftName: ShiftName) => {
    const currentShifts =
      form.getValues(`campuses.${campusIndex}.shifts`) || {};
    const nextShifts = { ...currentShifts };

    delete nextShifts[shiftName];

    form.setValue(`campuses.${campusIndex}.shifts`, nextShifts, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const addCountryFee = (campusIndex: number, shiftName: ShiftName) => {
    const currentFees =
      form.getValues(`campuses.${campusIndex}.shifts.${shiftName}.fees`) || [];

    form.setValue(
      `campuses.${campusIndex}.shifts.${shiftName}.fees`,
      [...currentFees, { country: "", fee: "" }],
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const removeCountryFee = (
    campusIndex: number,
    shiftName: ShiftName,
    feeIndex: number,
  ) => {
    const currentFees =
      form.getValues(`campuses.${campusIndex}.shifts.${shiftName}.fees`) || [];

    form.setValue(
      `campuses.${campusIndex}.shifts.${shiftName}.fees`,
      currentFees.filter((_, index) => index !== feeIndex),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const onSubmit = async (values: CourseFormValues) => {
    try {
      if (type === "Create") {
        const created = await createCourse({
          ...values,
          createdAt: new Date(),
        });

        if (created) {
          form.reset();
          toast.success("Course added successfully!");
          onSuccess?.();
        }
      }

      if (type === "Update" && CourseId) {
        const updated = await updateCourse(CourseId, values);

        if (updated) {
          toast.success("Course updated successfully!");
          onSuccess?.();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm space-y-4"
        >
          <h2 className="text-xl font-semibold">Course Details</h2>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter course name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter course description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Campuses</h3>

            {fields.map((field, campusIndex) => {
              const campusShifts = watchedCampuses?.[campusIndex]?.shifts || {};

              return (
                <div
                  key={field.id}
                  className="space-y-4 border p-4 rounded-xl bg-orange-50 dark:bg-gray-900"
                >
                  <FormField
                    control={form.control}
                    name={`campuses.${campusIndex}.campus`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campus Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter campus name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {shiftNames.map((shiftName) => {
                    const shift = campusShifts[shiftName];
                    if (!shift) return null;

                    return (
                      <div
                        key={shiftName}
                        className="space-y-3 rounded-lg border bg-white p-4 dark:bg-gray-800"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-medium">
                            {shiftLabels[shiftName]} Shift
                          </h4>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeShift(campusIndex, shiftName)}
                          >
                            Remove Shift
                          </Button>
                        </div>

                        <FormField
                          control={form.control}
                          name={`campuses.${campusIndex}.shifts.${shiftName}.seats`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {shiftLabels[shiftName]} Seats
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  value={field.value ?? 0}
                                  onChange={(event) =>
                                    field.onChange(
                                      handleNumberInput(event.target.value),
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3">
                          <FormLabel>Country Fees</FormLabel>

                          {(shift.fees || []).map((_, feeIndex) => (
                            <div
                              key={feeIndex}
                              className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]"
                            >
                              <FormField
                                control={form.control}
                                name={`campuses.${campusIndex}.shifts.${shiftName}.fees.${feeIndex}.country`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="Country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`campuses.${campusIndex}.shifts.${shiftName}.fees.${feeIndex}.fee`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder="Fee"
                                        value={field.value ?? ""}
                                        onChange={(event) =>
                                          field.onChange(
                                            handleFeeInput(event.target.value),
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() =>
                                  removeCountryFee(
                                    campusIndex,
                                    shiftName,
                                    feeIndex,
                                  )
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ))}

                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              addCountryFee(campusIndex, shiftName)
                            }
                          >
                            + Add Country Fee
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex flex-wrap gap-2">
                    {shiftNames.map((shiftName) =>
                      !campusShifts[shiftName] ? (
                        <Button
                          key={shiftName}
                          type="button"
                          variant="secondary"
                          onClick={() => addShift(campusIndex, shiftName)}
                        >
                          + Add {shiftLabels[shiftName]} Shift
                        </Button>
                      ) : null,
                    )}
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(campusIndex)}
                    >
                      Remove Campus
                    </Button>
                  )}
                </div>
              );
            })}

            <Button
              type="button"
              variant="secondary"
              onClick={() => append({ campus: "", shifts: {} })}
            >
              + Add Campus
            </Button>
          </div>

          <FormField
            control={form.control}
            name="courseDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Duration</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 6 weeks" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course type optional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Full Time">Full Time</SelectItem>
                    <SelectItem value="Part Time">Part Time</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        field.value
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
                        field.value
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
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-xl bg-black text-white hover:bg-gray-700"
          >
            {form.formState.isSubmitting
              ? "Submitting..."
              : type === "Create"
                ? "Create Course"
                : "Update Course"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CourseForm;
