"use client";

import { useMemo, useState } from "react";
import { updateLead } from "@/lib/actions/lead.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ILead } from "@/lib/database/models/lead.model";
import { IServices } from "@/lib/database/models/service.model";
import { ICourse } from "@/lib/database/models/course.model";
import toast from "react-hot-toast";
import { IQuotation } from "@/lib/database/models/quotation.model";
import { updateQuotation } from "@/lib/actions/quotation.actions";
import { createTrack } from "@/lib/actions/track.actions";
import { Types } from "mongoose";
import { SelectableCourse } from "@/lib/utils";
import { Info } from "lucide-react";
interface IService {
  _id: Types.ObjectId;
  title: string;
  serviceType: string;
  amount: number;
  description?: string;
}

export default function QuotationEditor({
  data,
  isAdmin,
  allCourse,
  allServices,
  isQuotationAccepted,
  userEmail,
}: {
  data: ILead | IQuotation;
  isAdmin: boolean;
  allCourse: ICourse[];
  allServices: IServices[];
  isQuotationAccepted: boolean;
  userEmail?: string;
}) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const canEdit =
    isAdmin ||
    (userEmail &&
      data.author &&
      userEmail === data.author &&
      !isQuotationAccepted);

  // Courses & Services states
  const expandCourses = (course: ICourse): SelectableCourse[] => {
    return (
      course.campuses?.flatMap((ca) => {
        const variants: SelectableCourse[] = [];

        if ((ca.shifts?.morning?.seats ?? 0) > 0) {
          variants.push({
            name: course.name,
            courseDuration: course.courseDuration,
            courseType: course.courseType,
            startDate: course.startDate
              ? new Date(course.startDate)
              : undefined,
            endDate: course.endDate ? new Date(course.endDate) : undefined,
            campus: {
              name: ca.campus,
              shift: "morning",
            },
            courseFee: (ca.shifts?.morning?.fee ?? 0).toString(),
            _id: course._id.toString(),
          });
        }

        if ((ca.shifts?.afternoon?.seats ?? 0) > 0) {
          variants.push({
            name: course.name,
            courseDuration: course.courseDuration,
            courseType: course.courseType,
            startDate: course.startDate
              ? new Date(course.startDate)
              : undefined,
            endDate: course.endDate ? new Date(course.endDate) : undefined,
            campus: {
              name: ca.campus,
              shift: "afternoon",
            },
            courseFee: (ca.shifts?.afternoon?.fee ?? 0).toString(),
            _id: course._id.toString(),
          });
        }

        if ((ca.shifts?.general?.seats ?? 0) > 0) {
          variants.push({
            name: course.name,
            courseDuration: course.courseDuration,
            courseType: course.courseType,
            startDate: course.startDate
              ? new Date(course.startDate)
              : undefined,
            endDate: course.endDate ? new Date(course.endDate) : undefined,
            campus: {
              name: ca.campus,
              shift: "general",
            },
            courseFee: (ca.shifts?.general?.fee ?? 0).toString(),
            _id: course._id.toString(),
          });
        }

        return variants;
      }) || []
    );
  };

  const expandedCourses = useMemo(
    () => allCourse?.flatMap(expandCourses) || [],
    [allCourse],
  );

  const [selectedCourses, setSelectedCourses] = useState<SelectableCourse[]>(
    (data.course ?? []).map((c) => ({
      ...c,
      courseFee: c.courseFee?.toString() || "0",
      campus: {
        name: c.campus?.name || "",
        shift:
          c.campus?.shift === "morning" ||
          c.campus?.shift === "afternoon" ||
          c.campus?.shift === "general"
            ? c.campus.shift
            : "general", // default to general if invalid
      },
    })),
  );

  const [selectedServices, setSelectedServices] = useState<IService[]>(
    (data.services ?? []).map((s) => ({
      _id: new Types.ObjectId(s._id),
      title: s.title,
      serviceType: s.serviceType || "",
      amount: Number(s.amount) || 0,
      description: s.description || "",
    })),
  );

  const [discount, setDiscount] = useState<string>(
    data.discount ? data.discount.toString() : "",
  );

  const [loading, setLoading] = useState(false);

  const discountNumber = Number(discount) || 0;

  const subTotal =
    selectedCourses.reduce((sum, c) => sum + Number(c.courseFee || 0), 0) +
    selectedServices.reduce((sum, s) => sum + s.amount, 0);

  const grandTotal = subTotal - discountNumber;

  const courseKey = (course: SelectableCourse) =>
    `${course.name}-${course.campus?.name}-${course.campus?.shift}`;

  // Toggle services & courses
  const toggleCourse = (course: SelectableCourse) => {
    const exists = selectedCourses.some(
      (c) => courseKey(c) === courseKey(course),
    );
    setSelectedCourses(
      exists
        ? selectedCourses.filter((c) => courseKey(c) !== courseKey(course))
        : [...selectedCourses, course],
    );
  };

  const toggleService = (service: IServices) => {
    const exists = selectedServices.some((s) => s._id === service._id);
    if (exists) {
      setSelectedServices(
        selectedServices.filter((s) => s._id !== service._id),
      );
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          _id: service._id,
          title: service.title,
          serviceType: service.serviceType || "",
          amount: Number(service.amount) || 0,
          description: service.description,
        },
      ]);
    }
  };

  // ✅ Save handler (dynamic based on data type)
  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        course: selectedCourses
          ?.filter((c) => c._id)
          .map((c) => ({
            _id: c._id!,
            name: c.name,
            courseType: c.courseType,
            courseDuration: c.courseDuration,
            startDate: c.startDate,
            endDate: c.endDate,
            campus: c.campus,
            courseFee: c.courseFee,
          })),
        discount: discount.toString(),
        services: selectedServices.map((s) => ({
          _id: s._id ?? "",
          title: s.title,
          serviceType: s.serviceType,
          amount: s.amount.toString(),
          description: s.description,
        })),
      };

      if ("quotationNumber" in data) {
        await updateQuotation(data._id.toString(), payload);
      } else {
        await updateLead(data._id.toString(), payload);
      }

      setIsEditing(false);
      toast.success("Quotation updated successfully!");
      await createTrack({
        student: data.email,
        event: `Quotation updated for ${data.name || "Student"}`,
        route: `/quotation/${data._id}`,
        status: "Quotation Updated",
      });
    } catch (error) {
      console.error("Failed to update:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-primary-800">
          Services & Fees
        </h2>

        {canEdit && (
          <div className="flex gap-2 self-start sm:self-auto">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ================= COURSES ================= */}
      {isEditing ? (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth snap-x">
          {expandedCourses.map((course) => {
            const isSelected = selectedCourses.some(
              (c) =>
                c.name === course.name &&
                c.campus?.name === course.campus?.name &&
                c.campus?.shift === course.campus?.shift,
            );

            const key = `edit-course-${courseKey(course)}`;
            const isExpanded = expandedItem === key;

            return (
              <div
                key={courseKey(course)}
                className={`relative flex-shrink-0 w-[280px] md:w-[300px]
          rounded-2xl border p-4 shadow-sm
          bg-white dark:bg-gray-900
          transition-all duration-200
          ${
            isSelected
              ? "border-blue-600 dark:border-blue-500"
              : "border-gray-200 dark:border-gray-700"
          }`}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-base leading-tight">
                    {course.name}
                  </h4>

                  <button
                    type="button"
                    onClick={() => setExpandedItem(isExpanded ? null : key)}
                    className="text-gray-500 hover:text-blue-600 transition"
                  >
                    <Info size={16} />
                  </button>
                </div>

                {/* Decision Info */}
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    {course.campus?.name} • {course.campus?.shift}
                  </p>
                </div>

                <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                  €{course.courseFee}
                </p>

                {/* Expand Section */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-2">
                    <p>Type: {course.courseType || "Not specified"}</p>

                    <p>Duration: {course.courseDuration || "Not specified"}</p>

                    <p>
                      Start:{" "}
                      {course.startDate
                        ? new Date(course.startDate).toLocaleDateString()
                        : "Not scheduled"}
                    </p>

                    <p>
                      End:{" "}
                      {course.endDate
                        ? new Date(course.endDate).toLocaleDateString()
                        : "Not scheduled"}
                    </p>

                    {course.description && (
                      <div className="pt-2 text-gray-600 leading-relaxed text-justify">
                        {course.description}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleCourse(course)}
                  className={`w-full mt-4 py-2 rounded-lg text-sm font-medium transition
              ${
                isSelected
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
                >
                  {isSelected ? "Selected ✅" : "Select Course"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {selectedCourses.map((course) => (
            <div
              key={courseKey(course)}
              className="rounded-xl border border-gray-200 dark:border-gray-700
      p-4 bg-white dark:bg-gray-900 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{course.name}</p>
                  <p className="text-sm text-gray-500">
                    {course.courseType} • {course.courseDuration}
                  </p>
                  <p className="text-sm text-gray-500">
                    {course.campus?.name} • {course.campus?.shift}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  €{Number(course.courseFee).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= SERVICES ================= */}
      {isEditing ? (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth snap-x">
          {allServices.map((service) => {
            const isSelected = selectedServices.some(
              (s) => s._id === service._id,
            );

            const key = `edit-service-${service._id}`;
            const isExpanded = expandedItem === key;

            return (
              <div
                key={service._id.toString()}
                className={`relative flex-shrink-0 w-[280px] md:w-[300px]
          rounded-2xl border p-4 shadow-sm
          bg-white dark:bg-gray-900 transition-all duration-200
          ${
            isSelected
              ? "border-blue-600 dark:border-blue-500"
              : "border-gray-200 dark:border-gray-700"
          }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-base">{service.title}</h4>

                  <button
                    type="button"
                    onClick={() => setExpandedItem(isExpanded ? null : key)}
                    className="text-gray-500 hover:text-blue-600 transition"
                  >
                    <Info size={16} />
                  </button>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  <p>{service.serviceType}</p>
                </div>

                <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                  €{service.amount}
                </p>

                {isExpanded && service.description && (
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                    <p className="leading-relaxed">{service.description}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`w-full mt-4 py-2 rounded-lg text-sm font-medium transition
              ${
                isSelected
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
                >
                  {isSelected ? "Selected ✅" : "Select Service"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {selectedServices.map((service) => (
            <div
              key={service._id.toString()}
              className="rounded-xl border border-gray-200 dark:border-gray-700
              p-4 bg-white dark:bg-gray-900 shadow-sm flex justify-between"
            >
              <div>
                <p className="font-semibold">{service.title}</p>
                <p className="text-sm text-gray-500">
                  {service.serviceType || "Additional service"}
                </p>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                €{Number(service.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ================= TOTALS ================= */}
      <div className="space-y-2 pt-4 border-t">
        <div className="flex justify-between text-sm sm:text-base font-semibold">
          <p>Subtotal</p>
          <p>€{subTotal.toFixed(2)}</p>
        </div>

        <div className="flex justify-between text-sm sm:text-base font-semibold">
          <p>Discount</p>
          {isEditing ? (
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min={0}
              className="w-24 sm:w-28 text-right"
            />
          ) : (
            <p>- €{discount}</p>
          )}
        </div>

        <div className="flex justify-between text-lg sm:text-xl font-bold text-primary-800 pt-2">
          <p>Total</p>
          <p>€{grandTotal.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
