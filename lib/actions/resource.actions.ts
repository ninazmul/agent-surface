"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Resource from "../database/models/resource.model";
import { ResourceParams } from "@/types";

// ====== CREATE RESOURCE
export const createResource = async (params: ResourceParams) => {
  try {
    await connectToDatabase();

    const newResource = await Resource.create(params);

    return JSON.parse(JSON.stringify(newResource));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL RESOURCES
export const getAllResources = async () => {
  try {
    await connectToDatabase();

    const resources = await Resource.find().sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(resources));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET RESOURCE BY ID
export const getResourceById = async (resourceId: string) => {
  try {
    await connectToDatabase();

    const resource = await Resource.findById(resourceId).lean();

    if (!resource) {
      throw new Error("Resource not found");
    }

    return JSON.parse(JSON.stringify(resource));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET RESOURCES BY EMAIL
export const getResourcesByEmail = async (email: string) => {

  try {
    await connectToDatabase();

    const resources = await Resource.find({ email }).lean();

    if (!resources || resources.length === 0) {
      console.log(`No resources found for email: ${email}`);
      return null;
    }

    return JSON.parse(JSON.stringify(resources));
  } catch (error) {
    console.error("Error fetching resources by email:", error);
    handleError(error);
  }
};

// ====== UPDATE RESOURCE
export const updateResource = async (
  resourceId: string,
  updateData: Partial<ResourceParams>
) => {
  try {
    await connectToDatabase();

    const updatedResource = await Resource.findByIdAndUpdate(
      resourceId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedResource) {
      throw new Error("Resource not found");
    }

    return JSON.parse(JSON.stringify(updatedResource));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE RESOURCE
export const deleteResource = async (resourceId: string) => {
  try {
    await connectToDatabase();

    const deletedResource = await Resource.findByIdAndDelete(
      resourceId
    );

    if (!deletedResource) {
      throw new Error("Resource not found");
    }

    return { message: "Resource deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};

