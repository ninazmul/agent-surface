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

  return (
    <main className="">
      <VerifyOfferLetterView lead={lead} />
    </main>
  );
};

export default VerifyPage;
