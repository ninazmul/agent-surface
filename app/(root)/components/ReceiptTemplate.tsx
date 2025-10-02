import { ILead } from "@/lib/database/models/lead.model";
import { IProfile } from "@/lib/database/models/profile.model";
import Image from "next/image";

type ReceiptTemplateProps = {
  lead: ILead;
  agency: IProfile;
};

interface IServices {
  title: string;
  serviceType: string;
  amount: number;
}

interface ICourseMapped {
  name: string;
  startDate?: string | Date;
  fee: number;
}

export default function ReceiptTemplate({
  lead,
  agency,
}: ReceiptTemplateProps) {
  // === Map services ===
  const services: IServices[] = (lead.services || []).map((s) => ({
    title: s.title,
    serviceType: s.serviceType,
    amount: Number(s.amount) || 0,
  }));

  // === Map courses ===
  const courses: ICourseMapped[] = Array.isArray(lead.course)
    ? lead.course.map((c) => ({
        name: c.name,
        startDate: c.startDate,
        fee: Number(c.courseFee) || 0,
      }))
    : [];

  // === Totals ===
  const courseAmount = courses.reduce((sum, c) => sum + c.fee, 0);
  const discount = Number(lead.discount) || 0;
  const subTotal =
    courseAmount + services.reduce((sum, s) => sum + s.amount, 0);
  const grandTotal = subTotal - discount;

  // === Transcript Totals & Last Payment ===
  const transcriptTotal = Array.isArray(lead.transcript)
    ? lead.transcript.reduce(
        (sum: number, t: { amount?: string | number }) =>
          sum + Number(t.amount || 0),
        0
      )
    : 0;

  const lastPayment =
    Array.isArray(lead.transcript) && lead.transcript.length > 0
      ? lead.transcript[lead.transcript.length - 1]
      : null;

  const balance = grandTotal - transcriptTotal;

  // === Format helpers ===
  const formatDate = (date: string | Date | undefined) =>
    date
      ? new Date(date).toLocaleDateString("en-IE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "N/A";

  const today = new Date().toLocaleDateString("en-IE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="relative w-[210mm] min-h-[297mm] p-10 bg-white text-gray-800 font-serif">
      {/* === PAID Watermark === */}
      {lead?.paymentStatus && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <Image
            src="/assets/images/paid.png"
            alt="Paid Stamp"
            width={600}
            height={600}
            unoptimized
            className="opacity-20 rotate-[-20deg] object-contain"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-300 mb-6 pb-2">
        <div className="h-20 w-auto relative">
          <Image
            src="/assets/images/placeholder.png"
            alt="Agent Surface Logo"
            width={150}
            height={80}
            unoptimized
            className="object-contain"
          />
        </div>

        <div className="text-right text-xs leading-5 space-y-0.5 text-gray-700">
          <p>33 Gardiner Place, Dublin 1 • Ireland +353 1 878 8616</p>
          <p>
            info@academicbridge.ie •{" "}
            <span className="font-semibold text-primary-700">
              www.academicbridge.ie
            </span>
          </p>
        </div>
      </div>

      {/* Receipt Title */}
      <div className="flex justify-between items-start border-b border-gray-300 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-primary-700">
            Receipt #{lead._id.slice(-4)}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Date: {today}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Seller: <span className="font-medium">{agency?.name || "N/A"}</span>
          </p>
        </div>
      </div>

      {/* Section Title */}
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
        Payment Confirmation
      </h3>
      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        This is to confirm that the student named below has paid for a place on
        an English Language course (subject to standard terms and conditions) at
        Agent Surface. The particulars for this admission are as below.
      </p>

      {/* Student Details */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-primary-800">
          Student Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <p>
            <strong>Name:</strong> {lead.name}
          </p>
          <p>
            <strong>Email:</strong> {lead.email}
          </p>
          <p>
            <strong>Phone:</strong> {lead.number}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {lead.dateOfBirth
              ? new Date(lead.dateOfBirth).toLocaleDateString("en-IE")
              : "N/A"}
          </p>
          {courses.length > 0 && (
            <p>
              <strong>Start Date(s):</strong>{" "}
              {courses.map((c) => formatDate(c.startDate)).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Course & Services */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-primary-800">
          Course & Services
        </h2>
        <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          {courses.map((course, idx) => (
            <li key={idx}>
              {course.name} ({formatDate(course.startDate)}): €
              {course.fee.toFixed(2)}
            </li>
          ))}
          {services.map((service, idx) => (
            <li key={idx}>
              {service.title} ({service.serviceType || "Service"}): €
              {service.amount.toFixed(2)}
            </li>
          ))}
          {discount > 0 && (
            <li className="text-red-600 dark:text-red-400">
              Discount Applied: - €{discount.toFixed(2)}
            </li>
          )}
        </ul>
      </div>

      {/* Programme Price */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-primary-800">
          Programme Price
        </h2>
        <div className="text-sm text-right bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-1">
          <p>
            <strong>Total Cost of Programme:</strong> €{subTotal.toFixed(2)}
          </p>
          <p>
            <strong>Total of Payments:</strong> €{transcriptTotal.toFixed(2)}
          </p>
          <p>
            <strong>Last Payment:</strong>{" "}
            {lastPayment
              ? `€${Number(lastPayment.amount || 0).toFixed(2)}`
              : "N/A"}
          </p>
          <p>
            <strong>Balance:</strong> €{balance.toFixed(2)}
          </p>
          <p>
            <strong>Payment Method:</strong>{" "}
            {lastPayment?.method || lead.paymentMethod || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
