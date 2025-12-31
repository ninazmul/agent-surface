import CampaignFormRenderer from "@/components/shared/CampaignFormRenderer";
import { getCampaignFormBySlug } from "@/lib/actions/campaign.actions";

type PageParams = Promise<{ slug: string }>; 

export default async function CampaignPage({ params }: { params: PageParams }) {
  const { slug } = await params; 
  
  const data = await getCampaignFormBySlug(slug);

  if (!data) return <div className="p-6 text-center">Form not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{data.form.title}</h1>
      {data.form.description && (
        <p className="text-gray-600 mb-4">{data.form.description}</p>
      )}
      <CampaignFormRenderer slug={slug} fields={data.fields} />
    </div>
  );
}

