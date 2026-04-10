import { getAllAdmins } from "@/lib/actions/admin.actions";
import AdminTable from "../components/AdminTable";
import { IAdmin } from "@/lib/database/models/admin.model";
import AddAdminDialog from "@/components/shared/AddAdminDialog";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { adminCountry } = await getUserContext("admins");

  // Only admins reach here (non-admins are redirected inside getUserContext)
  const allAdmins = await getAllAdmins();

  const admins: IAdmin[] =
    adminCountry.length === 0
      ? allAdmins
      : allAdmins.filter((admin: IAdmin) =>
          admin.countries?.some((country) => adminCountry.includes(country)),
        );

  return (
    <>
      <section className="p-4">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">All Admins</h3>

          <AddAdminDialog />
        </div>

        <div className="overflow-x-auto">
          <AdminTable admins={admins} currentAdminCountries={adminCountry} />
        </div>
      </section>
    </>
  );
};

export default Page;
