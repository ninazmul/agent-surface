import { getAllServices } from "@/lib/actions/service.actions";
import ServiceTable from "../components/ServiceTable";
import AddServiceDialog from "@/components/shared/AddServiceDialog";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { adminStatus } = await getUserContext("services");

  const services = await getAllServices();

  return (
    <>
      <section className="p-4">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">All Services</h3>

          {adminStatus && (
            <div className="w-full sm:w-auto">
              <AddServiceDialog />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <ServiceTable services={services} />
        </div>
      </section>
    </>
  );
};

export default Page;
