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

function formatCurrency(value: number) {
  return value.toLocaleString("en-IE", { style: "currency", currency: "EUR" });
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

  const courses: ICourse[] = Array.isArray(lead.course)
    ? lead.course
    : [lead.course].filter(Boolean);

  const courseAmount = courses.reduce((sum: number, c) => {
    if (!c?.campuses) return sum;

    const campusTotal = c.campuses.reduce((campusSum, campus) => {
      const morningFee = Number(campus.shifts?.morning?.fee || 0);
      const afternoonFee = Number(campus.shifts?.afternoon?.fee || 0);
      return campusSum + morningFee + afternoonFee;
    }, 0);

    return sum + campusTotal;
  }, 0);

  const discount = Number(lead.discount) || 0;
  const subTotal =
    courseAmount + services.reduce((sum: number, s) => sum + s.amount, 0);
  const grandTotal = Math.max(0, subTotal - discount);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative print:bg-white print:text-black">
      <div className="m-4 p-6 bg-white dark:bg-gray-900 text-primary-900 dark:text-gray-100 font-serif shadow-xl rounded-2xl print-container max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <Image
            src="/assets/images/logo.png"
            alt="AB Partner Portal Logo"
            width={120}
            height={120}
            className="object-contain dark:hidden"
          />
          <Image
            src="/assets/images/logo-white.png"
            alt="AB Partner Portal Logo"
            width={120}
            height={120}
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

        {/* Date */}
        <p className="text-right mb-4">{today}</p>

        {/* Title */}
        <h1 className="text-center text-[16px] font-bold underline mb-6">
          CONDITIONAL ENROLMENT LETTER
        </h1>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Student & Course details */}
          <section className="lg:col-span-2">
            <p className="mb-4">Dear Sir/Madam,</p>
            <p className="mb-4">
              This is to confirm that we have reserved a place on a course at
              Academic Bridge English School (subject to standard terms and
              conditions) for the student as per the admission particulars
              listed below:
            </p>

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
                <strong>Nationality:</strong>{" "}
                {lead?.passport?.country || lead?.home?.country || "TBA"}
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
              <p>
                <strong>Email:</strong> {lead?.email || "N/A"}
              </p>
            </div>

            <h2 className="font-semibold mb-2">Course Details</h2>
            {courses.length > 0 ? (
              courses.map((c, idx) => (
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
                      {c?.endDate
                        ? new Date(c.endDate).toLocaleDateString()
                        : "TBA"}
                    </p>
                    <div className="col-span-2 mt-2">
                      <strong>Tuition Fees by Campus</strong>
                      <div className="ml-3 mt-1 text-green-700 font-semibold text-sm">
                        {c?.campuses?.length ? (
                          c.campuses.map((campus, i) => (
                            <div key={i} className="mb-2">
                              <div className="font-medium">
                                {campus.campus || "Campus"}
                              </div>
                              <div className="text-sm">
                                <div>
                                  Morning: €
                                  {Number(campus.shifts?.morning?.fee || 0)} (
                                  {campus.shifts?.morning?.seats || 0} seats)
                                </div>
                                <div>
                                  Afternoon: €
                                  {Number(campus.shifts?.afternoon?.fee || 0)} (
                                  {campus.shifts?.afternoon?.seats || 0} seats)
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm">
                            No campus fee details available.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm mb-4">No course information available.</p>
            )}

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

            <div className="mb-10">
              <p>Yours faithfully,</p>
              <p className="font-bold mt-2">Md Shafikul Islam</p>
              <p className="text-sm">Managing Director</p>
            </div>
          </section>

          {/* Right: Fee summary */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <h3 className="font-semibold mb-3">Fee Summary</h3>
              <div className="text-sm bg-gray-50 p-4 rounded border border-gray-100">
                <div className="flex justify-between mb-2">
                  <span>Tuition Total</span>
                  <span>{formatCurrency(courseAmount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Services</span>
                  <span>
                    {formatCurrency(
                      services.reduce((s, it) => s + it.amount, 0),
                    )}
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
          </aside>
        </div>

        {/* Action row */}
        <div className="border-t border-gray-300 mt-6 pt-4 flex items-center justify-between no-print">
          <div className="text-xs text-gray-500">
            Conditional enrolment is subject to terms and conditions.
          </div>
          <div>
            <OfferLetterDownloader lead={lead} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferLetter;
