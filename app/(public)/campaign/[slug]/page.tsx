import CampaignFormRenderer from "@/components/shared/CampaignFormRenderer";
import { getCampaignFormBySlug } from "@/lib/actions/campaign.actions";

export default async function CampaignPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getCampaignFormBySlug(params.slug);

  if (!data) {
    return <div className="p-6 text-center">Form not found</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{data.form.title}</h1>
      {data.form.description && (
        <p className="text-gray-600 mb-4">{data.form.description}</p>
      )}

      <CampaignFormRenderer slug={params.slug} fields={data.fields} />
    </div>
  );
}
