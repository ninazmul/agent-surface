import { getLeadById } from "@/lib/actions/lead.actions";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import { FileText } from "lucide-react";
import { IServices } from "@/lib/database/models/service.model";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

const leadDetails = async ({ params }: PageProps) => {
  const { id } = await params;
  const lead = await getLeadById(id);

  const formatAddress = (addr?: Address) => {
    if (!addr) return "N/A";
    return `${addr.address || ""}, ${addr.city || ""}, ${addr.state || ""}, ${
      addr.zip || ""
    }, ${addr.country || ""}`;
  };

  const getProgress = (progress: string) => {
    switch (progress) {
      case "Open":
        return { value: 20, color: "bg-gray-400" };
      case "Contacted":
        return { value: 50, color: "bg-yellow-500" };
      case "Converted":
        return { value: 75, color: "bg-green-500" };
      case "Closed":
        return { value: 100, color: "bg-red-500" };
      default:
        return { value: 0, color: "bg-gray-300" };
    }
  };

  if (!lead) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
          No lead Found
        </h2>
        <Link href="/lead/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Create lead
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="print-container m-4 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-7xl mx-auto">
      {/* Action Button */}
      <div className="flex justify-end mb-6">
        <a href={`/lead/${lead._id}/update`}>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Update lead
          </Button>
        </a>
      </div>

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
            { label: "Full Name", value: lead?.name ?? "N/A" },
            { label: "Email", value: lead?.email ?? "N/A" },
            { label: "Mobile Number", value: lead?.number ?? "N/A" },
            { label: "Gender", value: lead?.gender ?? "N/A" },
            { label: "Marital Status", value: lead?.maritalStatus ?? "N/A" },
            {
              label: "Date of Birth",
              value: lead?.dateOfBirth
                ? new Date(lead.dateOfBirth).toLocaleDateString()
                : "N/A",
            },
            { label: "Progress", value: lead?.progress ?? "N/A" },
            {
              label: "Date",
              value: lead?.date
                ? `${formatDateTime(lead.date).dateOnly} - ${
                    formatDateTime(lead.date).timeOnly
                  }`
                : "N/A",
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

        {/* ✅ Progress Progress Bar */}
        <div className="mt-6">
          <label className="block text-gray-600 dark:text-gray-300 font-medium mb-2">
            Leads Progress
          </label>
          <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-3 rounded-full ${getProgress(lead.progress).color}`}
              style={{ width: `${getProgress(lead.progress).value}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Current Progress:{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {lead.progress}
            </span>
          </p>
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
              {lead.passport?.number ?? "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Visa Required
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {lead.passport?.visa ? "Yes" : "No"}
            </p>
          </div>
          {/* Passport File */}
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Passport File
            </label>
            {lead.passport?.file ? (
              <a
                href={lead.passport.file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 border rounded text-blue-600 dark:text-blue-300 hover:bg-blue-50"
              >
                <FileText className="w-4 h-4" /> View File
              </a>
            ) : (
              <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
                N/A
              </p>
            )}
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Issue Date
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {lead.passport?.issueDate
                ? new Date(lead.passport.issueDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Expiration Date
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {lead.passport?.expirationDate
                ? new Date(lead.passport.expirationDate).toLocaleDateString()
                : "N/A"}
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
              {lead.arrival?.flight ?? "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Arrival Date
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {lead.arrival?.date
                ? new Date(lead.arrival.date).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Arrival Time
            </label>
            <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
              {lead.arrival?.time
                ? new Date(lead.arrival.time).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          {/* Arrival File */}
          <div>
            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
              Arrival File
            </label>
            {lead.arrival?.file ? (
              <a
                href={lead.arrival.file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 border rounded text-blue-600 dark:text-blue-300 hover:bg-blue-50"
              >
                <FileText className="w-4 h-4" /> View File
              </a>
            ) : (
              <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
                N/A
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Requested Services */}
      {lead.services?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
            Requested Services
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            {lead.services.map((service: IServices, idx: number) => (
              <div
                key={idx}
                className="border rounded p-4 bg-gray-50 dark:bg-gray-800 flex flex-col gap-2 shadow-sm"
              >
                <p className="text-gray-800 dark:text-gray-100 font-medium">
                  {service.title || `Service ${idx + 1}`}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Type:{" "}
                  <span className="text-blue-700 dark:text-blue-400 font-semibold">
                    {service.serviceType}
                  </span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Amount:{" "}
                  <span className="text-green-700 dark:text-green-400 font-semibold">
                    ${service.amount}
                  </span>
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

export default leadDetails;
