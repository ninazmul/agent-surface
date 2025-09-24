import { Button } from "@/components/ui/button";
import { getAllResources } from "@/lib/actions/resource.actions";
import ResourceTable from "../components/ResourceTable";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);

  if (adminStatus && !rolePermissions.includes("resources")) {
    redirect("/");
  }

  const resources = await getAllResources();

  return (
    <>
      <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          {/* Title */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <h3 className="h3-bold text-center sm:text-left">All Resources</h3>
          </div>

          {/* Action Button */}
          {adminStatus && (
            <div className="w-full sm:w-auto">
              <a href="/resources/create" className="w-full sm:w-auto">
                <Button size="lg" className="rounded-full w-full sm:w-auto">
                  Add Resource
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto my-8">
          <ResourceTable resources={resources} isAdmin={adminStatus} />
        </div>
      </section>
    </>
  );
};

export default Page;
