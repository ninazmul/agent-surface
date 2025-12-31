import CampaignSubmissionsTable from "@/app/(root)/components/CampaignSubmissionsTable";
import { getCampaignSubmissionsByFormId } from "@/lib/actions/campaign.actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CampaignSubmissionsPage({ params }: Props) {
  const { id } = await params;
  const submissions = await getCampaignSubmissionsByFormId(id);

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold mb-4">Campaign Submissions</h3>
      <CampaignSubmissionsTable submissions={submissions} />
    </div>
  );
}
