import { Button } from "@/components/ui/button";
import { SignatureDocumentForm } from "./SignatureDocumentForm";

export const AGREEMENT_LETTER = `
DECLARATION & AGREEMENT

I hereby confirm that all information provided in my profile is true,
accurate, and complete to the best of my knowledge.

By submitting my signature, I acknowledge that:
• I have read and understood the terms and conditions.
• I agree to comply with all platform policies and guidelines.
• Any false or misleading information may result in suspension or rejection.

This agreement becomes effective upon submission and remains valid
until officially approved or terminated by the platform authority.

Signature below confirms my acceptance of this agreement.
`;

interface SignatureModalProps {
  open: boolean;
  onClose: () => void;
  profileName?: string;
  profileId: string;
}

export function SignatureModal({
  open,
  onClose,
  profileName,
  profileId,
}: SignatureModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-1">Agreement Confirmation</h2>

        <p className="text-sm text-gray-600 mb-4">
          This agreement is required to activate your profile and complete the
          verification process.
        </p>

        {/* Letter */}
        <div className="text-sm text-gray-700 border rounded-md p-4 bg-gray-50 h-40 overflow-y-auto mb-4">
          <p className="font-medium mb-2">Declaration</p>
          <p>
            I, <strong>{profileName || "the applicant"}</strong>, hereby confirm
            that all information provided in my profile is accurate and
            truthful. I agree to comply with platform policies and understand
            that approval is subject to administrative review.
          </p>
        </div>

        {/* Signature form */}
        <SignatureDocumentForm profileId={profileId} />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel/Close
          </Button>
        </div>
      </div>
    </div>
  );
}
