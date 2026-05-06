import OfferLetterDownloader from "@/app/(root)/components/OfferLetterDownloader";
import { getLeadById } from "@/lib/actions/lead.actions";
import Image from "next/image";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

type OfferService = {
  title: string;
  serviceType: string;
  amount: number;
};

type OfferCourse = {
  _id?: string;
  name?: string;
  courseType?: string;
  courseDuration?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  campus?: {
    name?: string;
    shift?: "morning" | "afternoon" | "general" | string;
  };
  courseFee?: string | number;
};

type LeadServiceSnapshot = {
  title: string;
  serviceType?: string;
  amount?: string | number;
};

function formatCurrency(value: number) {
  return value.toLocaleString("en-IE", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(value?: string | Date) {
  if (!value) return "TBA";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";

  return date.toLocaleDateString("en-GB");
}

const OfferLetter = async ({ params }: PageProps) => {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead || lead.progress !== "Converted") {
    redirect(`/leads/${id}`);
  }

  // NEW: Block access until offer letter is accepted
  if (!lead.isOfferLetterAccepted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md">
          <h2 className="mb-2 text-center text-lg font-semibold text-gray-800">
            Offer Letter Pending
          </h2>
          <p className="text-center text-sm text-gray-600">
            The offer letter has not yet been accepted. Please complete the
            acceptance process to view the full letter.
          </p>
        </div>
      </div>
    );
  }

  const rawServices = (lead.services || []) as LeadServiceSnapshot[];

  const services: OfferService[] = rawServices.map((service) => ({
    title: service.title,
    serviceType: service.serviceType || "Additional service",
    amount: Number(service.amount) || 0,
  }));

  const rawCourses: OfferCourse[] = Array.isArray(lead.course)
    ? (lead.course as OfferCourse[])
    : lead.course
      ? [lead.course as OfferCourse]
      : [];

  const courses: OfferCourse[] = rawCourses.map((course) => ({
    _id: course._id?.toString(),
    name: course.name,
    courseType: course.courseType,
    courseDuration: course.courseDuration,
    startDate: course.startDate,
    endDate: course.endDate,
    campus: course.campus,
    courseFee: course.courseFee,
  }));

  const courseAmount = courses.reduce((sum, course) => {
    return sum + (Number(course.courseFee) || 0);
  }, 0);

  const servicesAmount = services.reduce(
    (sum, service) => sum + service.amount,
    0,
  );

  const discount = Number(lead.discount) || 0;
  const subTotal = courseAmount + servicesAmount;
  const grandTotal = Math.max(0, subTotal - discount);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative print:bg-white print:text-black">
      <div className="m-4 mx-auto max-w-7xl rounded-2xl bg-white p-6 font-serif text-primary-900 shadow-xl dark:bg-gray-900 dark:text-gray-100 print-container">
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
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
            className="hidden object-contain dark:block"
          />

          <div className="space-y-0.5 text-right text-xs text-gray-600 dark:text-gray-300">
            <p>33 Gardiner Place, Dublin 1 • Ireland +353 1 878 8616</p>
            <p>
              info@academicbridge.ie •{" "}
              <span className="font-semibold text-primary-700">
                www.academicbridge.ie
              </span>
            </p>
          </div>
        </div>

        <p className="mb-4 text-right">{today}</p>

        <h1 className="mb-6 text-center text-[16px] font-bold underline">
          CONDITIONAL ENROLMENT LETTER
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <p className="mb-4">Dear Sir/Madam,</p>

            <p className="mb-4">
              This is to confirm that we have reserved a place on a course at
              Academic Bridge English School subject to standard terms and
              conditions for the student as per the admission particulars listed
              below:
            </p>

            <h2 className="mb-2 font-semibold">Student Details</h2>

            <div className="mb-4 grid grid-cols-2 gap-y-2 text-sm">
              <p>
                <strong>Name:</strong> {lead.name || "TBA"}
              </p>
              <p>
                <strong>Date of Birth:</strong> {formatDate(lead.dateOfBirth)}
              </p>
              <p>
                <strong>Nationality:</strong>{" "}
                {lead.passport?.country || lead.home?.country || "TBA"}
              </p>
              <p>
                <strong>Passport No.:</strong> {lead.passport?.number || "N/A"}
              </p>
              <p>
                <strong>Passport Exp Date:</strong>{" "}
                {formatDate(lead.passport?.expirationDate)}
              </p>
              <p>
                <strong>Email:</strong> {lead.email || "N/A"}
              </p>
            </div>

            <h2 className="mb-2 font-semibold">Course Details</h2>

            {courses.length > 0 ? (
              courses.map((course, index) => (
                <div
                  key={`${course._id || course.name}-${index}`}
                  className="mb-4 rounded-sm border border-gray-100 p-3"
                >
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p>
                      <strong>Course:</strong> {course.name || "TBA"}
                    </p>
                    <p>
                      <strong>Type:</strong> {course.courseType || "N/A"}
                    </p>
                    <p>
                      <strong>Duration:</strong>{" "}
                      {course.courseDuration || "N/A"}
                    </p>
                    <p>
                      <strong>Campus:</strong> {course.campus?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Shift:</strong> {course.campus?.shift || "N/A"}
                    </p>
                    <p>
                      <strong>Tuition Fee:</strong>{" "}
                      <span className="font-semibold text-green-700">
                        {formatCurrency(Number(course.courseFee) || 0)}
                      </span>
                    </p>
                    <p>
                      <strong>Commence Date:</strong>{" "}
                      {formatDate(course.startDate)}
                    </p>
                    <p>
                      <strong>Completion Date:</strong>{" "}
                      {formatDate(course.endDate)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="mb-4 text-sm">No course information available.</p>
            )}

            {services.length > 0 && (
              <>
                <h3 className="mb-2 font-semibold">Additional Services</h3>
                <ul className="mb-4 list-inside list-disc text-sm">
                  {services.map((service, index) => (
                    <li key={`${service.title}-${index}`}>
                      <strong>{service.title}</strong> — {service.serviceType}:{" "}
                      <span className="font-semibold text-green-700">
                        {formatCurrency(service.amount)}
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
              <h3 className="mb-2 font-semibold">Payment Details</h3>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                <p>
                  <strong>Bank:</strong> AIB Allied Irish Banks
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
              <p className="mt-2 font-bold">Md Shafikul Islam</p>
              <p className="text-sm">Managing Director</p>
            </div>
          </section>

          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <h3 className="mb-3 font-semibold">Fee Summary</h3>

              <div className="rounded border border-gray-100 bg-gray-50 p-4 text-sm">
                <div className="mb-2 flex justify-between">
                  <span>Tuition Total</span>
                  <span>{formatCurrency(courseAmount)}</span>
                </div>
                <div className="mb-2 flex justify-between">
                  <span>Services</span>
                  <span>{formatCurrency(servicesAmount)}</span>
                </div>
                <div className="mb-2 flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subTotal)}</span>
                </div>
                <div className="mb-2 flex justify-between">
                  <span>Discount</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 font-semibold">
                  <span>Grand Total</span>
                  <span className="text-green-700">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="no-print mt-6 flex items-center justify-between border-t border-gray-300 pt-4">
          <div className="text-xs text-gray-500">
            Conditional enrolment is subject to terms and conditions.
          </div>
          <OfferLetterDownloader lead={lead} />
        </div>
      </div>
    </div>
  );
};

export default OfferLetter;
