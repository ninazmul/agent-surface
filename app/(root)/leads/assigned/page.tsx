import AssignedLeadTable from "../../components/AssignedLeadTable";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { email, adminStatus } = await getUserContext("leads");

  let leads = [];
  if (adminStatus) {
    // Admins see all assigned leads
    const { getAllAssignedLeads } = await import("@/lib/actions/lead.actions");
    leads = await getAllAssignedLeads();
  } else if (email) {
    // Non-admins see only their assigned leads
    const { getLeadsByAssignedUser } =
      await import("@/lib/actions/lead.actions");
    leads = await getLeadsByAssignedUser(email);
  }

  return (
    <section className="p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
        <h3 className="h3-bold text-center sm:text-left">All Assigned Leads</h3>
      </div>

      <div className="overflow-x-auto my-8">
        <AssignedLeadTable leads={leads} isAdmin={adminStatus} />
      </div>
    </section>
  );
};

export default Page;
