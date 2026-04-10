import CampaignFormRenderer from "@/components/shared/CampaignFormRenderer";
import { getCampaignFormBySlug } from "@/lib/actions/campaign.actions";
import Image from "next/image";

type PageParams = Promise<{ slug: string }>; 

export default async function CampaignPage({ params }: { params: PageParams }) {
  const { slug } = await params; 
  const data = await getCampaignFormBySlug(slug);

  if (!data)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-6 py-8 text-center shadow-sm">
          <p className="text-base font-medium text-gray-800 dark:text-gray-100">
            Form not found
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please check your campaign link and try again.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4">
        <section className="relative overflow-hidden rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(17,24,39,0.35)]">
          <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/20" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />

          <div className="relative p-6 sm:p-8">
            <p className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 mb-4">
              AB Partner Portal
            </p>

            <div className="mb-5 dark:hidden">
              <Image
                src="/assets/images/logo.png"
                alt="AB Partner Portal"
                width={168}
                height={48}
                className="h-auto w-auto"
                priority
              />
            </div>
            <div className="mb-5 hidden dark:block">
              <Image
                src="/assets/images/logo-white.png"
                alt="AB Partner Portal"
                width={168}
                height={48}
                className="h-auto w-auto"
                priority
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              {data.form.title}
            </h1>
            {data.form.description && (
              <p className="text-[15px] sm:text-base text-gray-600 dark:text-gray-300 mt-2 max-w-3xl">
                {data.form.description}
              </p>
            )}
          </div>

          <div className="relative border-t border-gray-200/80 dark:border-gray-800">
          <CampaignFormRenderer slug={slug} fields={data.fields} />
          </div>
        </section>
      </div>
    </div>
  );
}

