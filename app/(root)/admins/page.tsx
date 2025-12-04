import { Button } from "@/components/ui/button";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  getAllAdmins,
  isAdmin,
} from "@/lib/actions/admin.actions";
import JsonToExcel from "../components/JsonToExcel";
import AdminTable from "../components/AdminTable";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { IAdmin } from "@/lib/database/models/admin.model";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { Plus } from "lucide-react";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const adminCountries = await getAdminCountriesByEmail(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  if (!adminStatus && myProfile?.role === "Student") {
    redirect("/profile");
  }

  if (!adminStatus || (adminStatus && !rolePermissions.includes("admins"))) {
    redirect("/");
  }

  const allAdmins = await getAllAdmins();

  const admins: IAdmin[] =
    adminCountries.length === 0
      ? allAdmins
      : allAdmins.filter((admin: IAdmin) =>
          admin.countries?.some((country) => adminCountries.includes(country))
        );

  return (
    <>
      <section className="p-4">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">All Admins</h3>

          <a href={`/admins/create`} className="w-full sm:w-auto">
            <Button
              size="sm"
              className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
            >
              <Plus size={16} /> Add Admin
            </Button>
          </a>
        </div>

        <div className="overflow-x-auto">
          <AdminTable admins={admins} currentAdminCountries={adminCountries} />
        </div>
      </section>
    </>
  );
};

export default Page;
