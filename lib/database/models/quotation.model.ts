import { Document, Schema, Types, model, models } from "mongoose";

export interface IQuotation extends Document {
  _id: Types.ObjectId;
  quotationNumber?: string;
  name: string;
  email: string;
  number: string;
  gender: string;
  maritalStatus: string;
  dateOfBirth: Date;
  home: {
    address: string;
    zip: string;
    country: string;
    state: string;
    city: string;
  };
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
    _id: string;
    serviceType: string;
    title: string;
    amount?: string;
    description?: string;
  }[];
  date: Date;
  author: string;
  isPinned?: boolean;
  discount?: string;
  quotationStatus?: boolean;
  paymentStatus?: "Pending" | "Accepted" | "Rejected";
  paymentAcceptedAt?: Date | null;
  isVoid?: boolean;
  isAdditional?: boolean;
  transcript?: {
    amount: string;
    method: string;
    fileUrl: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema = new Schema(
  {
    quotationNumber: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String, required: true },
    gender: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    home: {
      address: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
    },
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
    date: { type: Date, required: true },
    author: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    discount: { type: String },
    quotationStatus: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    paymentAcceptedAt: {
      type: Date,
      default: null,
    },
    isVoid: { type: Boolean, default: false },
    isAdditional: { type: Boolean, default: true },
    transcript: {
      type: [
        {
          amount: { type: String, required: true },
          method: { type: String, required: true },
          fileUrl: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Quotation = models.Quotation || model("Quotation", QuotationSchema);

export default Quotation;
