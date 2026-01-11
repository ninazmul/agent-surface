"use client";

import AgreementModal from "@/app/(root)/components/AgreementPDF";
import { useState } from "react";

function ViewContactAgreement() {
  const [openAgreementModal, setOpenAgreementModal] = useState(false);

  return (
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">
            Review Legal Agreement
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please read the terms and conditions carefully.
          </p>
        </div>
        <button
          onClick={() => setOpenAgreementModal(true)}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          View Document
        </button>
      </div>
      {/* Modals */}
      <AgreementModal
        open={openAgreementModal}
        onClose={() => setOpenAgreementModal(false)}
      />
    </div>
  );
}

export default ViewContactAgreement;
