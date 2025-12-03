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
          <section className="p-4">
            <h3 className="h3-bold text-center sm:text-left mb-4">Profile</h3>
            <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 space-y-4">
              <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <Image
                      src={
                        myProfile?.logo || "/assets/images/default-profile.png"
                      }
                      alt={myProfile?.name || "N/A"}
                      width={150} // 3 units
                      height={200} // 4 units
                      className="w-20 md:w-24 h-16 md:h-32 rounded-lg object-cover border"
                    />

                    <div>
                      <h2 className="text-lg md:text-2xl font-semibold text-black dark:text-gray-100 flex items-center gap-2">
                        {myProfile?.name}
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-medium ${
                            myProfile?.status === "Approved"
                              ? "bg-green-300 text-green-800"
                              : "bg-yellow-300 text-yellow-800"
                          }`}
                        >
                          {myProfile?.status}
                        </span>
                      </h2>
                      <p className="text-sm px-2 py-1 rounded-md bg-purple-500 text-white w-max">
                        {myProfile?.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl">
                  <h3 className="text-xl font-semibold text-black dark:text-gray-100 mb-2">
                    Agent Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
                    <div>
                      <p className="text-lg text-gray-700">Name:</p>
                      <p>{myProfile?.name}</p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700">Location:</p>
                      <p>{myProfile?.location}</p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700">Email:</p>
                      <p>{myProfile?.email}</p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700">Phone:</p>
                      <p>{myProfile?.number}</p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700">Created At:</p>
                      <p>
                        {myProfile?.createdAt
                          ? new Date(myProfile.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700">Country:</p>
                      <p>{myProfile?.country}</p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700">Country Agent:</p>
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
                  </div>
                </div>

                {/* Bank Info */}
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl">
                  <h3 className="text-xl font-semibold text-black dark:text-gray-100 mb-2">
                    Bank Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
                    <div>
                      <p className="text-lg text-gray-700">Bank Name:</p>
                      <p>{myProfile?.bankName}</p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700">SWIFT Code:</p>
                      <p>{myProfile?.swiftCode}</p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700">Branch Address:</p>
                      <p>{myProfile?.branchAddress}</p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700">Account Number:</p>
                      <p>{myProfile?.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700">Routing Number:</p>
                      <p>{myProfile?.routingNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {(myProfile?.licenseDocument ||
                  myProfile?.agreementDocument) && (
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl">
                    <h3 className="text-xl font-semibold text-black dark:text-gray-100 mb-2">
                      Documents
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {myProfile?.licenseDocument && (
                        <a
                          href={myProfile.licenseDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-xs font-medium rounded-full bg-white dark:bg-gray-800 border text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          📄 View License Document
                        </a>
                      )}

                      {myProfile?.agreementDocument && (
                        <a
                          href={myProfile.agreementDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-xs font-medium rounded-full bg-white dark:bg-gray-800 border text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          📄 View Agreement Document
                        </a>
                      )}
                    </div>
                  </div>
                )}

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
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold text-black dark:text-gray-100 mb-2">
                    Agent Information
                  </h3>
                  <a href={"/profile/create"} className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="rounded-xl w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-1"
                    >
                      Add Sub Agent <Plus />
                    </Button>
                  </a>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {subAgents.map((agent) => (
                    <a
                      href={`/profile/${agent._id.toString()}`}
                      key={agent._id.toString()}
                      className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={
                            agent.logo || "/assets/images/default-profile.png"
                          }
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
              </div>
            </div>
          </section>
        )}
      </section>

      {adminStatus && (
        <section className="p-4">
          {/* Header */}
          <div className="px-2 sm:px-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <h3 className="h3-bold text-center sm:text-left">All Profiles</h3>
            <a href={"/profile/create"} className="w-full sm:w-auto">
              <Button
                size="sm"
                className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
              >
                <Plus size={16} /> Add Profile
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
