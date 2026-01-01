"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Promotion from "../database/models/promotion.model";
import { PromotionParams } from "@/types";
import { revalidatePath } from "next/cache";

// ====== CREATE PROMOTION
export const createPromotion = async (params: PromotionParams) => {
  try {
    await connectToDatabase();

    const newPromotion = await Promotion.create(params);

    revalidatePath("/promotions");

    return JSON.parse(JSON.stringify(newPromotion));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL PROMOTIONS
export const getAllPromotions = async () => {
  try {
    await connectToDatabase();

    const promotions = await Promotion.find().sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(promotions));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET PROMOTION BY ID
export const getPromotionById = async (promotionId: string) => {
  try {
    await connectToDatabase();

    const promotion = await Promotion.findById(promotionId).lean();

    if (!promotion) {
      throw new Error("Promotion not found");
    }

    return JSON.parse(JSON.stringify(promotion));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET PROMOTIONS BY EMAIL
export const getPromotionsByEmail = async (email: string) => {

  try {
    await connectToDatabase();

    const promotions = await Promotion.find({ email }).lean();

    if (!promotions || promotions.length === 0) {
      console.log(`No promotions found for email: ${email}`);
      return null;
    }

    return JSON.parse(JSON.stringify(promotions));
  } catch (error) {
    console.error("Error fetching promotions by email:", error);
    handleError(error);
  }
};

// ====== UPDATE PROMOTION
export const updatePromotion = async (
  promotionId: string,
  updateData: Partial<PromotionParams>
) => {
  try {
    await connectToDatabase();

    const updatedPromotion = await Promotion.findByIdAndUpdate(
      promotionId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPromotion) {
      throw new Error("Promotion not found");
    }

    revalidatePath("/promotions");

    return JSON.parse(JSON.stringify(updatedPromotion));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE PROMOTION
export const deletePromotion = async (promotionId: string) => {
  try {
    await connectToDatabase();

    const deletedPromotion = await Promotion.findByIdAndDelete(
      promotionId
    );

    if (!deletedPromotion) {
      throw new Error("Promotion not found");
    }

    revalidatePath("/promotions");

    return { message: "Promotion deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};

