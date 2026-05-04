import QRCode from "@/components/shared/QRCode";
import { ILead } from "@/lib/database/models/lead.model";
import Image from "next/image";

type OfferLetterTemplateProps = {
  lead: ILead;
};

interface IServices {
  title: string;
  serviceType: string;
  amount: number;
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-IE", { style: "currency", currency: "EUR" });
}

export default function OfferLetterTemplate({
  lead,
}: OfferLetterTemplateProps) {
  const services: IServices[] = (lead.services || []).map((s) => ({
    title: s.title,
    serviceType: s.serviceType,
    amount: Number(s.amount) || 0,
  }));

  const courseAmount = Array.isArray(lead.course)
    ? lead.course.reduce((sum, s) => sum + Number(s.courseFee || 0), 0)
    : 0;
  const discount = Number(lead.discount) || 0;
  const subTotal =
    courseAmount + services.reduce((sum, s) => sum + s.amount, 0);
  const grandTotal = Math.max(0, subTotal - discount);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="print-container max-w-[794px] min-h-[1122px] mx-auto bg-white shadow p-6 text-gray-900 font-serif text-[14px] leading-[1.6] print:text-black print:bg-white relative">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-300 mb-6 pb-2">
        <div className="h-20 w-auto relative">
          <Image
            src="/assets/images/logo.png"
            alt="AB Partner Portal Logo"
            width={150}
            height={80}
            className="object-contain dark:hidden"
            unoptimized
          />
          <Image
            src="/assets/images/logo-white.png"
            alt="AB Partner Portal Logo"
            width={150}
            height={80}
            className="object-contain hidden dark:block"
            unoptimized
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

      {/* Date */}
      <p className="text-right mb-4">{today}</p>

      {/* Title */}
      <h1 className="text-center text-[16px] font-bold underline mb-6">
        CONDITIONAL ENROLMENT LETTER
      </h1>

      {/* Main two-column layout */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: student & course details (spans 2 on large screens) */}
        <section className="lg:col-span-2">
          <p className="mb-4">Dear Sir/Madam,</p>
          <p className="mb-4">
            This is to confirm that we have reserved a place on a course at
            Academic Bridge English School (subject to standard terms and
            conditions) for the student as per the admission particulars listed
            below:
          </p>

          {/* Student Details */}
          <h2 className="font-semibold mb-2">Student Details</h2>
          <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
            <p>
              <strong>Name:</strong> {lead?.name || "TBA"}
            </p>
            <p>
              <strong>Date of Birth:</strong>{" "}
              {lead?.dateOfBirth
                ? new Date(lead.dateOfBirth).toLocaleDateString()
                : "TBA"}
            </p>
            <p>
              <strong>Nationality:</strong> {lead?.home?.country || "TBA"}
            </p>
            <p>
              <strong>Passport No.:</strong> {lead?.passport?.number || "N/A"}
            </p>
            <p>
              <strong>Passport Exp Date:</strong>{" "}
              {lead?.passport?.expirationDate
                ? new Date(lead.passport.expirationDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          {/* Course Details */}
          <h2 className="font-semibold mb-2">Course Details</h2>
          {Array.isArray(lead.course) && lead.course.length > 0 ? (
            lead.course.map((c, idx) => (
              <div
                key={idx}
                className="mb-4 p-3 border border-gray-100 rounded-sm"
              >
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <p>
                    <strong>Course:</strong> {c?.name || "TBA"}
                  </p>
                  <p>
                    <strong>Type:</strong> {c?.courseType || "N/A"}
                  </p>
                  <p>
                    <strong>Duration:</strong> {c?.courseDuration || "N/A"}
                  </p>
                  <p>
                    <strong>Shift:</strong>{" "}
                    {c?.campus?.shift === "morning"
                      ? "Morning"
                      : c?.campus?.shift === "afternoon"
                        ? "Afternoon"
                        : "N/A"}
                  </p>
                  <p>
                    <strong>Commence Date:</strong>{" "}
                    {c?.startDate
                      ? new Date(c.startDate).toLocaleDateString()
                      : "TBA"}
                  </p>
                  <p>
                    <strong>Completion Date:</strong>{" "}
                    {c?.endDate
                      ? new Date(c.endDate).toLocaleDateString()
                      : "TBA"}
                  </p>
                  <p>
                    <strong>Tuition Fees:</strong>{" "}
                    <span className="text-green-700 font-semibold">
                      {formatCurrency(Number(c?.courseFee || 0))}
                    </span>
                  </p>
                  <p>
                    <strong>Campus:</strong> {c?.campus?.name || "N/A"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm mb-4">
              Course details: <strong>TBA</strong>
            </p>
          )}

          {/* Services (if any) */}
          {services.length > 0 && (
            <>
              <h3 className="font-semibold mb-2">Additional Services</h3>
              <ul className="mb-4 text-sm list-disc list-inside">
                {services.map((s, i) => (
                  <li key={i}>
                    <strong>{s.title}</strong> — {s.serviceType} :{" "}
                    <span className="text-green-700 font-semibold">
                      {formatCurrency(s.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="mb-4">
            You are requested to pay your fees in advance prior to course
            commencement in order to secure your place. Should payment not be
            received in advance your place will be forfeited.
          </p>

          {/* Bank details */}
          <div className="mb-6 text-sm">
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <p>
                <strong>Bank:</strong> AIB (Allied Irish Banks)
              </p>
              <p>
                <strong>Account Name:</strong> AB Partner Portal LIMITED
              </p>
              <p>
                <strong>Account No.:</strong> 50998180
              </p>
              <p>
                <strong>Sort Code:</strong> 931101
              </p>
              <p>
                <strong>SWIFT:</strong> AIBKIE2D
              </p>
              <p>
                <strong>IBAN:</strong> IE30AIBK93110150998180
              </p>
              <p className="sm:col-span-2">
                <strong>Address:</strong> 126 Capel Street, Dublin 1
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="mb-10">
            <p>Yours faithfully,</p>
            <p className="font-bold mt-2">Md Shafikul Islam</p>
            <p className="text-sm">Managing Director</p>
          </div>
        </section>

        {/* Right column: totals, summary, QR code */}
        <aside className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-3">Fee Summary</h3>
            <div className="text-sm bg-gray-50 p-3 rounded border border-gray-100">
              <div className="flex justify-between mb-2">
                <span>Tuition Total</span>
                <span>{formatCurrency(courseAmount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Services</span>
                <span>
                  {formatCurrency(services.reduce((s, it) => s + it.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Discount</span>
                <span>- {formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 font-semibold">
                <span>Grand Total</span>
                <span className="text-green-700">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* QR code and verification block aligned to bottom-right */}
          <div className="mt-6 text-sm">
            <p className="mb-2">
              To verify this document scan the QR code:
            </p>
            <div className="flex justify-end items-end">
              <div className="w-32 h-32">
                <QRCode
                  url={`${process.env.NEXT_PUBLIC_APP_URL}/verify/${lead?._id}`}
                />
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Print footer note */}
      <footer className="absolute left-6 right-6 bottom-4 text-xs text-gray-500 text-center print:text-gray-700">
        <span>
          Academic Bridge English School • Conditional enrolment is subject to
          terms and conditions.
        </span>
      </footer>
    </div>
  );
}
