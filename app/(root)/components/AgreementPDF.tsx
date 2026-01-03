"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface AgreementModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AgreementModal({ open, onClose }: AgreementModalProps) {
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
          <div className="flex items-center justify-center min-h-full md:p-4 text-center">
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
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Agreement
                </Dialog.Title>

                <iframe
                  src="/assets/contract.pdf"
                  className="w-full flex-1 border border-gray-200 dark:border-gray-700 rounded-lg"
                  title="Agreement PDF"
                />

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
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
