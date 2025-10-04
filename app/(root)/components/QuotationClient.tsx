"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";
import QuotationEditor from "@/app/(root)/components/QuotationEditor";
import QuotationStatusUpdater from "@/app/(root)/components/QuotationStatusUpdater";
import QuotationDownloader from "@/app/(root)/components/QuotationDownloader";
import CopyQuotationButton from "@/app/(root)/components/CopyQuotationButton";
import PdfIframe from "@/app/(root)/components/PdfViewer";
import { ILead } from "@/lib/database/models/lead.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { IServices } from "@/lib/database/models/service.model";
import { ICourse } from "@/lib/database/models/course.model";
import QuotationVoidStatusUpdater from "./QuotationVoidStatusUpdater";
import { IQuotation } from "@/lib/database/models/quotation.model";

const steps = [
  { id: 1, label: "Validate your Quote" },
  { id: 2, label: "Accept Terms and Conditions" },
  { id: 3, label: "Submit your Application Form" },
];

export default function QuotationClient({
  lead,
  quotation,
  agency,
  course,
  services,
  today,
  hasAccess,
}: {
  lead: ILead | null;
  quotation: IQuotation | null;
  agency: IProfile | null;
  course: ICourse[];
  services: IServices[];
  today: string;
  hasAccess: boolean;
}) {
  const data = lead || quotation;

  const [accepted, setAccepted] = useState(false);
  const [language, setLanguage] = useState("en");
  const [currentStep, setCurrentStep] = useState(1);
  const [quotationAccepted, setQuotationAccepted] = useState<boolean>(
    data?.quotationStatus || false
  );

  useEffect(() => {
    if (data?.quotationStatus) {
      setQuotationAccepted(true);
      setCurrentStep(3);
    }
  }, [data?.quotationStatus]);

  // ✅ Safe conditional render AFTER hooks
  if (!data) {
    return <p>No data available.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Logo */}
      <div className="flex items-center justify-center">
        <div className="relative w-40 sm:w-48 lg:w-56 h-auto">
          <Image
            src="/assets/images/logo.png"
            alt="Agent Surface Logo"
            fill
            className="object-contain dark:hidden"
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 224px"
          />
          <Image
            src="/assets/images/logo-white.png"
            alt="Agent Surface Logo"
            fill
            className="object-contain hidden dark:block"
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 224px"
          />
        </div>
      </div>

      <div className="m-4 p-6 bg-white dark:bg-gray-900 text-primary-900 dark:text-gray-100 font-serif shadow-xl rounded-2xl print-container">
        {/* Progress Steps */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-6">
          {steps.map((step, idx) => {
            const isCompleted =
              step.id < currentStep || (step.id === 3 && quotationAccepted);
            const isActive =
              step.id === currentStep ||
              (step.id === 3 && quotationAccepted && currentStep >= 3);

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    isCompleted
                      ? "text-green-600"
                      : isActive
                      ? "text-primary-600"
                      : "text-gray-400"
                  }`}
                >
                  {/* ✅ Icon */}
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}

                  {/* ✅ Show step number on small screens, label on md+ */}
                  <span className="md:hidden text-xs font-semibold">
                    {step.id}
                  </span>
                  <span className="hidden md:inline text-sm font-medium whitespace-nowrap">
                    {step.label}
                  </span>
                </div>

                {/* Connector line (hidden on mobile to avoid layout breaks) */}
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block w-10 border-t border-gray-300 mx-2" />
                )}
              </div>
            );
          })}
        </div>
        {/* STEP 1: Quotation */}{" "}
        {currentStep === 1 && (
          <div className="">
            {" "}
            {/* Quotation Header + Editor + Agency/Payment */}{" "}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
              {" "}
              <Image
                src="/assets/images/logo.png"
                alt="Agent Surface Logo"
                width={120}
                height={120}
                className="object-contain dark:hidden"
              />
              <Image
                src="/assets/images/logo-white.png"
                alt="Agent Surface Logo"
                width={120}
                height={120}
                className="object-contain hidden dark:block"
              />
              <div className="text-right text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                {" "}
                <p>
                  33 Gardiner Place, Dublin 1 • Ireland +353 1 878 8616
                </p>{" "}
                <p>
                  {" "}
                  info@academicbridge.ie •{" "}
                  <span className="font-semibold text-primary-700">
                    {" "}
                    www.academicbridge.ie{" "}
                  </span>{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {" "}
              <div className="lg:col-span-2">
                {" "}
                <h1 className="text-2xl font-extrabold uppercase mb-2 text-primary-700">
                  {" "}
                  Quotation{" "}
                </h1>{" "}
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  {" "}
                  <span className="font-medium">Issue Date:</span> {today}{" "}
                </p>{" "}
              </div>{" "}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-md p-3 text-sm shadow-sm">
                {" "}
                <h2 className="text-sm font-semibold text-primary-800 border-b pb-1 mb-2">
                  {" "}
                  Student Information{" "}
                </h2>{" "}
                <div className="space-y-1 text-gray-700 dark:text-gray-100">
                  {" "}
                  <p>
                    {" "}
                    <span className="font-medium">Name:</span> {data.name}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <span className="font-medium">Email:</span> {data.email}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <span className="font-medium">Phone:</span> {data.number}{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <QuotationEditor
              data={data}
              isAdmin={hasAccess}
              allCourse={course}
              allServices={services}
              isQuotationAccepted={quotationAccepted}
            />{" "}
            {/* Agency + Payment */}{" "}
            {agency ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-6">
                {" "}
                {/* Agency Details */}{" "}
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 rounded-xl p-4 shadow-sm">
                  {" "}
                  <h2 className="text-xl font-semibold mb-3 text-primary-800">
                    {" "}
                    Agency Details{" "}
                  </h2>{" "}
                  <p>
                    {" "}
                    <strong>Agency:</strong> {agency?.name || "N/A"}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <strong>Email:</strong> {agency?.email || "N/A"}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <strong>Phone:</strong> {agency?.number || "N/A"}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <strong>Address:</strong> {agency?.location || "N/A"}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <strong>Country:</strong> {agency?.country || "N/A"}{" "}
                  </p>{" "}
                </div>{" "}
                {/* Payment Info */}{" "}
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 rounded-xl p-4 shadow-sm">
                  {" "}
                  <h2 className="text-xl font-semibold mb-3 text-primary-800">
                    {" "}
                    Payment Info{" "}
                  </h2>{" "}
                  <p>
                    {" "}
                    <strong>Bank:</strong> {agency?.bankName || "N/A"}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <strong>Account No:</strong>{" "}
                    {agency?.accountNumber || "N/A"}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <strong>SWIFT:</strong> {agency?.swiftCode || "N/A"}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <strong>Routing No:</strong>{" "}
                    {agency?.routingNumber || "N/A"}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <strong>Branch:</strong> {agency?.branchAddress || "N/A"}{" "}
                  </p>{" "}
                </div>{" "}
              </div>
            ) : (
              <p className="text-red-500 py-4">Agency info not available.</p>
            )}{" "}
            <div className="flex justify-end">
              {" "}
              <Button size={"sm"} onClick={() => setCurrentStep(2)}>
                {" "}
                Next{" "}
              </Button>{" "}
            </div>{" "}
          </div>
        )}
        {/* STEP 2 */}
        {currentStep === 2 && (
          <div>
            <div className="flex justify-end mb-3">
              <Tabs defaultValue="en" onValueChange={(val) => setLanguage(val)}>
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="pt">Portuguese</TabsTrigger>
                  <TabsTrigger value="es">Spanish</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="border rounded-lg shadow-md h-[60vh] overflow-hidden mb-4">
              <PdfIframe language={language} />
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t pt-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="w-4 h-4"
                />
                I declare that I have read and agreed with the terms and
                conditions
              </label>
              <div className="flex items-center gap-4">
                <Button
                  size={"sm"}
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  ← Previous
                </Button>
                <Button
                  size={"sm"}
                  onClick={() => setCurrentStep(3)}
                  disabled={!accepted}
                >
                  Accept and Continue
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="">
            {/* Header */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6 text-primary-700">
              🎉 Final Step: Confirm Your Quotation
            </h1>

            {/* Info Box */}
            <div className="p-5 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-md shadow-md text-gray-800 dark:text-gray-100 mb-6">
              <p className="text-base md:text-lg leading-relaxed">
                Please review the details of your quotation carefully. If you
                agree with the terms and the quotation for the university
                admission process, confirm below to proceed with the next steps
                in your application.
              </p>
            </div>

            {/* Review Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Student Info */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 text-primary-800">
                  Student Information
                </h2>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-100">
                  <li>
                    <strong>Name:</strong> {data.name}
                  </li>
                  <li>
                    <strong>Email:</strong> {data.email}
                  </li>
                  <li>
                    <strong>Phone:</strong> {data.number}
                  </li>
                  <li>
                    <strong>Course:</strong> {data.course?.[0]?.name || "N/A"}
                  </li>
                </ul>
              </div>

              {/* Agency Info */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 text-primary-800">
                  Agency Information
                </h2>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-100">
                  <li>
                    <strong>Agency:</strong> {agency?.name || "N/A"}
                  </li>
                  <li>
                    <strong>Email:</strong> {agency?.email || "N/A"}
                  </li>
                  <li>
                    <strong>Phone:</strong> {agency?.number || "N/A"}
                  </li>
                  <li>
                    <strong>Country:</strong> {agency?.country || "N/A"}
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirmation */}
            <div className="bg-green-50 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-xl p-6 text-center shadow-md mb-6">
              <p className="text-lg font-medium text-green-800 dark:text-green-100 mb-4">
                ✅ Confirm your quotation below to move forward with your
                application.
              </p>

              {/* Accept Quotation */}
              <QuotationStatusUpdater
                data={data}
                isVoid={data.isVoid || false}
                onAccepted={() => {
                  setQuotationAccepted(true);
                  setCurrentStep(3);
                }}
              />

              {/* Void Quotation */}
              {hasAccess && (
                <div className="mt-4">
                  <QuotationVoidStatusUpdater data={data} />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 mt-6">
              <Button
                size={"sm"}
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                ← Previous
              </Button>
              <div className="flex gap-2">
                <QuotationDownloader data={data} agency={agency} />
                <CopyQuotationButton quotationId={data._id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
