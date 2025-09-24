"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Course from "../database/models/course.model";
import { CourseParams } from "@/types";

// ====== CREATE COURSE
export const createCourse = async (params: CourseParams) => {
  try {
    await connectToDatabase();
    const newCourse = await Course.create(params);
    return JSON.parse(JSON.stringify(newCourse));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL COURSES
export const getAllCourses = async () => {
  try {
    await connectToDatabase();
    const courses = await Course.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET COURSE BY ID
export const getCourseById = async (id: string) => {
  try {
    await connectToDatabase();
    const course = await Course.findById(id).lean();

    if (!course) {
      throw new Error("Course not found");
    }

    return JSON.parse(JSON.stringify(course));
  } catch (error) {
    handleError(error);
  }
};

// ====== UPDATE COURSE
export const updateCourse = async (
  courseId: string,
  updateData: Partial<CourseParams>
) => {
  try {
    await connectToDatabase();

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) {
      throw new Error("Course not found");
    }

    return JSON.parse(JSON.stringify(updatedCourse));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE COURSE
export const deleteCourse = async (courseId: string) => {
  try {
    await connectToDatabase();

    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      throw new Error("Course not found");
    }

    return { message: "Course deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};