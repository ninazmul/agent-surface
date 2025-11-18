import { Document, Schema, Types, model, models } from "mongoose";

export interface IPromotion extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  criteria: string;
  startDate: Date;
  endDate: Date;
  photo?: string;
  agencies?: string[];
  countries?: string[];
  course?: {
    name: string;
    courseDuration?: string;
    courseType?: string;
    startDate?: Date;
    endDate?: Date;
    campus?: {
      name: string;
      shift: string;
    };
    courseFee?: string;
  }[];
  services?: {
    _id: Types.ObjectId;
    serviceType: string;
    title: string;
    amount?: string;
    description?: string;
  }[];
  discount?: string;
  isPaused?: boolean;
  sku: string;
  createdAt: Date;
}

const PromotionSchema = new Schema<IPromotion>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  criteria: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  photo: { type: String },
  agencies: { type: [String], default: undefined },
  countries: { type: [String], default: undefined },
  course: {
    type: [
      {
        name: { type: String },
        courseDuration: { type: String },
        courseType: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        campus: {
          name: { type: String },
          shift: { type: String },
        },
        courseFee: { type: String },
      },
    ],
    default: [],
  },
  services: {
    type: [
      {
        _id: { type: String, required: true },
        serviceType: { type: String },
        title: { type: String },
        description: { type: String },
        amount: { type: String },
      },
    ],
    default: [],
  },
  discount: { type: String },
  isPaused: { type: Boolean, default: false },
  sku: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Promotion =
  models.Promotion || model<IPromotion>("Promotion", PromotionSchema);

export default Promotion;
