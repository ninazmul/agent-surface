import {
  getAllDownloads,
  getDownloadsByAgency,
} from "@/lib/actions/download.actions";
import DownloadTable from "../components/DownloadTable";
import { IDownload } from "@/lib/database/models/download.model";
import AddDocDialog from "@/components/shared/AddDocDialog";
import { getAllLeads } from "@/lib/actions";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { email, adminStatus, adminCountry, myProfile, agency } =
    await getUserContext("downloads");

  let downloads: IDownload[] = [];

  if (adminStatus) {
    const allDownloads = await getAllDownloads();
    downloads =
      adminCountry.length === 0
        ? allDownloads
        : allDownloads.filter((r: IDownload) =>
            adminCountry.includes(r.country),
          );
  } else {
    const subAgents = myProfile?.subAgents || [];

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
          <DownloadTable
            downloads={downloads}
            isAdmin={adminStatus}
            leads={leads}
            agency={agency}
          />
        </div>
      </section>
    </>
  );
};

export default Page;
