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
      <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          {/* Title */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <h3 className="h3-bold text-center sm:text-left">All Services</h3>
          </div>

          {/* Action Button */}
          {adminStatus && (
            <div className="w-full sm:w-auto">
              <a href="/services/create" className="w-full sm:w-auto">
                <Button size="lg" className="rounded-full w-full sm:w-auto">
                  Create Service
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto my-8">
          <ServiceTable services={services} />
        </div>
      </section>
    </>
  );
};

export default Page;
