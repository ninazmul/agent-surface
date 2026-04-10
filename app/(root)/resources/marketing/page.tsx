import MarketingResourceTable from "../../components/MarketingResourceTable";
import { IMarketingResource } from "@/lib/database/models/marketing-resource.model";
import { getAllMarketingResources } from "@/lib/actions/marketing-resource.actions";
import AddMarketingResourceDialog from "@/components/shared/AddMarketingResourceDialog";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { adminStatus, adminCountry, myProfile } = await getUserContext("resources");
  const agentCountry = myProfile?.country;

  const allResources = await getAllMarketingResources();

  let resources: IMarketingResource[] = [];

  if (adminStatus) {
    // Admin sees all resources if no country restrictions
    resources =
      !adminCountry || adminCountry.length === 0
        ? allResources
        : allResources.filter((r: IMarketingResource) =>
            r.priceList.some((price) => adminCountry.includes(price.country)),
          );
  } else {
    // Normal agent: show only resources where agent's country matches any resource price country
    if (agentCountry) {
      resources = allResources.filter((r: IMarketingResource) =>
        (r.priceList || []).some((price) => price.country === agentCountry),
      );
    }
  }

  return (
    <section className="p-4">
      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
        <h3 className="h3-bold text-center sm:text-left">
          Marketing Resources
        </h3>

        {adminStatus && <AddMarketingResourceDialog />}
      </div>

      <div className="overflow-x-auto my-8">
        <MarketingResourceTable
          resources={resources || []}
          isAdmin={adminStatus}
          userCountry={agentCountry}
        />
      </div>
    </section>
  );
};

export default Page;
