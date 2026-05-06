"use server";

import { revalidatePath } from "next/cache";

import { CourseParams } from "@/types";
import { connectToDatabase } from "../database";
import Course, {
  ICourseByCountrySafe,
  ICourseSafe,
  IShiftAvailability,
} from "../database/models/course.model";
import { handleError } from "../utils";

const serialize = <T>(data: unknown): T => {
  return JSON.parse(JSON.stringify(data)) as T;
};

export const createCourse = async (
  params: CourseParams,
): Promise<ICourseSafe | null> => {
  try {
    await connectToDatabase();

    const newCourse = await Course.create(params);

    revalidatePath("/courses");

    return serialize<ICourseSafe>(newCourse);
  } catch (error) {
    handleError(error);
    return null;
  }
};

export const getAllCourses = async (): Promise<ICourseSafe[]> => {
  try {
    await connectToDatabase();

    const courses = await Course.find().sort({ createdAt: -1 }).lean();

    return serialize<ICourseSafe[]>(courses);
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const getCourseById = async (
  id: string,
): Promise<ICourseSafe | null> => {
  try {
    await connectToDatabase();

    const course = await Course.findById(id).lean();

    if (!course) throw new Error("Course not found");

    return serialize<ICourseSafe>(course);
  } catch (error) {
    handleError(error);
    return null;
  }
};

export const getCoursesByCountry = async (
  userCountry?: string,
): Promise<ICourseByCountrySafe[]> => {
  try {
    await connectToDatabase();

    const courses = serialize<ICourseSafe[]>(
      await Course.find().sort({ createdAt: -1 }).lean(),
    );

    return courses.map((course) => ({
      ...course,
      campuses: course.campuses.map((campus) => {
        const shifts: ICourseByCountrySafe["campuses"][number]["shifts"] = {};

        (
          Object.keys(campus.shifts || {}) as Array<keyof IShiftAvailability>
        ).forEach((shiftName) => {
          const shiftValue = campus.shifts?.[shiftName];
          if (!shiftValue) return;

          shifts[shiftName] = userCountry
            ? {
                seats: shiftValue.seats,
                fee:
                  shiftValue.fees?.find(
                    (countryFee) => countryFee.country === userCountry,
                  )?.fee ?? null,
              }
            : {
                seats: shiftValue.seats,
                fees: shiftValue.fees ?? [],
              };
        });

        return {
          ...campus,
          shifts,
        };
      }),
    }));
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const updateCourse = async (
  courseId: string,
  updateData: Partial<CourseParams>,
): Promise<ICourseSafe | null> => {
  try {
    await connectToDatabase();

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedCourse) throw new Error("Course not found");

    revalidatePath("/courses");

    return serialize<ICourseSafe>(updatedCourse);
  } catch (error) {
    handleError(error);
    return null;
  }
};

export const deleteCourse = async (
  courseId: string,
): Promise<{ message: string } | null> => {
  try {
    await connectToDatabase();

    const deletedCourse = await Course.findByIdAndDelete(courseId).lean();

    if (!deletedCourse) throw new Error("Course not found");

    revalidatePath("/courses");

    return { message: "Course deleted successfully" };
  } catch (error) {
    handleError(error);
    return null;
  }
};
