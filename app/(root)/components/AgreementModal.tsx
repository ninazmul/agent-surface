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

  if (loading) {
    return null; // or spinner if you want
  }

  if (!settings) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="wrapper max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold mb-12 text-center">
            Policies
          </h1>
          <p className="text-center text-gray-700 dark:text-gray-300">
            No policy information available at this time.
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
          <div className="flex items-center justify-center min-h-full md:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl h-[90vh] bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl flex flex-col">
                <Dialog.Title className="text-lg font-semibold mb-4">
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
                      <p>
                        33 Gardiner Place, Dublin 1 • Ireland +353 1 878 8616
                      </p>
                      <p>
                        info@academicbridge.ie •{" "}
                        <span className="font-semibold text-primary-700">
                          www.academicbridge.ie
                        </span>
                      </p>
                    </div>
                  </div>
                </Dialog.Title>

                <div className="flex-1 overflow-y-auto pr-2">
                  <div>
                    <h1 className="font-bold text-xl">
                      Education Agency Agreement
                    </h1>
                    <div className="mt-4 mb-2 space-y-4">
                      <h3 className="font-semibold">
                        This Education Agency Agreement is made:
                      </h3>
                      <p className="font-semibold">
                        Between - Academic Bridge Limited, a Private Training
                        school, having its head office at 33 Gardiner Place,
                        Dublin1 - D01W625, Dublin Ireland (&quot;AB&quot;).
                      </p>
                      <p className="font-semibold">
                        and - {profile?.name || "N/A"},at :{" "}
                        {profile?.location || "N/A"},{" "}
                        {profile?.country || "N/A"}
                        (&quot;Agent&quot;), which advises, counsels and
                        recruits prospective international students from
                        {profile?.country || "N/A"}
                      </p>
                    </div>
                  </div>
                  {settings.contractAgreement && (
                    <div
                      className="
                prose prose-base max-w-none dark:prose-invert
                prose-headings:font-semibold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:font-semibold prose-strong:text-gray-900
                prose-em:italic prose-em:text-gray-800
                prose-u:underline
                prose-ul:list-disc prose-ul:pl-5
                prose-ol:list-decimal prose-ol:pl-5
                prose-li:marker:text-gray-500
                prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:pl-3 prose-blockquote:text-gray-600 italic
                prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-pink-600
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-md prose-pre:p-3
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                prose-img:rounded-md prose-img:shadow-sm prose-img:my-3
                "
                      dangerouslySetInnerHTML={{
                        __html: settings.contractAgreement,
                      }}
                    />
                  )}
                </div>

                <div className="mt-4 flex justify-end">
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
