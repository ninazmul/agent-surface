"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Refund from "../database/models/refund.model";
import { RefundParams } from "@/types";

// ====== CREATE REFUND
export const createRefund = async (params: RefundParams) => {
  try {
    await connectToDatabase();
    const newRefund = await Refund.create(params);
    return JSON.parse(JSON.stringify(newRefund));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL REFUNDS
export const getAllRefunds = async () => {
  try {
    await connectToDatabase();
    const refunds = await Refund.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(refunds));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET REFUNDS BY AGENCY
export const getRefundsByAgency = async (author: string) => {
  try {
    await connectToDatabase();
    const refunds = await Refund.find({ author }).sort({ date: -1 }).lean();

    if (!refunds.length) {
      console.warn(`No refunds found for author: ${author}`);
      return [];
    }

    return JSON.parse(JSON.stringify(refunds));
  } catch (error) {
    console.error("Error fetching refunds by author:", error);
    handleError(error);
  }
};

// ====== UPDATE REFUND
export const updateRefund = async (
  refundId: string,
  updateData: Partial<RefundParams>
) => {
  try {
    await connectToDatabase();

    const updatedRefund = await Refund.findByIdAndUpdate(
      refundId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRefund) {
      throw new Error("Refund not found");
    }

    return JSON.parse(JSON.stringify(updatedRefund));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE REFUND
export const deleteRefund = async (refundId: string) => {
  try {
    await connectToDatabase();

    const deletedRefund = await Refund.findByIdAndDelete(refundId);

    if (!deletedRefund) {
      throw new Error("Refund not found");
    }

    return { message: "Refund deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
