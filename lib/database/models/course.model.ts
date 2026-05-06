import { Document, Schema, Types, model, models } from "mongoose";

export interface ICountryFee {
  country: string;
  fee: string;
}

export interface IShiftFee {
  seats: number;
  fees?: ICountryFee[];
}

export interface IShiftAvailability {
  morning?: IShiftFee;
  afternoon?: IShiftFee;
  general?: IShiftFee;
}

export interface ICampusAvailability {
  campus: string;
  shifts?: IShiftAvailability;
}

export interface ICourse extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  campuses: ICampusAvailability[];
  courseDuration: string;
  courseType?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface IShiftFeeView {
  seats: number;
  fee: string | null;
}

export interface IShiftFeesView {
  seats: number;
  fees: ICountryFee[];
}

export interface IShiftAvailabilityByCountry {
  morning?: IShiftFeeView | IShiftFeesView;
  afternoon?: IShiftFeeView | IShiftFeesView;
  general?: IShiftFeeView | IShiftFeesView;
}

export interface ICampusAvailabilitySafe {
  campus: string;
  shifts?: IShiftAvailability;
}

export interface ICourseSafe {
  _id: string;
  name: string;
  description?: string;
  campuses: ICampusAvailabilitySafe[];
  courseDuration: string;
  courseType?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface ICourseByCountrySafe extends Omit<ICourseSafe, "campuses"> {
  campuses: Array<
    Omit<ICampusAvailabilitySafe, "shifts"> & {
      shifts?: IShiftAvailabilityByCountry;
    }
  >;
}

const CountryFeeSchema = new Schema<ICountryFee>(
  {
    country: { type: String, required: true },
    fee: { type: String, required: true },
  },
  { _id: false },
);

const ShiftFeeSchema = new Schema<IShiftFee>(
  {
    seats: { type: Number, required: true },
    fees: { type: [CountryFeeSchema], required: false, default: [] },
  },
  { _id: false },
);

const ShiftAvailabilitySchema = new Schema<IShiftAvailability>(
  {
    morning: { type: ShiftFeeSchema, required: false },
    afternoon: { type: ShiftFeeSchema, required: false },
    general: { type: ShiftFeeSchema, required: false },
  },
  { _id: false },
);

const CampusAvailabilitySchema = new Schema<ICampusAvailability>(
  {
    campus: { type: String, required: true },
    shifts: { type: ShiftAvailabilitySchema, required: false },
  },
  { _id: false },
);

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

const Course = models.Course || model<ICourse>("Course", CourseSchema);

export default Course;
