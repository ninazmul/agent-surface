import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAllAssignedLeads,
  getLeadsByAssignedUser,
} from "@/lib/actions/lead.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import {
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { ILead } from "@/lib/database/models/lead.model";
import AssignedLeadTable from "../../components/AssignedLeadTable";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
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
    // Admin → see all assigned leads
    leads = await getAllAssignedLeads();
  } else if (email) {
    // Regular user → see only leads where they are in assignedTo array
    leads = await getLeadsByAssignedUser(email);
  }

  return (
    <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <h3 className="h3-bold text-center sm:text-left">
            All Assigned Leads
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-8">
        <AssignedLeadTable leads={leads} isAdmin={adminStatus} />
      </div>
    </section>
  );
};

export default Page;
