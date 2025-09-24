import { Document, Schema, model, models } from "mongoose";

// Interface for shift-based seat availability
export interface IShiftAvailability {
  morning: number;
  afternoon: number;
}

// Campus availability with shift-based seat count
export interface ICampusAvailability {
  _id: string;
  campus: string;
  shifts: IShiftAvailability;
}

// Course interface
export interface ICourse extends Document {
  _id: string;
  name: string;
  campuses: ICampusAvailability[];
  courseDuration?: string;
  courseType?: string;
  courseFee?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

// Shift availability schema
const ShiftAvailabilitySchema = new Schema<IShiftAvailability>(
  {
    morning: { type: Number, required: true },
    afternoon: { type: Number, required: true },
  },
  { _id: false }
);

// Campus availability schema with shift-based seats
const CampusAvailabilitySchema = new Schema<ICampusAvailability>(
  {
    campus: { type: String, required: true },
    shifts: { type: ShiftAvailabilitySchema, required: true },
  },
  { _id: false }
);

// Course schema
const CourseSchema = new Schema<ICourse>({
  name: { type: String, required: true },
  courseDuration: { type: String, required: true },
  courseType: { type: String, required: true },
  courseFee: { type: String, required: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  campuses: { type: [CampusAvailabilitySchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Model
const Course = models.Course || model<ICourse>("Course", CourseSchema);

export default Course;
