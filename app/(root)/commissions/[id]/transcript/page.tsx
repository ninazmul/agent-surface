import { isAdmin } from "@/lib/actions/admin.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import TranscriptForm from "@/app/(root)/components/TransactionForm";
import { getLeadById } from "@/lib/actions/lead.actions";
import { getQuotationById } from "@/lib/actions/quotation.actions";
import QuotationTranscriptForm from "@/app/(root)/components/QuotationTransactionForm";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);

  let lead = null;
  try {
    lead = await getLeadById(id);
  } catch {
    lead = null;
  }

  // ✅ safely get quotation
  let quotation = null;
  try {
    quotation = await getQuotationById(id);
  } catch {
    quotation = null;
  }

  if (!lead && !quotation) {
    return <p>Data not found.</p>;
  }

  const adminStatus = await isAdmin(email);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Upload Transcript</h2>
      {lead && (
        <TranscriptForm
          type="Update"
          email={email}
          lead={lead}
          leadId={lead._id}
          isAdmin={adminStatus}
        />
      )}
      {quotation && (
        <QuotationTranscriptForm
          type="Update"
          email={email}
          quotation={quotation}
          quotationId={quotation._id}
          isAdmin={adminStatus}
        />
      )}
    </div>
  );
};

export default UpdatePage;
