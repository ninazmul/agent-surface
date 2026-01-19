"use client";

import { getSetting } from "@/lib/actions/setting.actions";
import { ISetting } from "@/lib/database/models/setting.model";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

interface AgreementModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AgreementModal({ open, onClose }: AgreementModalProps) {
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
                  Agreement
                </Dialog.Title>

                {settings.contractAgreement && (
                  <div
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: settings.contractAgreement,
                    }}
                  />
                )}

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
