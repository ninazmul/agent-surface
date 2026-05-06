import VerifyOfferLetterView from "@/components/shared/VerifyOfferLetterView";
import { getLeadById } from "@/lib/actions";
import { redirect } from "next/navigation";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ id: string }>;
};

const VerifyPage = async ({ params }: PageProps) => {
  const { id } = await params; // id from URL
  const lead = await getLeadById(id);

  if (!lead || lead.progress !== "Converted") {
    return redirect(`/leads/${id}`);
  }

  // NEW: Block access until offer letter is accepted
  if (!lead.isOfferLetterAccepted) {
    return (
      <main className="flex h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md">
          <h2 className="mb-2 text-center text-lg font-semibold text-gray-800">
            Offer Letter Pending
          </h2>
          <p className="text-center text-sm text-gray-600">
            The offer letter has not yet been accepted. Please complete the
            acceptance process to view the verified letter.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="">
      <VerifyOfferLetterView lead={lead} />
    </main>
  );
};

export default VerifyPage;
