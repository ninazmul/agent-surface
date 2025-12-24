import { Button } from "@/components/ui/button";
// import JsonToExcel from "../components/JsonToExcel";
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
import { Download, Plus } from "lucide-react";
import SendRemindersButton from "@/components/shared/SendRemindersButton";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const adminCountry = await getAdminCountriesByEmail(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  // ====== ADMIN PATH (profile not required)
  if (adminStatus) {
    if (!rolePermissions.includes("leads")) {
      redirect("/");
    }
  } 
  // ====== NON-ADMIN PATH (profile required)
  else {
    // Profile must be Approved
    if (myProfile?.status !== "Approved") {
      redirect("/profile");
    }

    // Students are blocked
    if (myProfile?.role === "Student") {
      redirect("/profile");
    }
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
      <section className="p-4">
        {/* Header + Actions */}
        <div className="px-2 sm:px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Title */}
          <h3 className="h3-bold text-center sm:text-left">All Leads</h3>

          {/* Actions: tight, compact, auto-wrap cluster */}
          <div className="flex flex-wrap gap-2">
            <a href={"/leads/create/bulk-import"}>
              <Button
                size="sm"
                className="rounded-xl bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white flex items-center gap-1"
              >
                <Download size={16} /> Import
              </Button>
            </a>

            <a href={"/leads/create"}>
              <Button
                size="sm"
                className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
              >
                <Plus size={16} /> Add Lead
              </Button>
            </a>

            {adminStatus && (
              <div>
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
