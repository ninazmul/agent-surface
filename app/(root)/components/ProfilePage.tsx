"use client";

import { IProfile } from "@/lib/database/models/profile.model";
import Image from "next/image";
import ProfileForm from "./ProfileForm";
import { Button } from "@/components/ui/button";
import ProfileTable from "./ProfileTable";
import SalesTargetProgress from "./SalesTargetProgress";
import { FileEdit, Plus } from "lucide-react";
import { ILead } from "@/lib/database/models/lead.model";
import { useEffect, useState } from "react";
import { getLeadByEmail } from "@/lib/actions/lead.actions";
import { useTheme } from "next-themes";

interface ProfilePageProps {
  adminStatus: boolean;
  profiles: IProfile[];
  myProfile?: IProfile | null;
  countryAgent: IProfile | null;
  agent: IProfile[];
  subAgents: IProfile[];
  myLeads?: ILead[];
}

export default function ProfilePage({
  adminStatus,
  profiles,
  myProfile,
  countryAgent,
  agent,
  subAgents,
  myLeads,
}: ProfilePageProps) {
  const { theme } = useTheme();
  const [myLead, setMyLead] = useState<ILead | null>(null);

  // Fetch leads client-side
  useEffect(() => {
    const fetchData = async () => {
      try {
        const lead = await getLeadByEmail(myProfile?.email || "");
        setMyLead(lead || null);
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };

    fetchData();
  }, [myProfile?.email]);
  return (
    <div className="space-y-10 pb-10">
      {/* User Profile Section */}
      <section className="">
        {!adminStatus && !myProfile && (
          <div className="max-w-5xl mx-auto m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-indigo-800 dark:text-gray-100">
                Create Your Agency Profile
              </h2>
              <p className="text-sm text-indigo-600 dark:text-gray-300">
                Welcome! To get started, please complete your agency details.
                Our team will review and approve your profile shortly.
              </p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-purple-50 dark:bg-gray-800 border border-purple-200 rounded-lg">
              <Image
                src={
                  theme === "dark"
                    ? "/assets/images/logo-white.png"
                    : "/assets/images/logo.png"
                }
                alt="AB logo"
                width={120}
                height={40}
                className="self-center sm:self-start"
              />
              <p className="text-sm text-indigo-700 dark:text-gray-100">
                Completing your agency profile helps us ensure secure payouts,
                verified access, and full feature availability within the
                system.
              </p>
            </div>

            <ProfileForm type="Create" agent={agent} />
          </div>
        )}

        {myProfile && (
          <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
            <div className="mx-auto bg-indigo-50 dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={
                      myProfile?.logo || "/assets/images/default-profile.png"
                    }
                    alt={myProfile?.name || "N/A"}
                    height={80}
                    width={80}
                    className="w-10 md:w-20 h-10 md:h-20 rounded-full object-cover border border-indigo-300"
                  />
                  <div>
                    <h2 className="text-lg md:text-2xl font-semibold text-indigo-800 dark:text-gray-100 flex items-center gap-2">
                      {myProfile?.name}
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-200 text-indigo-600 dark:text-gray-500">
                        {myProfile?.role}
                      </span>
                    </h2>
                    <p className="text-xs md:text-sm text-indigo-500 dark:text-gray-300">
                      {myProfile?.email}
                    </p>
                    <p className="text-xs md:text-sm text-indigo-500 dark:text-gray-300">
                      {myProfile?.number}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                    myProfile?.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {myProfile?.status}
                </span>
              </div>

              <hr className="border-indigo-200" />

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-indigo-700 dark:text-gray-100">
                <div>
                  <strong>Role:</strong> {myProfile?.role}
                </div>
                <div>
                  <strong>Country Agent:</strong>{" "}
                  {countryAgent?.name ? (
                    <>
                      {countryAgent.name}{" "}
                      <span className="text-indigo-500 text-xs">
                        ({countryAgent.email})
                      </span>
                    </>
                  ) : (
                    "N/A"
                  )}
                </div>
                <div>
                  <strong>Country:</strong> {myProfile?.country}
                </div>
                <div>
                  <strong>Location:</strong> {myProfile?.location}
                </div>
                <div>
                  <strong>Created At:</strong>{" "}
                  {myProfile?.createdAt
                    ? new Date(myProfile.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>

              <hr className="border-indigo-200" />

              {/* Bank Info */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-800 dark:text-gray-100 mb-2">
                  Bank Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-indigo-700 dark:text-gray-100">
                  <p>
                    <strong>Bank Name:</strong> {myProfile?.bankName}
                  </p>
                  <p>
                    <strong>Account Number:</strong> {myProfile?.accountNumber}
                  </p>
                  <p>
                    <strong>SWIFT Code:</strong> {myProfile?.swiftCode}
                  </p>
                  <p>
                    <strong>Routing Number:</strong> {myProfile?.routingNumber}
                  </p>
                  <p className="sm:col-span-2">
                    <strong>Branch Address:</strong> {myProfile?.branchAddress}
                  </p>
                </div>
              </div>

              <hr className="border-indigo-200" />

              {/* Documents */}
              {myProfile?.licenseDocument ||
                (myProfile.agreementDocument && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-800 dark:text-gray-100 mb-2">
                        Documents
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {myProfile?.licenseDocument && (
                          <a
                            href={myProfile?.licenseDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary dark:text-gray-300 hover:underline"
                          >
                            📄 View License Document
                          </a>
                        )}
                        {myProfile?.agreementDocument && (
                          <a
                            href={myProfile?.agreementDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary dark:text-gray-300 hover:underline"
                          >
                            📄 View Agreement Document
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                ))}

              {myProfile && (
                <SalesTargetProgress
                  profile={{
                    ...myProfile,
                    salesTarget: myProfile?.salesTarget
                      ? Number(myProfile.salesTarget)
                      : 0,
                    email: myProfile?.email || "",
                  }}
                  leads={myLeads || []}
                />
              )}

              {/* Profile Status or Update */}
              <div>
                {myProfile?.status === "Pending" ? (
                  <div className="mt-4 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-md">
                    Your profile is currently under review. Please wait for
                    admin approval to access full features.
                  </div>
                ) : (
                  <div className="text-center pt-4">
                    <a href={`/profile/${myProfile?._id.toString()}/update`}>
                      <Button
                        variant="outline"
                        className="text-purple-700 w-full max-w-5xl font-semibold bg-purple-100 hover:bg-purple-200 inline-flex items-center gap-2"
                      >
                        <Image
                          src="/assets/icons/edit.svg"
                          alt="edit"
                          width={20}
                          height={20}
                        />
                        Update Profile
                      </Button>
                    </a>
                  </div>
                )}
              </div>

              {myProfile?.role === "Student" && (
                <>
                  {myLead ? (
                    <div className="text-center pt-4">
                      {" "}
                      <a href={`/lead/${myLead._id.toString()}`}>
                        <Button
                          variant="outline"
                          className="text-blue-700 w-full max-w-5xl font-semibold bg-blue-100 hover:bg-blue-200 inline-flex items-center gap-2"
                        >
                          <FileEdit />
                          My lead Portal
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="text-center pt-4">
                      {" "}
                      <a href={`/lead/create`}>
                        <Button
                          variant="outline"
                          className="text-blue-700 w-full max-w-5xl font-semibold bg-blue-100 hover:bg-blue-200 inline-flex items-center gap-2"
                        >
                          <FileEdit />
                          Create Lead
                        </Button>
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* Sub Agents Section */}
        {subAgents.length > 0 && (
          <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
              <h3 className="text-lg font-semibold mb-4 text-indigo-800 dark:text-gray-100">
                Your Sub Agents
              </h3>
              <a href={"/profile/create"} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant={"ghost"}
                  className="rounded-full w-full sm:w-auto"
                >
                  <Plus /> Add Sub Agent
                </Button>
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subAgents.map((agent) => (
                <a
                  href={`/profile/${agent._id.toString()}`}
                  key={agent._id.toString()}
                  className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={agent.logo || "/assets/images/default-profile.png"}
                      alt={agent.name}
                      height={60}
                      width={60}
                      className="w-14 h-14 rounded-full object-cover border"
                    />
                    <div>
                      <h4 className="text-md font-medium text-indigo-800 dark:text-gray-100">
                        {agent.name}
                      </h4>
                      <p className="text-sm text-indigo-500 dark:text-gray-300">
                        {agent.email}
                      </p>
                      <p className="text-xs text-indigo-400 dark:text-gray-300">
                        {agent.country}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </section>

      {adminStatus && (
        <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
            <h3 className="h3-bold text-center sm:text-left">All Profiles</h3>
            <a href={"/profile/create"} className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full w-full sm:w-auto">
                Add Profile
              </Button>
            </a>
          </div>

          {/* Table */}
          <div className="overflow-x-auto my-8">
            <ProfileTable profiles={profiles} />
          </div>
        </section>
      )}
    </div>
  );
}
