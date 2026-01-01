"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import { ResourcePriceListParams } from "@/types";
import ResourcePriceList from "../database/models/resource-pricelist.model";
import { revalidatePath } from "next/cache";

// ====== CREATE RESOURCE PRICE LIST
export const createResourcePriceList = async (params: ResourcePriceListParams) => {
  try {
    await connectToDatabase();

    const newResourcePriceList = await ResourcePriceList.create(params);

    revalidatePath("/resources/pricelist");

    return JSON.parse(JSON.stringify(newResourcePriceList));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL RESOURCE PRICE LISTS
export const getAllResourcePriceLists = async () => {
  try {
    await connectToDatabase();

    const resourcePriceLists = await ResourcePriceList.find().sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(resourcePriceLists));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET RESOURCE PRICE LIST BY ID
export const getResourcePriceListById = async (resourcePriceListId: string) => {
  try {
    await connectToDatabase();

    const resourcePriceList = await ResourcePriceList.findById(resourcePriceListId).lean();

    if (!resourcePriceList) {
      throw new Error("ResourcePriceList not found");
    }

    return JSON.parse(JSON.stringify(resourcePriceList));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET RESOURCE PRICE LISTS BY EMAIL
export const getResourcePriceListsByEmail = async (email: string) => {

  try {
    await connectToDatabase();

    const resourcePriceLists = await ResourcePriceList.find({ email }).lean();

    if (!resourcePriceLists || resourcePriceLists.length === 0) {
      console.log(`No resourcePriceLists found for email: ${email}`);
      return null;
    }

    return JSON.parse(JSON.stringify(resourcePriceLists));
  } catch (error) {
    console.error("Error fetching resourcePriceLists by email:", error);
    handleError(error);
  }
};

// ====== UPDATE RESOURCE PRICE LIST
export const updateResourcePriceList = async (
  resourcePriceListId: string,
  updateData: Partial<ResourcePriceListParams>
) => {
  try {
    await connectToDatabase();

    const updatedResourcePriceList = await ResourcePriceList.findByIdAndUpdate(
      resourcePriceListId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedResourcePriceList) {
      throw new Error("ResourcePriceList not found");
    }

    revalidatePath("/resources/pricelist");

    return JSON.parse(JSON.stringify(updatedResourcePriceList));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE RESOURCE PRICE LIST
export const deleteResourcePriceList = async (resourcePriceListId: string) => {
  try {
    await connectToDatabase();

    const deletedResourcePriceList = await ResourcePriceList.findByIdAndDelete(
      resourcePriceListId
    );

    if (!deletedResourcePriceList) {
      throw new Error("ResourcePriceList not found");
    }

    revalidatePath("/resources/pricelist");

    return { message: "ResourcePriceList deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};

