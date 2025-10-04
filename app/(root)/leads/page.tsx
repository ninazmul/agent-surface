import { Button } from "@/components/ui/button";
import JsonToExcel from "../components/JsonToExcel";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getAllLeads, getLeadsByAgency } from "@/lib/actions/lead.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import LeadTable from "../components/LeadTable";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { ILead } from "@/lib/database/models/lead.model";
import { File, Plus } from "lucide-react";
import SendRemindersButton from "@/components/shared/SendRemindersButton";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const adminCountry = await getAdminCountriesByEmail(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  if (!adminStatus && myProfile?.role === "Student") {
    redirect("/profile");
  }

  if (adminStatus && !rolePermissions.includes("leads")) {
    redirect("/");
  }

  let leads: ILead[] = [];

  if (adminStatus) {
    const allLeads = await getAllLeads();

    leads =
      adminCountry.length === 0
        ? allLeads
        : allLeads.filter((r: ILead) => adminCountry.includes(r.home.country));
  } else {
    const profile = await getProfileByEmail(email);
    const agentEmails = [email, ...(profile?.subAgents || [])];

    const allLeads = await Promise.all(
      agentEmails.map((agent) => getLeadsByAgency(agent))
    );

    leads = allLeads.flat().filter(Boolean);
  }

  return (
    <>
      <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        {/* Header + Actions */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 px-4 py-3">
          {/* Title and Export */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between lg:justify-start gap-2 w-full lg:w-auto">
            <h3 className="h3-bold text-center sm:text-left">All Leads</h3>
            <div className="flex justify-center sm:justify-start">
              <JsonToExcel data={leads} fileName="leads.xlsx" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-end gap-2 w-full lg:w-auto">
            <a href={"/leads/create"} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="rounded-full w-full sm:w-auto flex items-center gap-2 justify-center"
              >
                <Plus /> Add Lead
              </Button>
            </a>

            <a href={"/leads/create/bulk-import"} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="rounded-full w-full sm:w-auto flex items-center gap-2 justify-center"
              >
                <File /> Import Leads
              </Button>
            </a>

            {/* Daily Reminder Button (visible only for admins) */}
            {adminStatus && (
              <div className="w-full sm:w-auto">
                <SendRemindersButton />
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto my-8">
          <LeadTable leads={leads} isAdmin={adminStatus} email={email} />
        </div>
      </section>
    </>
  );
};

export default Page;
