import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { redirect } from "next/navigation";
import { getLeadById } from "@/lib/actions/lead.actions";
import ReceiptDownloader from "@/app/(root)/components/ReceiptDownloader";
import Image from "next/image";
import { ICourse } from "@/lib/database/models/course.model";

type PageProps = {
  params: Promise<{ id: string }>;
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

const Receipt = async ({ params }: PageProps) => {
  const { id } = await params;

  const lead = await getLeadById(id);
  if (!lead) return redirect(`/quotation/${id}/receipt`);

  const agencyEmail = lead?.author;
  const agency = await getProfileByEmail(agencyEmail);

  // === Services ===
  const services: IServices[] = (lead.services || []).map((s: IServices) => ({
    title: s.title,
    serviceType: s.serviceType,
    amount: Number(s.amount) || 0,
  }));

  // === Courses ===
  const courses: ICourseMapped[] = Array.isArray(lead.course)
    ? lead.course.map((c: ICourse) => ({
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

  // === Transcript Totals ===
  const transcriptTotal = Array.isArray(lead.transcript)
    ? lead.transcript.reduce((sum: number, t: { amount?: string | number }) => {
        return sum + Number(t.amount || 0);
      }, 0)
    : 0;

  // Last payment info (if any)
  const lastPayment =
    Array.isArray(lead.transcript) && lead.transcript.length > 0
      ? lead.transcript[lead.transcript.length - 1]
      : null;

  // Balance = grandTotal - total of transcript payments
  const balance = grandTotal - transcriptTotal;

  // === Helpers ===
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
    <div className="m-6 p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-serif shadow-xl rounded-2xl max-w-4xl mx-auto print-container border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <Image
          src="/assets/images/logo.png"
          alt="Agent Surface Logo"
          width={150}
          height={80}
          className="object-contain dark:hidden"
        />
        <Image
          src="/assets/images/logo-white.png"
          alt="Agent Surface Logo"
          width={150}
          height={80}
          className="object-contain hidden dark:block"
        />
        <div className="text-right text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
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
            Receipt #{lead._id.toString().slice(-4)}
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
            <strong>Last Payment:</strong> €
            {lastPayment ? Number(lastPayment.amount).toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>Balance:</strong> €{balance.toFixed(2)}
          </p>
          <p>
            <strong>Payment Method:</strong> {lastPayment?.method || "N/A"}
          </p>
        </div>
      </div>

      {/* Divider and Print */}
      <div className="border-t border-gray-300 my-6" />
      <div className="flex justify-end no-print">
        <ReceiptDownloader lead={lead} agency={agency} />
      </div>
    </div>
  );
};

export default Receipt;
