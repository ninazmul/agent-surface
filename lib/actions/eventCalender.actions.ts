"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import EventCalendar from "../database/models/eventCalender.model";
import { EventCalenderParams } from "@/types";
import { revalidatePath } from "next/cache";

// ====== CREATE EVENT CALENDAR
export const createEventCalendar = async (params: EventCalenderParams) => {
  try {
    await connectToDatabase();
    const newEvent = await EventCalendar.create(params);

    revalidatePath("/events");
    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL EVENT CALENDARS
export const getAllEventCalendars = async () => {
  try {
    await connectToDatabase();
    const events = await EventCalendar.find().sort({ startDate: -1 }).lean();
    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET EVENT CALENDARS BY EMAIL
export const getEventCalendarsByEmail = async (email: string) => {
  try {
    await connectToDatabase();
    const events = await EventCalendar.find({ email }).sort({ startDate: -1 }).lean();

    if (!events.length) {
      console.warn(`No EventCalendar items found for email: ${email}`);
      return [];
    }

    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error("Error fetching EventCalendar items by email:", error);
    handleError(error);
  }
};

// ====== UPDATE EVENT CALENDAR
export const updateEventCalendar = async (
  eventId: string,
  updateData: Partial<EventCalenderParams>
) => {
  try {
    await connectToDatabase();

    const updatedEvent = await EventCalendar.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      throw new Error("EventCalendar not found");
    }

    revalidatePath("/events");

    return JSON.parse(JSON.stringify(updatedEvent));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE EVENT CALENDAR
export const deleteEventCalendar = async (eventId: string) => {
  try {
    await connectToDatabase();

    const deletedEvent = await EventCalendar.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      throw new Error("EventCalendar not found");
    }

    revalidatePath("/events");

    return { message: "EventCalendar deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
