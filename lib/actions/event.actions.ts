"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Event from "../database/models/event.model";
import { EventParams } from "@/types";

// ====== CREATE EVENT
export const createEvent = async (params: EventParams) => {
  try {
    await connectToDatabase();
    const newEvent = await Event.create(params);
    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL EVENTS
export const getAllEvents = async () => {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET EVENTS BY EMAIL
export const getEventsByEmail = async (email: string) => {
  try {
    await connectToDatabase();
    const events = await Event.find({ email }).sort({ date: -1 }).lean();

    if (!events.length) {
      console.warn(`No events found for email: ${email}`);
      return [];
    }

    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error("Error fetching events by email:", error);
    handleError(error);
  }
};

// ====== UPDATE EVENT
export const updateEvent = async (
  eventId: string,
  updateData: Partial<EventParams>
) => {
  try {
    await connectToDatabase();

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      throw new Error("Event not found");
    }

    return JSON.parse(JSON.stringify(updatedEvent));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE EVENT
export const deleteEvent = async (eventId: string) => {
  try {
    await connectToDatabase();

    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      throw new Error("Event not found");
    }

    return { message: "Event deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
