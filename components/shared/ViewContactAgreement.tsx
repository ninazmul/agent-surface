"use client";

import AgreementModal from "@/app/(root)/components/AgreementPDF";
import { useState } from "react";

function ViewContactAgreement() {
  const [openAgreementModal, setOpenAgreementModal] = useState(false);

  return (
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-green-600 dark:text-green-400">
            This is the agreement you have accepted. Please review the terms carefully.
          </p>
        </div>
        <button
          onClick={() => setOpenAgreementModal(true)}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          View Agreement
        </button>
      </div>
      {/* Modal */}
      <AgreementModal
        open={openAgreementModal}
        onClose={() => setOpenAgreementModal(false)}
      />
    </div>
  );
}

export default ViewContactAgreement;
