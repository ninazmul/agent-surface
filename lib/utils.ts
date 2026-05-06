import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";

import { ICourseByCountrySafe } from "@/lib/database/models/course.model";

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
  _id: string;
  name: string;
  description?: string;
  courseType?: string;
  courseDuration?: string;
  startDate?: string;
  endDate?: string;
  campus: {
    name: string;
    shift: "morning" | "afternoon" | "general";
  };
  courseFee: string;
};

const shiftNames = ["morning", "afternoon", "general"] as const;

export const normalizeCourses = (
  courses: ICourseByCountrySafe[],
  selectedCountry?: string,
): SelectableCourse[] => {
  return courses.flatMap<SelectableCourse>((course) =>
    (course.campuses || []).flatMap<SelectableCourse>((campus) =>
      shiftNames.flatMap<SelectableCourse>((shiftName) => {
        const shift = campus.shifts?.[shiftName];

        if (!shift || Number(shift.seats) <= 0) return [];

        let courseFee = "0";

        if ("fee" in shift) {
          courseFee = shift.fee ?? "0";
        }

        if ("fees" in shift) {
          const matchedFee = selectedCountry
            ? shift.fees?.find((fee) => fee.country === selectedCountry)
            : undefined;

          courseFee = matchedFee?.fee ?? "0";
        }

        if (Number(courseFee) <= 0) return [];

        return [
          {
            _id: course._id,
            name: course.name || "Unnamed Course",
            description: course.description || "",
            courseType: course.courseType || "General",
            courseDuration: course.courseDuration || "",
            startDate: course.startDate,
            endDate: course.endDate,
            campus: {
              name: campus.campus || "Unknown Campus",
              shift: shiftName,
            },
            courseFee,
          },
        ];
      }),
    ),
  );
};

export const courseKey = (course: SelectableCourse) => {
  return `${course._id}-${course.campus.name}-${course.campus.shift}`;
};

export const getCourseFee = (
  course: SelectableCourse | string | number | null | undefined,
) => {
  if (typeof course === "object" && course?.courseFee != null) {
    const fee = Number(course.courseFee);
    return Number.isNaN(fee) ? 0 : fee;
  }

  const fee = Number(course);
  return Number.isNaN(fee) ? 0 : fee;
};
