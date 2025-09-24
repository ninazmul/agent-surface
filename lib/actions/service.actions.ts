"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Service from "../database/models/service.model";
import { ServicesParams } from "@/types";

// ====== CREATE SERVICE CALENDAR
export const createService = async (params: ServicesParams) => {
  try {
    await connectToDatabase();
    const newService = await Service.create(params);
    return JSON.parse(JSON.stringify(newService));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL SERVICE CALENDARS
export const getAllServices = async () => {
  try {
    await connectToDatabase();
    const services = await Service.find().sort({ startDate: -1 }).lean();
    return JSON.parse(JSON.stringify(services));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET SERVICE BY ID
export const getServiceById = async (serviceId: string) => {
  try {
    await connectToDatabase();

    const service = await Service.findById(serviceId).lean();

    if (!service) {
      throw new Error("Service not found");
    }

    return JSON.parse(JSON.stringify(service));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET SERVICE CALENDARS BY EMAIL
export const getServicesByEmail = async (email: string) => {
  try {
    await connectToDatabase();
    const services = await Service.find({ email }).sort({ startDate: -1 }).lean();

    if (!services.length) {
      console.warn(`No Service items found for email: ${email}`);
      return [];
    }

    return JSON.parse(JSON.stringify(services));
  } catch (error) {
    console.error("Error fetching Service items by email:", error);
    handleError(error);
  }
};

// ====== UPDATE SERVICE CALENDAR
export const updateService = async (
  serviceId: string,
  updateData: Partial<ServicesParams>
) => {
  try {
    await connectToDatabase();

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      throw new Error("Service not found");
    }

    return JSON.parse(JSON.stringify(updatedService));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE SERVICE CALENDAR
export const deleteService = async (serviceId: string) => {
  try {
    await connectToDatabase();

    const deletedService = await Service.findByIdAndDelete(serviceId);

    if (!deletedService) {
      throw new Error("Service not found");
    }

    return { message: "Service deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
