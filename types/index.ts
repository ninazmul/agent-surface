import { Types } from "mongoose";

// ====== USER PARAMS
export type CreateUserParams = {
  clerkId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  photo: string;
};

export type UpdateUserParams = {
  firstName: string;
  lastName: string;
  username: string;
  photo: string;
};

// ====== EVENT PARAMS
export type EventParams = {
  title: string;
  description: string;
  date: Date;
  email?: string;
};

export type EventType =
  | "application_deadline"
  | "enrollment_period"
  | "course_start"
  | "offer_promotion"
  | "webinar_event"
  | "holiday_closure";

export type EventCalenderParams = {
  title: string;
  description: string;
  eventType: EventType;
  startDate: Date | string; // Accept string if from form input
  endDate?: Date | string;
  offerExpiryDate?: Date | string;
};

// ====== SERVICE PARAMS
export type ServiceType =
  | "Accommodation"
  | "Airport Pick-up"
  | "Learner Protection"
  | "Medical Insurance"
  | "Other Request";

export type ServicesParams = {
  title: string;
  description: string;
  serviceType: ServiceType;
  startDate: Date | string;
  endDate?: Date | string;
  amount?: string;
};

// ====== MESSAGE PARAMS
export type MessageParams = {
  userEmail: string;
  senderEmail: string;
  country?: string;
  senderRole?: "user" | "admin";
  text: string;
  status?: "read" | "unread";
};

// ====== NOTIFICATION PARAMS
export type NotificationParams = {
  title: string;
  agency: string;
  country: string;
  route?: string;
  createdAt?: Date;
  readBy?: {
    email?: string;
    status: "read" | "unread";
  }[];
};

// ====== LEAD PARAMS
export type LeadParams = {
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
    _id: Types.ObjectId;
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
  paymentStatus?: string;
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
  assignedTo?: string[];
};

// ====== REFUND PARAMS
export type RefundParams = {
  name: string;
  email: string;
  number: string;
  country: string;
  leadNumber: string;
  note?: string;
  progress?: string;
  author: string;
  amount: string;
};

// ====== PAYMENT PARAMS
export type PaymentParams = {
  agency: string;
  amount: string;
  paymentMethod: string;
  accountDetails?: string;
  country: string;
  progress: string;
  createdAt: Date;
};

// ====== ADMIN PARAMS
export type AdminParams = {
  name: string;
  email: string;
  rolePermissions: string[];
  countries?: string[];
};

// ====== COURSE PARAMS

export interface CampusAvailability {
  campus: string;
  shifts: {
    morning: number;
    afternoon: number;
  };
}

export interface CourseParams {
  name: string;
  campuses: CampusAvailability[];
  courseDuration: string;
  courseType: string;
  courseFee?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

// ====== DOWNLOAD PARAMS
export type DownloadParams = {
  name: string;
  email: string;
  date: Date;
  country: string;
  documents: {
    fileName: string;
    fileUrl: string;
  }[];
  author: string;
  createdAt: Date;
};

// ====== PROMOTION PARAMS
export type PromotionParams = {
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
};

// ====== PROMOTION QUOTATION PARAMS
export type PromotionQuotationParams = {
  title: string;
  agency: string;
  quotation: string;
  createdAt: Date;
};

// ====== RESOURCE PARAMS
export type ResourceParams = {
  category: string;
  fileName: string;
  link: string;
  createdAt: Date;
};

// ====== QUOTATION PARAMS
export type QuotationParams = {
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
    _id: Types.ObjectId;
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
  paymentStatus?: string;
  paymentAcceptedAt?: Date | null;
  isVoid?: boolean;
  isAdditional?: boolean;
  transcript?: {
    amount: string;
    method: string;
    fileUrl: string;
  }[];
};

// ====== PROFILE PARAMS
export type ProfileParams = {
  name: string;
  logo?: string;
  email: string;
  number: string;
  country: string;
  location: string;
  licenseDocument?: string;
  agreementDocument?: string;
  bankName?: string;
  accountNumber?: string;
  swiftCode?: string;
  routingNumber?: string;
  branchAddress?: string;
  role: string;
  countryAgent?: string;
  subAgents?: string[];
  status: string;
  salesTarget?: string;
  createdAt: Date;
};

export type SearchParamProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export interface TrackParams {
  student: string;
  event: string;
  route?: string;
  status?: string;
}
