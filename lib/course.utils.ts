import { ICourse } from "@/lib/database/models/course.model";

export interface SelectedCourse {
  name: string;
  courseDuration?: string;
  courseType?: string;
  startDate?: Date;
  endDate?: Date;
  campus: { name: string; shift: string };
  courseFee?: string;
}

export const expandCourses = (course: ICourse): SelectedCourse[] => {
  return (
    course.campuses?.flatMap((ca) => {
      const variants: SelectedCourse[] = [];

      (["morning", "afternoon"] as const).forEach((shift) => {
        if (ca.shifts[shift] > 0) {
          variants.push({
            name: course.name,
            courseDuration: course.courseDuration,
            courseType: course.courseType,
            startDate: course.startDate ? new Date(course.startDate) : undefined,
            endDate: course.endDate ? new Date(course.endDate) : undefined,
            campus: { name: ca.campus, shift },
            courseFee: course.courseFee || "0",
          });
        }
      });

      return variants;
    }) || []
  );
};

export const promotionExpandCourses = (course: ICourse): SelectedCourse[] => {
  return (
    course.campuses?.flatMap((ca) => {
      const variants: SelectedCourse[] = [];

      (["morning", "afternoon"] as const).forEach((shift) => {
        if (ca.shifts?.[shift] > 0) {
          variants.push({
            name: course.name,
            courseDuration: course.courseDuration,
            courseType: course.courseType,
            startDate: course.startDate ? new Date(course.startDate) : undefined,
            endDate: course.endDate ? new Date(course.endDate) : undefined,
            campus: { name: ca.campus, shift },
            courseFee: course.courseFee || "0",
          });
        }
      });

      return variants;
    }) || []
  );
};

export const courseKey = (course: SelectedCourse) =>
  `${course.name}-${course.campus?.name}-${course.campus?.shift}`;
