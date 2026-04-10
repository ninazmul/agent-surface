import { getAllResources } from "@/lib/actions/resource.actions";
import ResourceTable from "../components/ResourceTable";
import AddResourceDialog from "@/components/shared/AddResourceDialog";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { adminStatus } =
    await getUserContext("resources");

  const resources = await getAllResources();

  return (
    <>
      <section className="p-4">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          <h3 className="h3-bold text-center sm:text-left">All Resources</h3>

          {/* Action Button */}
          {adminStatus && <AddResourceDialog />}
        </div>

        <div className="overflow-x-auto my-8">
          <ResourceTable resources={resources} isAdmin={adminStatus} />
        </div>
      </section>
    </>
  );
};

export default Page;
