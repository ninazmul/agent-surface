import { getDownloadById } from "@/lib/actions/download.actions";
import { redirect } from "next/navigation";
import DownloadForm from "@/app/(root)/components/DownloadForm";
import { getAllLeads } from "@/lib/actions/lead.actions";
import { getAllProfiles } from "@/lib/actions/profile.actions";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;

  const download = await getDownloadById(id);
  if (!download) redirect("/downloads");

  const leads = await getAllLeads();
  const agency = await getAllProfiles();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update Document</h2>
      <DownloadForm
        download={download}
        downloadId={id}
        type="Update"
        leads={leads}
        agency={agency}
      />
    </div>
  );
};

export default UpdatePage;
