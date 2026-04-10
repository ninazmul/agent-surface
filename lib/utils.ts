import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";

import { ICourse } from "@/lib/database/models/course.model";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    // timeZone: "Australia/Sydney", // Sydney time zone
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
    // timeZone: "Australia/Sydney", // Sydney time zone
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    // timeZone: "Australia/Sydney", // Sydney time zone
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions,
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions,
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions,
  );

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const formatPrice = (price: string) => {
  const amount = parseFloat(price);
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

  return formattedPrice;
};

export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};

export const timeAgo = (input: string | Date) => {
  const date = new Date(input);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "just now";

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} m${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} h${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} d${days > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-GB");
};

export type SelectableCourse = {
  _id: string; // make required
  name: string;
  description?: string;
  courseType?: string;
  courseDuration?: string;
  startDate?: Date;
  endDate?: Date;
  campus: {
    name: string;
    shift: "morning" | "afternoon" | "general";
  };
  courseFee: string;
};

export const normalizeCourses = (courses: ICourse[]): SelectableCourse[] => {
  return courses.flatMap((course) =>
    (course.campuses || []).flatMap((campus) =>
      (["morning", "afternoon", "general"] as const)
        .filter(
          (shift) =>
            campus.shifts?.[shift]?.seats &&
            campus.shifts?.[shift]?.fee &&
            Number(campus.shifts[shift].seats) > 0 &&
            Number(campus.shifts[shift].fee) > 0,
        )
        .map((shift) => ({
          _id: course._id!.toString(),
          name: course.name || "Unnamed Course",
          description: course?.description || "",
          courseType: course?.courseType || "General",
          courseDuration: course.courseDuration || "",
          startDate: course?.startDate || undefined,
          endDate: course?.endDate || undefined,
          campus: {
            name: campus.campus || "Unknown Campus",
            shift,
          },
          courseFee: campus.shifts?.[shift]?.fee?.toString() || "0",
        })),
    ),
  );
};

export const courseKey = (c: SelectableCourse) =>
  `${c._id}-${c.campus.name}-${c.campus.shift}`;

export const getCourseFee = (
  course: SelectableCourse | string | number | null | undefined,
) => {
  if (typeof course === "object" && course?.courseFee != null) {
    const fee = Number(course.courseFee);
    return isNaN(fee) ? 0 : fee;
  }
  const fee = Number(course);
  return isNaN(fee) ? 0 : fee;
};
