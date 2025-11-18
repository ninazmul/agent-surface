import { Document, Schema, Types, model, models } from "mongoose";

// Define allowed service types
export type ServiceType =
  | "Accommodation"
  | "Airport Pick-up"
  | "Learner Protection"
  | "Medical Insurance"
  | "Other Request";

// Interface for the service calendar
export interface IServices extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  serviceType: ServiceType;
  startDate: Date;
  endDate?: Date;
  amount?: string;
  createdAt: Date;
}

// Mongoose schema
const ServicesSchema = new Schema<IServices>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  serviceType: {
    type: String,
    required: true,
    enum: [
      "Accommodation",
      "Airport Pick-up",
      "Learner Protection",
      "Medical Insurance",
      "Other Request",
    ],
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  amount: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Create or reuse model
const Services =
  models.Services || model<IServices>("Services", ServicesSchema);

export default Services;
