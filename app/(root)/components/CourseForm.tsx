"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import { createCourse, updateCourse } from "@/lib/actions/course.actions";
import { ICourse } from "@/lib/database/models/course.model";
import toast from "react-hot-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/* ================= ZOD SCHEMA ================= */
const CourseFormSchema = z.object({
  name: z.string().min(3, "Course name must be at least 3 characters."),
  description: z.string().optional(),
  campuses: z
    .array(
      z.object({
        campus: z.string().min(2, "Campus name is required"),
        shifts: z
          .object({
            morning: z
              .object({
                seats: z.number().int().nonnegative("Seats cannot be negative"),
                fee: z
                  .string()
                  .optional()
                  .refine(
                    (val) => !val || /^[0-9]+$/.test(val),
                    "Fee must be a positive number",
                  ),
              })
              .optional(),
            afternoon: z
              .object({
                seats: z.number().int().nonnegative("Seats cannot be negative"),
                fee: z
                  .string()
                  .optional()
                  .refine(
                    (val) => !val || /^[0-9]+$/.test(val),
                    "Fee must be a positive number",
                  ),
              })
              .optional(),
            general: z
              .object({
                seats: z.number().int().nonnegative("Seats cannot be negative"),
                fee: z
                  .string()
                  .optional()
                  .refine(
                    (val) => !val || /^[0-9]+$/.test(val),
                    "Fee must be a positive number",
                  ),
              })
              .optional(),
          })
          .refine(
            (shifts) => shifts?.morning || shifts?.afternoon || shifts?.general,
            "At least one shift is required",
          ),
      }),
    )
    .min(1, "At least one campus is required"),
  courseDuration: z.string().min(1, "Course duration is required"),
  courseType: z.enum(["Full Time", "Part Time"]).optional(), // optional now
  startDate: z.date().optional(), // optional now
  endDate: z.date().optional(), // optional now
});

/* ================= PROPS ================= */
type CourseFormProps = {
  type: "Create" | "Update";
  Course?: ICourse;
  CourseId?: string;
  onSuccess?: () => void;
};

/* ================= COMPONENT ================= */
const CourseForm = ({ type, Course, CourseId, onSuccess }: CourseFormProps) => {
  const form = useForm<z.infer<typeof CourseFormSchema>>({
    resolver: zodResolver(CourseFormSchema),
    defaultValues: {
      name: Course?.name || "",
      description: Course?.description || "",
      campuses: Course?.campuses?.map((c) => ({
        campus: c.campus,
        shifts: c.shifts || {},
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

  const onSubmit = async (values: z.infer<typeof CourseFormSchema>) => {
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
      } else if (type === "Update" && CourseId) {
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

  /* ================= HELPER ================= */
  const handleNumberInput = (value: string) => {
    // Prevent negative numbers
    if (!value) return undefined;
    const num = Number(value.replace(/[^0-9]/g, ""));
    return num >= 0 ? num : 0;
  };

  const handleFeeInput = (value: string) => {
    // Prevent negative fee
    return value.startsWith("-") ? "" : value;
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm space-y-4"
        >
          <h2 className="text-xl font-semibold">Course Details</h2>

          {/* Course Name */}
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

          {/* Description */}
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

          {/* Campuses */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Campuses</h3>
            {fields.map((field, index) => {
              const campusShifts = watchedCampuses[index]?.shifts || {};

              return (
                <div
                  key={field.id}
                  className="space-y-4 border p-4 rounded-xl bg-orange-50 dark:bg-gray-900"
                >
                  {/* Campus Name */}
                  <FormField
                    control={form.control}
                    name={`campuses.${index}.campus`}
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

                  {/* Shifts */}
                  <div className="space-y-4">
                    {/* Morning Shift */}
                    {campusShifts.morning && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`campuses.${index}.shifts.morning.seats`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Morning Seats</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      handleNumberInput(e.target.value),
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
                          name={`campuses.${index}.shifts.morning.fee`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Morning Fee</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter morning fee €"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      handleFeeInput(e.target.value),
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Afternoon Shift */}
                    {campusShifts.afternoon && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`campuses.${index}.shifts.afternoon.seats`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Afternoon Seats</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      handleNumberInput(e.target.value),
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
                          name={`campuses.${index}.shifts.afternoon.fee`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Afternoon Fee</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter afternoon fee €"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      handleFeeInput(e.target.value),
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* General Shift */}
                    {campusShifts.general && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`campuses.${index}.shifts.general.seats`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>General Seats</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      handleNumberInput(e.target.value),
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
                          name={`campuses.${index}.shifts.general.fee`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>General Fee</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter General fee €"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      handleFeeInput(e.target.value),
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Add Shift Buttons */}
                    <div className="flex gap-2">
                      {!campusShifts.morning && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            const currentShifts =
                              form.getValues(`campuses.${index}.shifts`) || {};
                            form.setValue(`campuses.${index}.shifts`, {
                              ...currentShifts,
                              morning: { seats: 0, fee: "" },
                            });
                          }}
                        >
                          + Add Morning Shift
                        </Button>
                      )}
                      {!campusShifts.afternoon && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            const currentShifts =
                              form.getValues(`campuses.${index}.shifts`) || {};
                            form.setValue(`campuses.${index}.shifts`, {
                              ...currentShifts,
                              afternoon: { seats: 0, fee: "" },
                            });
                          }}
                        >
                          + Add Afternoon Shift
                        </Button>
                      )}
                      {!campusShifts.general && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            const currentShifts =
                              form.getValues(`campuses.${index}.shifts`) || {};
                            form.setValue(`campuses.${index}.shifts`, {
                              ...currentShifts,
                              general: { seats: 0, fee: "" },
                            });
                          }}
                        >
                          + Add General Shift
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Remove Campus */}
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
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

          {/* Course Duration */}
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

          {/* Course Type */}
          <FormField
            control={form.control}
            name="courseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course type (optional)" />
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

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
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
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
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
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Submit */}
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
