"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import StudentResource from "../database/models/student-resource.model";
import { StudentResourceParams } from "@/types";
import { revalidatePath } from "next/cache";

// ====== CREATE StudentRESOURCE
export const createStudentResource = async (params: StudentResourceParams) => {
  try {
    await connectToDatabase();

    const newStudentResource = await StudentResource.create(params);

    revalidatePath("/resources/student");

    return JSON.parse(JSON.stringify(newStudentResource));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL StudentRESOURCES
export const getAllStudentResources = async () => {
  try {
    await connectToDatabase();

    const StudentResources = await StudentResource.find()
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(StudentResources));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET StudentRESOURCE BY ID
export const getStudentResourceById = async (StudentResourceId: string) => {
  try {
    await connectToDatabase();

    const studentResource = await StudentResource.findById(
      StudentResourceId
    ).lean();

    if (!StudentResource) {
      throw new Error("StudentResource not found");
    }

    return JSON.parse(JSON.stringify(studentResource));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET StudentRESOURCES BY EMAIL
export const getStudentResourcesByEmail = async (email: string) => {
  try {
    await connectToDatabase();

    const StudentResources = await StudentResource.find({ email }).lean();

    if (!StudentResources || StudentResources.length === 0) {
      console.log(`No StudentResources found for email: ${email}`);
      return null;
    }

    return JSON.parse(JSON.stringify(StudentResources));
  } catch (error) {
    console.error("Error fetching StudentResources by email:", error);
    handleError(error);
  }
};

// ====== UPDATE StudentRESOURCE
export const updateStudentResource = async (
  StudentResourceId: string,
  updateData: Partial<StudentResourceParams>
) => {
  try {
    await connectToDatabase();

    const updatedStudentResource = await StudentResource.findByIdAndUpdate(
      StudentResourceId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedStudentResource) {
      throw new Error("StudentResource not found");
    }

    revalidatePath("/resources/student");

    return JSON.parse(JSON.stringify(updatedStudentResource));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE StudentRESOURCE
export const deleteStudentResource = async (StudentResourceId: string) => {
  try {
    await connectToDatabase();

    const deletedStudentResource = await StudentResource.findByIdAndDelete(
      StudentResourceId
    );

    if (!deletedStudentResource) {
      throw new Error("StudentResource not found");
    }

    revalidatePath("/resources/student");
    
    return { message: "StudentResource deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
