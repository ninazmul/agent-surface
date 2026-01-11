import { getProfileById } from "@/lib/actions/profile.actions";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import { FileText } from "lucide-react";
import { getLeadsByAgency } from "@/lib/actions/lead.actions";
import SalesTargetProgress from "@/app/(root)/components/SalesTargetProgress";

type PageProps = {
  params: Promise<{ id: string }>;
};

const ProfileDetails = async ({ params }: PageProps) => {
  const { id } = await params;
  const profile = await getProfileById(id);

  if (!profile) {
    return <p className="text-center text-red-600 mt-10">Profile not found</p>;
  }

  const leads = await getLeadsByAgency(profile.email);

  return (
    <div className="max-w-7xl mx-auto p-6 my-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      {/* Agency Details */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
          Agency Details
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 border rounded overflow-hidden shadow">
            <Image
              src={profile.logo || "/assets/images/profile.png"}
              alt="Agency Logo"
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-lg font-semibold">{profile.name}</p>
              <span className="text-green-600 bg-green-50 text-sm font-semibold rounded-full px-3 py-1">
                {profile.role}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-300 text-sm">
              {profile.email}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          {[
            { label: "Phone Number", value: profile.number },
            { label: "Country", value: profile.country },
            { label: "Location", value: profile.location },
            { label: "Status", value: profile.status },
            {
              label: "Submitted At",
              value: `${formatDateTime(profile.createdAt).dateOnly} - ${
                formatDateTime(profile.createdAt).timeOnly
              }`,
            },
          ].map((item, idx) => (
            <div key={idx}>
              <label className="block text-gray-600 dark:text-gray-200 font-medium mb-1">
                {item.label}
              </label>
              <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 capitalize">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Banking Details */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
          Banking Details
        </h2>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          {[
            { label: "Bank Name", value: profile.bankName },
            { label: "Account Number", value: profile.accountNumber },
            { label: "SWIFT Code", value: profile.swiftCode },
            { label: "Routing Number", value: profile.routingNumber },
            { label: "Branch Address", value: profile.branchAddress },
          ].map((item, idx) => (
            <div key={idx}>
              <label className="block text-gray-600 dark:text-gray-200 font-medium mb-1">
                {item.label}
              </label>
              <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Uploaded Documents */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
          Uploaded Documents
        </h2>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          {[
            { label: "License Document", url: profile.licenseDocument },
            { label: "Agreement Document", url: profile.agreementDocument },
          ].map((doc, idx) => (
            <div key={idx}>
              <label className="block text-gray-600 dark:text-gray-200 font-medium mb-1">
                {doc.label}
              </label>

              {doc.url ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition"
                >
                  <FileText className="w-4 h-4" />
                  View Document
                </a>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Not Uploaded</p>
              )}
            </div>
          ))}

          {/* Digital Signature – View Only */}
          {profile.signatureDocument && (
            <div>
              <label className="block text-gray-600 dark:text-gray-200 font-medium mb-2">
                Digital Signature
              </label>

              <div className="flex flex-col items-center gap-2 p-4 border rounded bg-gray-50 dark:bg-gray-800">
                <Image
                  src={profile.signatureDocument}
                  alt="Approved Signature"
                  width={220}
                  height={100}
                  className="object-contain mix-blend-multiply dark:mix-blend-normal dark:invert-[0.05]"
                />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  ✔ Approved & Verified
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Agent Relationships */}
      {profile.role === "Sub Agent" && profile.countryAgent && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
            Assigned Country Agent
          </h2>

          <p className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-sm">
            {profile.countryAgent}
          </p>
        </section>
      )}

      {profile.role === "Agent" &&
        Array.isArray(profile.subAgents) &&
        profile.subAgents.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4 border-b pb-2">
              Sub Agents
            </h2>

            <ul className="list-disc list-inside text-sm space-y-1 bg-gray-50 dark:bg-gray-800 rounded p-4 border">
              {profile.subAgents.map((email: string, idx: number) => (
                <li key={idx}>{email}</li>
              ))}
            </ul>
          </section>
        )}

      {/* Sales Target */}
      <SalesTargetProgress profile={profile} leads={leads} />
    </div>
  );
};

export default ProfileDetails;
