import {
  getAllDownloads,
  getDownloadsByAgency,
} from "@/lib/actions/download.actions";
import DownloadTable from "../components/DownloadTable";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { getAllProfiles, getProfileByEmail } from "@/lib/actions/profile.actions";
import { redirect } from "next/navigation";
import { IDownload } from "@/lib/database/models/download.model";
import AddDocDialog from "@/components/shared/AddDocDialog";
import { getAllLeads } from "@/lib/actions";

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
    if (!rolePermissions.includes("downloads")) {
      redirect("/");
    }
  }
  // ====== NON-ADMIN PATH (profile required)
  else {
    // Profile must be Approved
    if (myProfile?.status !== "Approved") {
      redirect("/profile");
    }
  }

  let downloads: IDownload[] = [];

  if (adminStatus) {
    const allDownloads = await getAllDownloads();

    downloads =
      adminCountry.length === 0
        ? allDownloads
        : allDownloads.filter((r: IDownload) =>
            adminCountry.includes(r.country)
          );
  } else {
    const profile = await getProfileByEmail(email);
    const subAgents = profile?.subAgents || [];

    const myDownloads = (await getDownloadsByAgency(email)) || [];
    let subAgentDownloads: IDownload[] = [];

    for (const agentEmail of subAgents) {
      const agentDownloads = await getDownloadsByAgency(agentEmail);
      if (agentDownloads) {
        subAgentDownloads = subAgentDownloads.concat(agentDownloads);
      }
    }

    downloads = [...myDownloads, ...subAgentDownloads];
  }

  const leads = await getAllLeads();
  const agency = await getAllProfiles();

  return (
    <>
      <section className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">All Docs</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            {adminStatus && <AddDocDialog agency={agency} leads={leads} />}
          </div>
        </div>

        <div className="overflow-x-auto">
          <DownloadTable downloads={downloads} isAdmin={adminStatus} leads={leads} agency={agency} />
        </div>
      </section>
    </>
  );
};

export default Page;
