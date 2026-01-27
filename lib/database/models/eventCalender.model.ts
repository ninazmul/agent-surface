import { Document, Schema, Types, model, models } from "mongoose";

// Define allowed event types
export type EventType =
  | "application_deadline"
  | "enrollment_period"
  | "course_start"
  | "offer_promotion"
  | "webinar_event"
  | "holiday_closure";

// Interface for the event calendar
export interface IEventCalendar extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  eventType: EventType;
  eventLink?: string;
  startDate: Date;
  endDate?: Date; // For multi-day events
  offerExpiryDate?: Date; // For promotions
  agencies?: string[];
  countries?: string[];
  createdAt: Date;
}

// Mongoose schema
const EventCalendarSchema = new Schema<IEventCalendar>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  eventType: {
    type: String,
    required: true,
    enum: [
      "application_deadline",
      "enrollment_period",
      "course_start",
      "offer_promotion",
      "webinar_event",
      "holiday_closure"
    ],
  },
  eventLink: { type: String },
  agencies: { type: [String], default: undefined },
  countries: { type: [String], default: undefined },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  offerExpiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Create or reuse model
const EventCalendar =
  models.EventCalendar || model<IEventCalendar>("EventCalendar", EventCalendarSchema);

export default EventCalendar;
