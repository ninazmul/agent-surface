"use client";

import { useMemo, useState } from "react";
import { Types } from "mongoose";
import { Info } from "lucide-react";
import toast from "react-hot-toast";

import { updateLead } from "@/lib/actions/lead.actions";
import { updateQuotation } from "@/lib/actions/quotation.actions";
import { createTrack } from "@/lib/actions/track.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ILead } from "@/lib/database/models/lead.model";
import type { IServices } from "@/lib/database/models/service.model";
import type { ICourseByCountrySafe } from "@/lib/database/models/course.model";
import type { IQuotation } from "@/lib/database/models/quotation.model";
import {
  courseKey,
  normalizeCourses,
  type SelectableCourse,
} from "@/lib/utils";

interface ISelectedService {
  _id: Types.ObjectId;
  title: string;
  serviceType: string;
  amount: number;
  description?: string;
}

const toObjectId = (id: string | Types.ObjectId) => {
  return id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
};

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
  allCourse: ICourseByCountrySafe[];
  allServices: IServices[];
  isQuotationAccepted: boolean;
  userEmail?: string;
}) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const canEdit =
    isAdmin ||
    (userEmail &&
      data.author &&
      userEmail === data.author &&
      !isQuotationAccepted);

  const quoteCountry = data.home?.country;

  const expandedCourses = useMemo(() => {
    return normalizeCourses(allCourse || [], quoteCountry);
  }, [allCourse, quoteCountry]);

  const [selectedCourses, setSelectedCourses] = useState<SelectableCourse[]>(
    (data.course ?? []).map((course) => ({
      _id: course._id?.toString() || "",
      name: course.name,
      description: "",
      courseType: course.courseType || "General",
      courseDuration: course.courseDuration || "",
      startDate: course.startDate
        ? new Date(course.startDate).toISOString()
        : undefined,
      endDate: course.endDate
        ? new Date(course.endDate).toISOString()
        : undefined,
      campus: {
        name: course.campus?.name || "",
        shift:
          course.campus?.shift === "morning" ||
          course.campus?.shift === "afternoon" ||
          course.campus?.shift === "general"
            ? course.campus.shift
            : "general",
      },
      courseFee: course.courseFee?.toString() || "0",
    })),
  );

  const [selectedServices, setSelectedServices] = useState<ISelectedService[]>(
    (data.services ?? []).map((service) => ({
      _id: toObjectId(service._id),
      title: service.title,
      serviceType: service.serviceType || "",
      amount: Number(service.amount) || 0,
      description: service.description || "",
    })),
  );

  const [discount, setDiscount] = useState<string>(
    data.discount ? data.discount.toString() : "",
  );

  const discountNumber = Number(discount) || 0;

  const subTotal =
    selectedCourses.reduce(
      (sum, course) => sum + Number(course.courseFee || 0),
      0,
    ) + selectedServices.reduce((sum, service) => sum + service.amount, 0);

  const grandTotal = Math.max(0, subTotal - discountNumber);

  const toggleCourse = (course: SelectableCourse) => {
    const exists = selectedCourses.some(
      (selectedCourse) => courseKey(selectedCourse) === courseKey(course),
    );

    setSelectedCourses((current) =>
      exists
        ? current.filter(
            (selectedCourse) => courseKey(selectedCourse) !== courseKey(course),
          )
        : [...current, course],
    );
  };

  const toggleService = (service: IServices) => {
    const serviceId = service._id.toString();

    const exists = selectedServices.some(
      (selectedService) => selectedService._id.toString() === serviceId,
    );

    setSelectedServices((current) =>
      exists
        ? current.filter(
            (selectedService) => selectedService._id.toString() !== serviceId,
          )
        : [
            ...current,
            {
              _id: toObjectId(service._id),
              title: service.title,
              serviceType: service.serviceType || "",
              amount: Number(service.amount) || 0,
              description: service.description || "",
            },
          ],
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        course: selectedCourses
          .filter((course) => course._id)
          .map((course) => ({
            _id: course._id,
            name: course.name,
            courseType: course.courseType,
            courseDuration: course.courseDuration,
            startDate: course.startDate
              ? new Date(course.startDate)
              : undefined,
            endDate: course.endDate ? new Date(course.endDate) : undefined,
            campus: course.campus,
            courseFee: course.courseFee,
          })),
        discount: discountNumber.toString(),
        services: selectedServices.map((service) => ({
          _id: toObjectId(service._id),
          title: service.title,
          serviceType: service.serviceType,
          amount: service.amount.toString(),
          description: service.description,
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

  const renderCourseCard = (course: SelectableCourse, editable: boolean) => {
    const isSelected = selectedCourses.some(
      (selectedCourse) => courseKey(selectedCourse) === courseKey(course),
    );

    const key = `${editable ? "edit" : "view"}-course-${courseKey(course)}`;
    const isExpanded = expandedItem === key;

    return (
      <div
        key={courseKey(course)}
        className={`flex-shrink-0 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900 ${
          editable ? "w-[280px] md:w-[300px]" : ""
        } ${
          isSelected && editable
            ? "border-blue-600 dark:border-blue-500"
            : "border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold leading-tight">{course.name}</p>
            <p className="mt-1 text-sm text-gray-500">
              {course.courseType || "General"} •{" "}
              {course.courseDuration || "No duration"}
            </p>
            <p className="text-sm text-gray-500">
              {course.campus.name} • {course.campus.shift}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setExpandedItem(isExpanded ? null : key)}
            className="shrink-0 text-gray-500 transition hover:text-blue-600"
          >
            <Info size={16} />
          </button>
        </div>

        <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
          €{Number(course.courseFee || 0).toFixed(2)}
        </p>

        {isExpanded && (
          <div className="mt-3 space-y-2 border-t pt-3 text-xs text-gray-500">
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
              <p className="leading-relaxed text-gray-600">
                {course.description}
              </p>
            )}
          </div>
        )}

        {editable && (
          <Button
            type="button"
            onClick={() => toggleCourse(course)}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={`mt-4 w-full ${
              isSelected ? "bg-blue-600 text-white hover:bg-blue-700" : ""
            }`}
          >
            {isSelected ? "Selected" : "Select Course"}
          </Button>
        )}
      </div>
    );
  };

  const renderServiceCard = (service: IServices, editable: boolean) => {
    const isSelected = selectedServices.some(
      (selectedService) =>
        selectedService._id.toString() === service._id.toString(),
    );

    const key = `${editable ? "edit" : "view"}-service-${service._id}`;
    const isExpanded = expandedItem === key;

    return (
      <div
        key={service._id.toString()}
        className={`flex-shrink-0 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900 ${
          editable ? "w-[280px] md:w-[300px]" : ""
        } ${
          isSelected && editable
            ? "border-blue-600 dark:border-blue-500"
            : "border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold leading-tight">{service.title}</p>
            <p className="mt-1 text-sm text-gray-500">
              {service.serviceType || "Additional service"}
            </p>
          </div>

          {service.description && (
            <button
              type="button"
              onClick={() => setExpandedItem(isExpanded ? null : key)}
              className="shrink-0 text-gray-500 transition hover:text-blue-600"
            >
              <Info size={16} />
            </button>
          )}
        </div>

        <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
          €{Number(service.amount || 0).toFixed(2)}
        </p>

        {isExpanded && service.description && (
          <div className="mt-3 border-t pt-3 text-xs text-gray-500">
            <p className="leading-relaxed">{service.description}</p>
          </div>
        )}

        {editable && (
          <Button
            type="button"
            onClick={() => toggleService(service)}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={`mt-4 w-full ${
              isSelected ? "bg-blue-600 text-white hover:bg-blue-700" : ""
            }`}
          >
            {isSelected ? "Selected" : "Select Service"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary-800 sm:text-xl">
            Services & Fees
          </h2>
          {quoteCountry && (
            <p className="text-sm text-gray-500">
              Course fees are based on {quoteCountry}.
            </p>
          )}
        </div>

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
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold">Courses</h3>

        {isEditing ? (
          expandedCourses.length > 0 ? (
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
              {expandedCourses.map((course) => renderCourseCard(course, true))}
            </div>
          ) : (
            <p className="rounded-xl border bg-white p-4 text-sm text-gray-500 dark:bg-gray-900">
              No courses available for this country.
            </p>
          )
        ) : selectedCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {selectedCourses.map((course) => renderCourseCard(course, false))}
          </div>
        ) : (
          <p className="rounded-xl border bg-white p-4 text-sm text-gray-500 dark:bg-gray-900">
            No courses selected.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Services</h3>

        {isEditing ? (
          allServices.length > 0 ? (
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
              {allServices.map((service) => renderServiceCard(service, true))}
            </div>
          ) : (
            <p className="rounded-xl border bg-white p-4 text-sm text-gray-500 dark:bg-gray-900">
              No services available.
            </p>
          )
        ) : selectedServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {selectedServices.map((service) => (
              <div
                key={service._id.toString()}
                className="flex justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <div>
                  <p className="font-semibold">{service.title}</p>
                  <p className="text-sm text-gray-500">
                    {service.serviceType || "Additional service"}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  €{Number(service.amount || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border bg-white p-4 text-sm text-gray-500 dark:bg-gray-900">
            No services selected.
          </p>
        )}
      </section>

      <div className="space-y-3 border-t pt-4">
        <div className="flex justify-between text-sm font-semibold sm:text-base">
          <p>Subtotal</p>
          <p>€{subTotal.toFixed(2)}</p>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm font-semibold sm:text-base">
          <p>Discount</p>
          {isEditing ? (
            <Input
              type="number"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              min={0}
              max={subTotal}
              className="w-28 text-right"
            />
          ) : (
            <p>- €{discountNumber.toFixed(2)}</p>
          )}
        </div>

        <div className="flex justify-between border-t pt-3 text-lg font-bold text-primary-800 sm:text-xl">
          <p>Total</p>
          <p>€{grandTotal.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
