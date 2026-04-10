import { getUserEmailById, isAdmin } from "@/lib/actions";
import {
  getAllCampaignForms,
  getCampaignFormsByAuthor,
} from "@/lib/actions/campaign.actions";
import { auth } from "@clerk/nextjs/server";
import CampaignFormsTable from "../../components/CampaignFormsTable";
import CreateCampaignsDialog from "@/components/shared/CreateCampaignsDialog";

export default async function CampaignDashboard() {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  const forms = adminStatus
    ? (await getAllCampaignForms())?.forms || []
    : await getCampaignFormsByAuthor(email);

  return (
    <section className="p-4">
      {/* Header + Actions */}
      <div className="px-2 sm:px-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Title */}
        <h3 className="h3-bold text-center sm:text-left">Campaign Forms</h3>

        <CreateCampaignsDialog email={email} />
      </div>

      {/* Forms Table / List */}
      <div className="overflow-x-auto my-8">
        <CampaignFormsTable forms={forms} />
      </div>
    </section>
  );
}
