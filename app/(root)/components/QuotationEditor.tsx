"use client";

import { useMemo, useState } from "react";
import { updateLead } from "@/lib/actions/lead.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ILead } from "@/lib/database/models/lead.model";
import { IServices } from "@/lib/database/models/service.model";
import { ICourse } from "@/lib/database/models/course.model";
import toast from "react-hot-toast";
import { SelectedCourse } from "@/lib/course.utils";
import { IQuotation } from "@/lib/database/models/quotation.model";
import { updateQuotation } from "@/lib/actions/quotation.actions";
import { createTrack } from "@/lib/actions/track.actions";
import { Types } from "mongoose";
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
  agency,
  allCourse,
  allServices,
  isQuotationAccepted,
}: {
  data: ILead | IQuotation;
  isAdmin: boolean;
  agency?: string;
  allCourse: ICourse[];
  allServices: IServices[];
  isQuotationAccepted: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const canEdit = isAdmin || (Boolean(agency) && !isQuotationAccepted);

  // Courses & Services states
  const expandCourses = (course: ICourse): SelectedCourse[] => {
    return (
      course.campuses?.flatMap((ca) => {
        const variants: SelectedCourse[] = [];

        if (ca.shifts.morning > 0) {
          variants.push({
            name: course.name,
            courseDuration: course.courseDuration,
            courseType: course.courseType,
            startDate: course.startDate
              ? new Date(course.startDate)
              : undefined,
            endDate: course.endDate ? new Date(course.endDate) : undefined,
            campus: { name: ca.campus, shift: "morning" },
            courseFee: course.courseFee || "0",
          });
        }

        if (ca.shifts.afternoon > 0) {
          variants.push({
            name: course.name,
            courseDuration: course.courseDuration,
            courseType: course.courseType,
            startDate: course.startDate
              ? new Date(course.startDate)
              : undefined,
            endDate: course.endDate ? new Date(course.endDate) : undefined,
            campus: { name: ca.campus, shift: "afternoon" },
            courseFee: course.courseFee || "0",
          });
        }

        return variants;
      }) || []
    );
  };

  const expandedCourses = useMemo(
    () => allCourse?.flatMap(expandCourses) || [],
    [allCourse]
  );

  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>(
    (data.course ?? []).map((c) => ({
      ...c,
      campus: c.campus ?? { name: "", shift: "" },
    }))
  );

  const [selectedServices, setSelectedServices] = useState<IService[]>(
    (data.services ?? []).map((s) => ({
      _id: new Types.ObjectId(s._id),
      title: s.title,
      serviceType: s.serviceType || "",
      amount: Number(s.amount) || 0,
      description: s.description || "",
    }))
  );

  const [discount, setDiscount] = useState<string>(
    data.discount ? data.discount.toString() : ""
  );

  const [loading, setLoading] = useState(false);

  const discountNumber = Number(discount) || 0;

  const subTotal =
    selectedCourses.reduce((sum, c) => sum + Number(c.courseFee || 0), 0) +
    selectedServices.reduce((sum, s) => sum + s.amount, 0);

  const grandTotal = subTotal - discountNumber;

  const courseKey = (course: SelectedCourse) =>
    `${course.name}-${course.campus?.name}-${course.campus?.shift}`;

  // Toggle services & courses
  const toggleCourse = (course: SelectedCourse) => {
    const exists = selectedCourses.some(
      (c) => courseKey(c) === courseKey(course)
    );
    setSelectedCourses(
      exists
        ? selectedCourses.filter((c) => courseKey(c) !== courseKey(course))
        : [...selectedCourses, course]
    );
  };

  const toggleService = (service: IServices) => {
    const exists = selectedServices.some((s) => s._id === service._id);
    if (exists) {
      setSelectedServices(
        selectedServices.filter((s) => s._id !== service._id)
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
        course: selectedCourses.map((c) => ({
          ...c,
          courseFee: c.courseFee?.toString() || "0",
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
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary-800">
          Services & Fees
        </h2>
        {canEdit && (
          <>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Edit
              </Button>
            )}
          </>
        )}
      </div>

      {/* Course Selection */}
      {isEditing ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {expandedCourses.map((course) => {
            const isSelected = selectedCourses.some(
              (c) =>
                c.name === course.name &&
                c.campus?.name === course.campus?.name &&
                c.campus?.shift === course.campus?.shift
            );
            return (
              <div
                key={courseKey(course)}
                className={`flex-shrink-0 rounded-xl border p-4 shadow-md
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
        w-[280px] md:w-[300px] transition-all duration-200
        ${isSelected ? "border-blue-600 dark:border-blue-500 scale-105" : ""}`}
              >
                <h4 className="font-semibold mb-1">{course.name}</h4>
                <p className="text-sm text-gray-600">
                  Type: {course.courseType}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {course.courseDuration}
                </p>
                <p className="text-sm text-gray-600">
                  Start:{" "}
                  {course.startDate
                    ? new Date(course.startDate).toLocaleDateString()
                    : "-"}
                </p>
                <p className="text-sm text-gray-600">
                  Campus: {course.campus?.name} ({course.campus?.shift})
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Fee: €{course.courseFee}
                </p>
                <button
                  type="button"
                  onClick={() => toggleCourse(course)}
                  className={`w-full py-2 rounded-md font-medium text-sm
          ${
            isSelected
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
          }`}
                >
                  {isSelected ? "Selected ✅" : "Select Course"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        selectedCourses.map((course) => (
          <div
            key={courseKey(course)}
            className="flex justify-between border-b border-gray-200 dark:border-gray-500 pb-2"
          >
            <div>
              <p className="font-medium">{course.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {course.courseType} • {course.courseDuration}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {course.startDate
                  ? new Date(course.startDate).toLocaleDateString()
                  : "-"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-1 truncate max-w-64">
                Campus:{" "}
                {course.campus
                  ? `${course.campus.name} (${course.campus.shift})`
                  : "-"}
              </p>
            </div>
            <p>€{Number(course.courseFee).toFixed(2)}</p>
          </div>
        ))
      )}

      {/* Services Selection */}
      {isEditing ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {allServices.map((service, idx) => {
            const isSelected = selectedServices.some(
              (s) => s._id === service._id
            );
            return (
              <div
                key={idx}
                className={`flex-shrink-0 rounded-xl border p-4 shadow-md
                  bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
                  w-[260px] md:w-[300px] transition-all duration-200
                  ${
                    isSelected
                      ? "border-blue-600 dark:border-blue-500 scale-105"
                      : ""
                  }`}
              >
                <h4 className="font-semibold mb-1">{service.title}</h4>
                <p className="text-sm text-gray-600">
                  Type: {service.serviceType}
                </p>
                <p className="text-sm text-gray-600">
                  Amount: €{service.amount}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {service.description}
                </p>
                <button
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`w-full py-2 rounded-md font-medium text-sm
                    ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {isSelected ? "Selected ✅" : "Select Service"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        selectedServices.map((service, idx) => (
          <div
            key={idx}
            className="flex justify-between border-b border-gray-200 dark:border-gray-500 pb-2"
          >
            <div>
              <p className="font-medium">{service.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {service.serviceType || "Additional service"}
              </p>
            </div>
            <p>€{service.amount.toFixed(2)}</p>
          </div>
        ))
      )}

      {/* Subtotal */}
      <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-100 pt-2">
        <p>Subtotal</p>
        <p>€{subTotal.toFixed(2)}</p>
      </div>

      {/* Discount */}
      <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-100 pt-2">
        <p>Discount</p>
        {isEditing ? (
          <Input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="0"
            min={0}
            className="w-28"
          />
        ) : (
          <p>- €{discount}</p>
        )}
      </div>

      {/* Grand Total */}
      <div className="flex justify-between font-bold text-primary-800 pt-2">
        <p>Total</p>
        <p>€{grandTotal.toFixed(2)}</p>
      </div>
    </div>
  );
}
