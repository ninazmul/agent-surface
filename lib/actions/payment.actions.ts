"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Payment from "../database/models/payment.model";
import { PaymentParams } from "@/types";
import { revalidatePath } from "next/cache";

// ====== CREATE PAYMENT
export const createPayment = async (params: PaymentParams) => {
  try {
    await connectToDatabase();
    const newPayment = await Payment.create(params);

    revalidatePath("/finance/payment");
    return JSON.parse(JSON.stringify(newPayment));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL PAYMENTS
export const getAllPayments = async () => {
  try {
    await connectToDatabase();
    const payments = await Payment.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(payments));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET PAYMENT BY ID
export const getPaymentById = async (paymentId: string) => {
  try {
    await connectToDatabase();

    const payment = await Payment.findById(paymentId).lean();

    if (!payment) {
      return null;
    }

    return JSON.parse(JSON.stringify(payment));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET PAYMENTS BY AGENCY
export const getPaymentsByAgency = async (agency: string) => {
  try {
    await connectToDatabase();
    const payments = await Payment.find({ agency }).sort({ date: -1 }).lean();

    if (!payments.length) {
      console.warn(`No payments found for agency: ${agency}`);
      return [];
    }

    return JSON.parse(JSON.stringify(payments));
  } catch (error) {
    console.error("Error fetching payments by agency:", error);
    handleError(error);
  }
};

// ====== UPDATE PAYMENT
export const updatePayment = async (
  paymentId: string,
  updateData: Partial<PaymentParams>
) => {
  try {
    await connectToDatabase();

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPayment) {
      throw new Error("Payment not found");
    }

    revalidatePath("/finance/payment");

    return JSON.parse(JSON.stringify(updatedPayment));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE PAYMENT
export const deletePayment = async (paymentId: string) => {
  try {
    await connectToDatabase();

    const deletedPayment = await Payment.findByIdAndDelete(paymentId);

    if (!deletedPayment) {
      throw new Error("Payment not found");
    }

    revalidatePath("/finance/payment");

    return { message: "Payment deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
