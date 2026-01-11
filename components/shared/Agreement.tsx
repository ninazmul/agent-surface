"use client";

import AgreementModal from "@/app/(root)/components/AgreementPDF";
import { useState } from "react";

export default function Agreement() {
  const [openAgreementModal, setOpenAgreementModal] = useState(false);
  return (
    <div>
      <AgreementModal
        open={openAgreementModal}
        onClose={() => setOpenAgreementModal(false)}
      />
    </div>
  );
}
