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
        : allLeads.filter((r: ILead) =>
            adminCountry.includes(r.home.country)
          );
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
        <div className="flex justify-between items-center gap-4">
          {/* Title and Export */}
          <div className="flex items-center gap-2">
            <h3 className="h3-bold text-center sm:text-left">All Leads</h3>
            <JsonToExcel data={leads} fileName="leads.xlsx" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <a href={"/leads/create"} className="">
              <Button
                size="sm"
                className="rounded-full w-full flex items-center gap-2 justify-center"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline">Add Lead</span>
              </Button>
            </a>

            <a href={"/leads/create/bulk-import"} className="">
              <Button
                size="sm"
                className="rounded-full w-full flex items-center gap-2 justify-center"
              >
                <File className="h-4 w-4" />
                <span className="hidden lg:inline">Import Leads</span>
              </Button>
            </a>

            {/* Daily Reminder Button (icon-only on small devices) */}
            {adminStatus && (
              <div className="">
                <SendRemindersButton iconOnly />
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
