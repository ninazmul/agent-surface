"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Quotation from "../database/models/quotation.model";
import { QuotationParams } from "@/types";
import { getNextQuotationSerial } from "../getNextSerial";
import { revalidatePath } from "next/cache";

// ====== CREATE QUOTATION
export const createQuotation = async (params: QuotationParams) => {
  try {
    await connectToDatabase();

    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const serial = await getNextQuotationSerial();
    const count = String(serial).padStart(3, "0");

    const quotationNumber = `${year}${month}${count}`;

    const newQuotation = await Quotation.create({
      ...params,
      quotationNumber,
    });

    revalidatePath("/quotations");

    return JSON.parse(JSON.stringify(newQuotation));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL QUOTATIONS
export const getAllQuotations = async () => {
  try {
    await connectToDatabase();

    const quotations = await Quotation.find().sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(quotations));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET QUOTATION BY ID
export const getQuotationById = async (quotationId: string) => {
  try {
    await connectToDatabase();

    const quotation = await Quotation.findById(quotationId).lean();

    if (!quotation) {
      return null;
    }

    return JSON.parse(JSON.stringify(quotation));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET SINGLE QUOTATION BY LEAD EMAIL
export const getQuotationByEmail = async (email: string) => {
  try {
    await connectToDatabase();

    // Find the most recent quotation for the given email
    const quotation = await Quotation.findOne({ email }).sort({ createdAt: -1 }).lean();

    if (!quotation) {
      console.log(`No quotation found for email: ${email}`);
      return null;
    }

    return JSON.parse(JSON.stringify(quotation));
  } catch (error) {
    console.error("Error fetching quotation by email:", error);
    handleError(error);
  }
};

// ====== GET QUOTATIONS BY AGENCY
export const getQuotationsByAgency = async (author: string) => {
  try {
    await connectToDatabase();

    const quotations = await Quotation.find({ author }).lean();

    if (!quotations || quotations.length === 0) {
      console.log(`No quotations found for author: ${author}`);
      return null;
    }

    return JSON.parse(JSON.stringify(quotations));
  } catch (error) {
    console.error("Error fetching quotations by author:", error);
    handleError(error);
  }
};

// ====== UPDATE QUOTATION
export const updateQuotation = async (
  quotationId: string,
  updateData: Partial<QuotationParams>
) => {
  try {
    await connectToDatabase();

    const updatedQuotation = await Quotation.findByIdAndUpdate(
      quotationId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedQuotation) {
      throw new Error("Quotation not found");
    }

    revalidatePath("/quotations");

    return JSON.parse(JSON.stringify(updatedQuotation));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE QUOTATION
export const deleteQuotation = async (quotationId: string) => {
  try {
    await connectToDatabase();

    const deletedQuotation = await Quotation.findByIdAndDelete(quotationId);

    if (!deletedQuotation) {
      throw new Error("Quotation not found");
    }

    revalidatePath("/quotations");

    return { message: "Quotation deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
