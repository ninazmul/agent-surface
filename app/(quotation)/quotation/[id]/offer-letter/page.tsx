import OfferLetterDownloader from "@/app/(root)/components/OfferLetterDownloader";
import { getLeadById } from "@/lib/actions/lead.actions";
import { ICourse } from "@/lib/database/models/course.model";
import Image from "next/image";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

interface IServices {
  title: string;
  serviceType: string;
  amount: number;
}

const OfferLetter = async ({ params }: PageProps) => {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead || lead.progress !== "Converted") {
    return redirect(`/leads/${id}`);
  }

  const services: IServices[] = (lead.services || []).map((s: IServices) => ({
    title: s.title,
    serviceType: s.serviceType,
    amount: Number(s.amount) || 0,
  }));

  // ✅ Handle both single course and array of courses
  const courses: ICourse[] = Array.isArray(lead.course)
    ? lead.course
    : [lead.course].filter(Boolean);

  // ✅ Typed reducers
  const courseAmount = courses.reduce(
    (sum: number, c) => sum + Number(c?.courseFee || 0),
    0
  );

  const discount = Number(lead.discount) || 0;
  const subTotal =
    courseAmount + services.reduce((sum: number, s) => sum + s.amount, 0);
  const grandTotal = subTotal - discount;

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="m-4 p-6 bg-white dark:bg-gray-900 text-primary-900 dark:text-gray-100 font-serif shadow-xl rounded-2xl print-container max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <Image
          src="/assets/images/placeholder.png"
          alt="Academic Bridge Logo"
          width={120}
          height={120}
          className="object-contain"
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

      {/* Date */}
      <p className="text-right mb-4">{today}</p>

      {/* Title */}
      <h1 className="text-center text-[16px] font-bold underline mb-5">
        CONDITIONAL ENROLMENT LETTER
      </h1>

      {/* Body */}
      <p className="mb-4">Dear Sir/Madam,</p>
      <p className="mb-4">
        This is to confirm that we have reserved a place on a course at Academic
        Bridge English School (subject to standard terms and conditions) for the
        student as per the admission particulars listed below:
      </p>

      {/* Student Details */}
      <h2 className="font-semibold mb-2">Student Details</h2>
      <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
        <p>
          <strong>Name:</strong> {lead.name}
        </p>
        <p>
          <strong>Date of Birth:</strong>{" "}
          {lead.dateOfBirth
            ? new Date(lead.dateOfBirth).toLocaleDateString()
            : "TBA"}
        </p>
        <p>
          <strong>Nationality:</strong> {lead?.passport?.country || "TBA"}
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
      {courses.length > 0 ? (
        courses.map((c, idx) => (
          <div
            key={idx}
            className="grid grid-cols-2 gap-y-2 text-sm mb-4 border-b border-gray-200 pb-3"
          >
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
              {c?.campuses?.[0]?.shifts
                ? Object.keys(c.campuses[0].shifts).join(", ")
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
              {c?.endDate ? new Date(c.endDate).toLocaleDateString() : "TBA"}
            </p>
            <p>
              <strong>Tuition Fees:</strong>{" "}
              <span className="text-green-700 font-semibold">
                €{Number(c?.courseFee) || 0}
              </span>
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm mb-4">No course information available.</p>
      )}

      {/* Totals */}
      <div className="grid grid-cols-2 text-sm mb-4">
        <p>
          <strong>Total Fees:</strong>{" "}
          <span className="text-green-700 font-semibold">
            €{grandTotal || "TBA"}
          </span>
        </p>
      </div>

      {/* Payment Instructions */}
      <p className="mb-4">
        You are requested to pay your fees in advance prior to course
        commencement in order to secure your place. Should payment not be
        received in advance your place will be forfeited. The full tuition fees
        are payable in advance to:
      </p>

      <div className="mb-6 grid grid-cols-2 gap-y-1 text-sm leading-[1.4]">
        <p>
          <strong>Bank:</strong> AIB (Allied Irish Banks)
        </p>
        <p>
          <strong>Account Name:</strong> ACADEMIC BRIDGE LIMITED
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
        <p>
          <strong>Address:</strong> 126 Capel Street, Dublin 1
        </p>
      </div>

      {/* Signature */}
      <div className="mb-10">
        <p>Yours faithfully,</p>
        <p className="font-bold mt-1">Md Shafikul Islam</p>
        <p className="text-sm">Managing Director</p>
      </div>

      {/* Footer / QR code space */}
      <div className="h-28 mb-4" />

      {/* Validation */}
      <div className="text-[12px]">
        <p>
          <strong>QR Code Validation:</strong> {id.slice(0, 12)}
        </p>
        <p>
          <strong>Authentication:</strong>{" "}
          <a
            href={`https://dashboard.academicbridge.ie/validate?id=${id}`}
            className="text-blue-600 underline"
            target="_blank"
          >
            dashboard.academicbridge.ie/validate
          </a>
        </p>
      </div>

      {/* Print Button */}
      <div className="border-t border-gray-300 mt-4 pt-3 flex justify-end no-print">
        <OfferLetterDownloader lead={lead} />
      </div>
    </div>
  );
};

export default OfferLetter;
