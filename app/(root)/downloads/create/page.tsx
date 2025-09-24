import { getAllLeads } from "@/lib/actions/lead.actions";
import DownloadForm from "../../components/DownloadForm";
import { getAllProfiles } from "@/lib/actions/profile.actions";

const CreateDocumentPage = async () => {
  const leads = await getAllLeads();
  const agency = await getAllProfiles();

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <DownloadForm type="Create" leads={leads} agency={agency} />
    </section>
  );
};

export default CreateDocumentPage;
