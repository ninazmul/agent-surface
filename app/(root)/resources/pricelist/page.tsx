import { getAllResourcePriceLists } from "@/lib/actions/resource-pricelist.actions";
import { IResourcePriceList } from "@/lib/database/models/resource-pricelist.model";
import ResourcePriceListCards from "../../components/ResourcePriceListTable";
import AddResourcePricelistDialog from "@/components/shared/AddResourcePricelistDialog";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { adminStatus, adminCountry, myProfile } = await getUserContext("resources");
    const agentCountry = myProfile?.country;

  const allResources = await getAllResourcePriceLists();

  let resources: IResourcePriceList[] = [];

  if (adminStatus) {
    // Admin sees all resources if no country restrictions
    resources =
      !adminCountry || adminCountry.length === 0
        ? allResources
        : allResources.filter((r: IResourcePriceList) =>
            adminCountry.includes(r.country)
          );
  } else {
    // Normal user: show only resources matching user's country
    if (agentCountry) {
      resources = allResources.filter(
        (r: IResourcePriceList) => r.country === agentCountry
      );
    }
  }

  return (
    <>
      <section className="p-4">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          <h3 className="h3-bold text-center sm:text-left">All Price List</h3>

          {/* Action Button */}
          {adminStatus && <AddResourcePricelistDialog />}
        </div>

        <div className="overflow-x-auto my-8">
          <ResourcePriceListCards resources={resources} isAdmin={adminStatus} />
        </div>
      </section>
    </>
  );
};

export default Page;
