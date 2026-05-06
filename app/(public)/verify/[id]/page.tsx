import VerifyOfferLetterView from "@/components/shared/VerifyOfferLetterView";
import { getLeadById } from "@/lib/actions";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";

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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mb-6 rounded-full bg-amber-100 p-4 ring-8 ring-amber-50">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">
            Offer Letter Pending
          </h2>
          <p className="mb-8 leading-relaxed text-slate-500">
            The offer letter has not yet been accepted. Please complete the
            acceptance process to view the verified letter.
          </p>
          <div className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
            <span className="text-sm font-medium text-slate-600">
              Current Status
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
              Pending Acceptance
            </span>
          </div>
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
