import { Document, Schema, Types, model, models } from "mongoose";

// Interface for shift-based seat availability with fee
export interface IShiftAvailability {
  morning?: {
    seats: number;
    fee?: string;
  };
  afternoon?: {
    seats: number;
    fee?: string;
  };
  general?: {
    seats: number;
    fee?: string;
  };
}

// Campus availability with shift-based seat count and fee
export interface ICampusAvailability {
  _id: Types.ObjectId;
  campus: string;
  shifts?: IShiftAvailability;
}

// Course interface
export interface ICourse extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  campuses: ICampusAvailability[];
  courseDuration?: string;
  courseType?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

// Shift availability schema with fee
const ShiftAvailabilitySchema = new Schema<IShiftAvailability>(
  {
    morning: {
      seats: { type: Number, required: false },
      fee: { type: String, required: false },
    },
    afternoon: {
      seats: { type: Number, required: false },
      fee: { type: String, required: false },
    },
    general: {
      seats: { type: Number, required: false },
      fee: { type: String, required: false },
    },
  },
  { _id: false }
);

// Campus availability schema with shift-based seats and fee
const CampusAvailabilitySchema = new Schema<ICampusAvailability>(
  {
    campus: { type: String, required: true },
    shifts: { type: ShiftAvailabilitySchema, required: false },
  },
  { _id: false }
);

// Course schema
const CourseSchema = new Schema<ICourse>({
  name: { type: String, required: true },
  description: { type: String, required: false },
  courseDuration: { type: String, required: true },
  courseType: { type: String, required: false },
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
  campuses: { type: [CampusAvailabilitySchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Model
const Course = models.Course || model<ICourse>("Course", CourseSchema);

export default Course;
