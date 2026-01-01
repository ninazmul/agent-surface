"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import MarketingResource from "../database/models/marketing-resource.model";
import { MarketingResourceParams } from "@/types";
import { revalidatePath } from "next/cache";

// ====== CREATE MARKETING RESOURCE
export const createMarketingResource = async (params: MarketingResourceParams) => {
  try {
    await connectToDatabase();

    const newMarketingResource = await MarketingResource.create(params);

    revalidatePath("/resources/marketing");

    return JSON.parse(JSON.stringify(newMarketingResource));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL MARKETING RESOURCES
export const getAllMarketingResources = async () => {
  try {
    await connectToDatabase();

    const marketingResources = await MarketingResource.find()
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(marketingResources));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET MARKETING RESOURCE BY ID
export const getMarketingResourceById = async (marketingResourceId: string) => {
  try {
    await connectToDatabase();

    const marketingResource = await MarketingResource.findById(
      marketingResourceId
    ).lean();

    if (!marketingResource) {
      throw new Error("MarketingResource not found");
    }

    return JSON.parse(JSON.stringify(marketingResource));
  } catch (error) {
    handleError(error);
  }
};

// ====== UPDATE MARKETING RESOURCE
export const updateMarketingResource = async (
  marketingResourceId: string,
  updateData: Partial<MarketingResourceParams>
) => {
  try {
    await connectToDatabase();

    const updatedMarketingResource =
      await MarketingResource.findByIdAndUpdate(
        marketingResourceId,
        updateData,
        { new: true, runValidators: true }
      );

    if (!updatedMarketingResource) {
      throw new Error("MarketingResource not found");
    }

    revalidatePath("/resources/marketing");

    return JSON.parse(JSON.stringify(updatedMarketingResource));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE MARKETING RESOURCE
export const deleteMarketingResource = async (
  marketingResourceId: string
) => {
  try {
    await connectToDatabase();

    const deletedMarketingResource =
      await MarketingResource.findByIdAndDelete(marketingResourceId);

    if (!deletedMarketingResource) {
      throw new Error("MarketingResource not found");
    }

    revalidatePath("/resources/marketing");

    return { message: "MarketingResource deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
