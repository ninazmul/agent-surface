import { Button } from "@/components/ui/button";
import { getAllServices } from "@/lib/actions/service.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import ServiceTable from "../components/ServiceTable";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { Plus } from "lucide-react";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  if (!adminStatus && myProfile?.role === "Student") {
    redirect("/profile");
  }

  if (!adminStatus || (adminStatus && !rolePermissions.includes("services"))) {
    redirect("/");
  }

  const services = await getAllServices();

  return (
    <>
      <section className="p-4">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          <h3 className="h3-bold text-center sm:text-left">All Services</h3>

          {adminStatus && (
            <div className="w-full sm:w-auto">
              <a href="/services/create" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
                >
                  <Plus size={16} /> Add Service
                </Button>
              </a>
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
