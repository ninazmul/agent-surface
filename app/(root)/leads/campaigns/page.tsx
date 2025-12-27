import { Button } from "@/components/ui/button";
import { getUserEmailById, isAdmin } from "@/lib/actions";
import {
  getAllCampaignForms,
  getCampaignFormsByAuthor,
} from "@/lib/actions/campaign.actions";
import { auth } from "@clerk/nextjs/server";
import { Plus } from "lucide-react";
import CampaignFormsTable from "../../components/CampaignFormsTable";

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

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {/* Create Form */}
          <a href={"/leads/campaigns/create"}>
            <Button
              size="sm"
              className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
            >
              <Plus size={16} /> Create Form
            </Button>
          </a>
        </div>
      </div>

      {/* Forms Table / List */}
      <div className="overflow-x-auto my-8">
        <CampaignFormsTable forms={forms} />
      </div>
    </section>
  );
}
