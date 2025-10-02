import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import { FileText } from "lucide-react";
import { getLeadById } from "@/lib/actions/lead.actions";

interface Others {
  fileName: string;
  fileUrl: string;
}

interface Address {
  address: string;
  zip: string;
  country: string;
  state: string;
  city: string;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

const LeadDetails = async ({ params }: PageProps) => {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    return <p className="text-center text-red-600 mt-10">Lead not found</p>;
  }

  const formatAddress = (addr: Address) =>
    `${addr.address}, ${addr.city}, ${addr.state}, ${addr.zip}, ${addr.country}`;

  return (
    <div className="print-container m-4 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-10 border-b pb-4">
        <div className="flex items-center gap-4">
          <Image
            src="/assets/images/placeholder.png"
            alt="Agent Surface Logo"
            width={500}
            height={500}
            className="h-28 w-auto"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
              Agent Surface
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mt-1">
              Lead Application Form
            </p>
          </div>
        </div>
      </header>

      {/* Personal Information */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
          Personal Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          {[
            { label: "Full Name", value: lead.name },
            { label: "Email", value: lead.email },
            { label: "Mobile Number", value: lead.number },
            { label: "Gender", value: lead.gender },
            { label: "Marital Status", value: lead.maritalStatus },
            {
              label: "Date of Birth",
              value: new Date(lead.dateOfBirth).toLocaleDateString(),
            },
            {
              label: "Progress",
              value: lead.progress,
            },
            {
              label: "Date",
              value: `${formatDateTime(lead.date).dateOnly} - ${
                formatDateTime(lead.date).timeOnly
              }`,
            },
          ].map((item, idx) => (
            <div key={idx}>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
                {item.label}
              </label>
              <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
                {item.value || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Addresses */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
          Addresses
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Home Address
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {formatAddress(lead.home)}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Irish Address
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {formatAddress(lead.irish)}
            </p>
          </div>
        </div>
      </section>

      {/* Passport */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
          Passport Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Passport Number
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {lead.passport.number}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Visa Required
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {lead.passport.visa ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Passport File
            </label>
            <a
              href={lead.passport.file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 border rounded text-blue-600 dark:text-blue-300 hover:bg-blue-50"
            >
              <FileText className="w-4 h-4" /> View File
            </a>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Issue Date
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {new Date(lead.passport.issueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Expiration Date
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {new Date(lead.passport.expirationDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      {/* Arrival */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
          Arrival Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Flight Number
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {lead.arrival.flight}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Arrival Date
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {new Date(lead.arrival.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Arrival Time
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {new Date(lead.arrival.time).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Arrival File
            </label>
            <a
              href={lead.arrival.file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 border rounded text-blue-600 dark:text-blue-300 hover:bg-blue-50"
            >
              <FileText className="w-4 h-4" /> View File
            </a>
          </div>
        </div>
      </section>

      {/* Course */}
      {lead.course && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
            Course Details
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            {[
              { label: "Course Name", value: lead.course.name },
              { label: "Course Type", value: lead.course.courseType || "N/A" },
              { label: "Duration", value: lead.course.courseDuration || "N/A" },
              {
                label: "Shift",
                value:
                  lead.course.campus?.shift === "morning"
                    ? "Morning"
                    : lead.course.campus?.shift === "afternoon"
                    ? "Afternoon"
                    : "N/A",
              },
              {
                label: "Start Date",
                value: lead.course.startDate
                  ? new Date(lead.course.startDate).toLocaleDateString()
                  : "N/A",
              },
              {
                label: "End Date",
                value: lead.course.endDate
                  ? new Date(lead.course.endDate).toLocaleDateString()
                  : "N/A",
              },
            ].map((item, idx) => (
              <div key={idx}>
                <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
                  {item.label}
                </label>
                <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Additional Documents */}
      {lead.others?.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
            Additional Documents
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            {lead.others.map((doc: Others, idx: number) => (
              <div
                key={idx}
                className="border rounded p-4 bg-gray-50 dark:bg-gray-800 flex flex-col gap-2 shadow-sm"
              >
                <p className="text-gray-800 dark:text-gray-100 font-medium">
                  {doc.fileName || `Document ${idx + 1}`}
                </p>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 border rounded text-blue-600 dark:text-blue-300 hover:bg-blue-50"
                >
                  <FileText className="w-4 h-4" /> View Document
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default LeadDetails;
