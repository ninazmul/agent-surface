import { Button } from "@/components/ui/button";
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
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { redirect } from "next/navigation";
import { IDownload } from "@/lib/database/models/download.model";
import { Plus } from "lucide-react";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const adminCountry = await getAdminCountriesByEmail(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);

  if (adminStatus && !rolePermissions.includes("downloads")) {
    redirect("/");
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

  return (
    <>
      <section className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">All Docs</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            {adminStatus && (
              <a href={`/downloads/create`} className="w-full sm:w-auto">
                <Button
                  size="sm"
                  className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
                >
                  <Plus size={16} /> Add Docs
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <DownloadTable downloads={downloads} isAdmin={adminStatus} />
        </div>
      </section>
    </>
  );
};

export default Page;
