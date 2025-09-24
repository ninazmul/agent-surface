import { Document, Schema, model, models } from "mongoose";

export interface ILead extends Document {
  _id: string;
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
  irish?: {
    address?: string;
    zip?: string;
    country?: string;
    state?: string;
    city?: string;
  };
  passport?: {
    visa?: boolean;
    number?: string;
    country?: string;
    file?: string;
    issueDate?: Date;
    expirationDate?: Date;
  };
  arrival?: {
    flight?: string;
    file?: string;
    date?: Date;
    time?: Date;
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
  note?: string;
  progress: string;
  status?: string;
  date: Date;
  author: string;
  isPinned?: boolean;
  others?: {
    fileName: string;
    fileUrl: string;
  }[];
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    skype?: string;
  };
  discount?: string;
  quotationStatus?: boolean;
  paymentStatus?: "Pending" | "Accepted" | "Rejected";
  paymentAcceptedAt?: Date | null;
  paymentMethod?: string;
  isVoid?: boolean;
  isPromotion?: boolean;
  promotionSku?: string;
  transcript?: {
    amount: string;
    method: string;
    fileUrl: string;
  }[];
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
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
    irish: {
      address: { type: String },
      zip: { type: String },
      country: { type: String },
      state: { type: String },
      city: { type: String },
    },
    passport: {
      visa: { type: Boolean },
      number: { type: String },
      country: { type: String },
      file: { type: String },
      issueDate: { type: Date },
      expirationDate: { type: Date },
    },
    arrival: {
      flight: { type: String },
      file: { type: String },
      date: { type: Date },
      time: { type: Date },
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
    note: { type: String },
    progress: { type: String, required: true },
    status: { type: String },
    date: { type: Date, required: true },
    author: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    others: {
      type: [
        {
          fileName: { type: String, required: true },
          fileUrl: { type: String, required: true },
        },
      ],
      default: [],
    },
    social: {
      type: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        twitter: { type: String, default: "" },
        skype: { type: String, default: "" },
      },
      default: {},
    },
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
    paymentMethod: { type: String },
    isVoid: { type: Boolean, default: false },
    isPromotion: { type: Boolean, default: false },
    promotionSku: { type: String },
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
    assignedTo: { type: String },
  },
  { timestamps: true }
);

const Lead = models.Lead || model<ILead>("Lead", LeadSchema);

export default Lead;
