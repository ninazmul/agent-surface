import CampaignFormRenderer from "@/components/shared/CampaignFormRenderer";
import { getCampaignFormBySlug } from "@/lib/actions/campaign.actions";

type PageParams = Promise<{ slug: string }>; 

export default async function CampaignPage({ params }: { params: PageParams }) {
  const { slug } = await params; 
  const data = await getCampaignFormBySlug(slug);

  if (!data) return <div className="p-6 text-center">Form not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-black dark:text-white leading-tight">
            {data.form.title}
          </h1>
          {data.form.description && (
            <p className="text-[15px] text-gray-500 mt-1">
              {data.form.description}
            </p>
          )}
        </header>
        <CampaignFormRenderer slug={slug} fields={data.fields} />
      </div>
    </div>
  );
}

