"use client";

import { getSetting } from "@/lib/actions/setting.actions";
import { IProfile } from "@/lib/database/models/profile.model";
import { ISetting } from "@/lib/database/models/setting.model";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";

interface AgreementModalProps {
  profile?: IProfile;
  open: boolean;
  onClose: () => void;
}

export default function AgreementModal({
  profile,
  open,
  onClose,
}: AgreementModalProps) {
  const [settings, setSettings] = useState<ISetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchSettings = async () => {
      try {
        const data = await getSetting();
        if (mounted) setSettings(data);
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSettings();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;

  if (!settings) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="wrapper max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold mb-12 text-center">
            Contract Agreement
          </h1>
          <p className="text-center text-gray-700 dark:text-gray-300">
            No agreement information available at this time.
          </p>
        </div>
      </section>
    );
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-3 md:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full md:max-w-5xl h-screen md:h-[90vh] bg-white dark:bg-gray-800 rounded-none md:rounded-2xl p-3 md:p-4 shadow-xl flex flex-col">
                
                {/* HEADER */}
                <Dialog.Title className="mb-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-200 pb-4 mb-6">
                    <div className="flex justify-center md:justify-start">
                      <Image
                        src="/assets/images/logo.png"
                        alt="AB Partner Portal Logo"
                        width={100}
                        height={100}
                        className="object-contain dark:hidden"
                      />
                      <Image
                        src="/assets/images/logo-white.png"
                        alt="AB Partner Portal Logo"
                        width={100}
                        height={100}
                        className="object-contain hidden dark:block"
                      />
                    </div>

                    <div className="text-center md:text-right text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <p>33 Gardiner Place, Dublin 1 • Ireland</p>
                      <p>+353 1 878 8616</p>
                      <p>
                        info@academicbridge.ie •{" "}
                        <span className="font-semibold text-primary-700">
                          www.academicbridge.ie
                        </span>
                      </p>
                    </div>
                  </div>
                </Dialog.Title>

                {/* AGREEMENT TITLE */}
                <div className="flex-1 overflow-y-auto pr-2">
                  <h1 className="font-bold text-xl md:text-2xl text-center mb-4 md:mb-6">
                    Education Agency Agreement
                  </h1>

                  <div className="mt-4 mb-2 space-y-4">
                    <h3 className="font-semibold">
                      This Education Agency Agreement is made:
                    </h3>
                    <p>
                      <span className="font-semibold">Between - Academic Bridge Limited</span>, a Private Training school, having its head office at
                      33 Gardiner Place, Dublin1 - D01W625, Dublin Ireland
                      <span className="font-semibold">(&quot;AB&quot;)</span>.
                    </p>
                    <p>
                      <span className="font-semibold">and - {profile?.name || "N/A"}</span>, at: {profile?.location || "N/A"}, {profile?.country || "N/A"}
                      <span className="font-semibold"> (&quot;Agent&quot;)</span>, which advises, counsels, and recruits prospective international students from {profile?.country || "N/A"}.
                    </p>
                  </div>

                  {settings.contractAgreement && (
                    <div
                      className="
                        prose prose-sm md:prose-base max-w-none dark:prose-invert
                        prose-headings:font-semibold
                        prose-p:leading-relaxed
                        prose-strong:font-semibold
                        prose-strong:text-gray-900
                        prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:pl-3 prose-blockquote:text-gray-600
                        prose-ul:list-disc prose-ul:pl-5
                        prose-ol:list-decimal prose-ol:pl-5
                        prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-pink-600
                        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-md prose-pre:p-3
                        prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                        prose-img:rounded-md prose-img:shadow-sm prose-img:my-3
                      "
                      dangerouslySetInnerHTML={{ __html: settings.contractAgreement }}
                    />
                  )}

                  {/* SIGNATURES */}
                  <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-10">
                    
                    {/* AB SIGNATURE */}
                    <div className="w-full lg:w-1/3">
                      <p className="font-semibold">Signed by AB Academic Bridge Ltd:</p>
                      <div className="w-full h-[150px] md:h-[200px] relative">
                        <Image
                          src="/assets/images/1.png"
                          alt="AB Partner Portal Signature"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="font-semibold">Fernando Comar — Sales Manager</p>
                      <p className="font-semibold">Date: 11-05-2025</p>
                    </div>

                    {/* AGENT SIGNATURE */}
                    <div className="w-full lg:w-1/3">
                      <p className="font-semibold">Executed as an agreement</p>
                      <div className="w-full h-[150px] md:h-[200px] relative">
                        {profile?.signatureDocument ? (
                          <Image
                            src={profile.signatureDocument}
                            alt="Agent Signature"
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                            Reserved for Agent Signature
                          </div>
                        )}
                      </div>
                      <p className="font-semibold">Signed by (The Agent):</p>
                      <p className="font-semibold">Date: 11-05-2025</p>
                    </div>
                  </div>
                </div>

                {/* CLOSE BUTTON */}
                <div className="mt-4 flex justify-end sticky bottom-0 bg-white dark:bg-gray-800 pt-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-primary text-white rounded-lg"
                  >
                    Close
                  </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
