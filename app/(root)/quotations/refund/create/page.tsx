import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import RefundForm from "@/app/(root)/components/RefundForm";
import { ILead } from "@/lib/database/models/lead.model";
import { getAllLeads, getLeadsByAgency } from "@/lib/actions/lead.actions";
import { redirect } from "next/navigation";

const CreateRefundPage = async () => {
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

  if (adminStatus && !rolePermissions.includes("applications")) {
    redirect("/");
  }
  let leads: ILead[] = [];

  if (adminStatus) {
    const allleads = await getAllLeads();

    leads =
      adminCountry.length === 0
        ? allleads
        : allleads.filter((r: ILead) => adminCountry.includes(r.home.country));
  } else {
    const profile = await getProfileByEmail(email);
    const agentEmails = [email, ...(profile?.subAgents || [])];

    const allRegs = await Promise.all(
      agentEmails.map((agent) => getLeadsByAgency(agent))
    );

    leads = allRegs.flat().filter(Boolean);
  }

  const rejectedleads = leads.filter((r) => r.progress === "Closed");

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <RefundForm leads={rejectedleads} type="Create" />
    </section>
  );
};

export default CreateRefundPage;
