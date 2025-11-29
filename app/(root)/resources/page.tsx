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
import { Plus } from "lucide-react";

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
      <section className="p-4">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          <h3 className="h3-bold text-center sm:text-left">All Resources</h3>

          {/* Action Button */}
          {adminStatus && (
            <a href="/resources/create" className="w-full sm:w-auto">
              <Button
                size="sm"
                className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
              >
                <Plus size={16} /> Add Resource
              </Button>
            </a>
          )}
        </div>

        <div className="overflow-x-auto my-8">
          <ResourceTable resources={resources} isAdmin={adminStatus} />
        </div>
      </section>
    </>
  );
};

export default Page;
