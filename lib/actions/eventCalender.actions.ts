"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import EventCalendar, { IEventCalendar } from "../database/models/eventCalender.model";
import { EventCalenderParams } from "@/types";
import { revalidatePath } from "next/cache";
import { IProfile } from "../database/models/profile.model";

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

export const getFilteredEvents = async ({
  email,
  isAdmin,
  adminCountries,
  profile,
}: {
  email: string;
  isAdmin: boolean;
  adminCountries?: string[];
  profile?: IProfile;
}) => {
  const events = await getAllEventCalendars();
  const now = Date.now();

  let filtered = events;

  if (isAdmin) {
    // Admin country scope
    if (adminCountries && adminCountries.length > 0) {
      filtered = events.filter((event: IEventCalendar) => {
        if (!event.countries || event.countries.length === 0) return true;
        return event.countries.some((c) => adminCountries.includes(c));
      });
    }
  } else {
    const userCountry = profile?.country;

    filtered = events.filter((event: IEventCalendar) => {
      const countryMatch =
        !event.countries || event.countries.length === 0
          ? true
          : userCountry && event.countries.includes(userCountry);

      const agencyMatch =
        !event.agencies || event.agencies.length === 0
          ? true
          : event.agencies.includes(email);

      return countryMatch || agencyMatch;
    });
  }

  // 🔑 Date window (mandatory for events)
  return filtered.filter((event: IEventCalendar) => {
    const start = new Date(event.startDate!).getTime();
    const end = new Date(event.endDate!).getTime();
    return start <= now && end >= now;
  });
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
