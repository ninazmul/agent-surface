"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
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

// ========= ZOD SCHEMA =========
const CourseFormSchema = z.object({
  name: z.string().min(3, "Course name must be at least 3 characters."),
  campuses: z
    .array(
      z.object({
        campus: z.string().min(2, "Campus name is required"),
        shifts: z.object({
          morning: z
            .number({
              required_error: "Morning shift seats required",
              invalid_type_error: "Must be a number",
            })
            .min(1, "At least 1 morning seat"),
          afternoon: z
            .number({
              required_error: "Afternoon shift seats required",
              invalid_type_error: "Must be a number",
            })
            .min(1, "At least 1 afternoon seat"),
        }),
      })
    )
    .min(1, "At least one campus is required"),
  courseDuration: z.string().min(1, "Course duration is required"),
  courseType: z.enum(["Full Time", "Part Time"], {
    errorMap: () => ({ message: "Course type is required" }),
  }),
  courseFee: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
});

// ========= COMPONENT PROPS =========
type CourseFormProps = {
  type: "Create" | "Update";
  Course?: ICourse;
  CourseId?: string;
};

// ========= COMPONENT =========
const CourseForm = ({ type, Course, CourseId }: CourseFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof CourseFormSchema>>({
    resolver: zodResolver(CourseFormSchema),
    defaultValues: {
      name: Course?.name || "",
      campuses: Course?.campuses || [
        { campus: "", shifts: { morning: 1, afternoon: 1 } },
      ],
      courseDuration: Course?.courseDuration || "",
      courseType:
        (Course?.courseType as "Full Time" | "Part Time") || "Full Time",
      courseFee: Course?.courseFee || "",
      startDate: Course?.startDate ? new Date(Course.startDate) : new Date(),
      endDate: Course?.endDate ? new Date(Course.endDate) : new Date(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "campuses",
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
          router.push("/courses");
        }
      } else if (type === "Update" && CourseId) {
        const updated = await updateCourse(CourseId, values);
        if (updated) {
          router.push("/courses");
          toast.success("Course updated successfully!");
        }
      }
    } catch (error) {
      console.error("Course form submission failed", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-2xl bg-orange-50 dark:bg-gray-800 p-6 shadow-sm"
      >
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-orange-800 dark:text-gray-100">
            Course Details
          </h2>
        </div>

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

        {/* Campuses */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Campuses</h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-4 border p-4 rounded-md bg-orange-50 dark:bg-gray-800"
            >
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`campuses.${index}.shifts.morning`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Morning Shift Seats</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Morning shift"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value || "0"))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`campuses.${index}.shifts.afternoon`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Afternoon Shift Seats</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Afternoon shift"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value || "0"))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              append({ campus: "", shifts: { morning: 1, afternoon: 1 } })
            }
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
                <Input placeholder="e.g., 6 weeks" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course type" />
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

        {/* Course Fee */}
        <FormField
          control={form.control}
          name="courseFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Fee</FormLabel>
              <FormControl>
                <Input placeholder="Enter course fee" {...field} />
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
                  value={field.value?.toISOString().split("T")[0]}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
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
                  value={field.value?.toISOString().split("T")[0]}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-2xl"
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : type === "Create"
            ? "Create Course"
            : "Update Course"}
        </Button>
      </form>
    </Form>
  );
};

export default CourseForm;
