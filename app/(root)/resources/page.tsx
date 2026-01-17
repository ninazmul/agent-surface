import { getAllResources } from "@/lib/actions/resource.actions";
import ResourceTable from "../components/ResourceTable";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { redirect } from "next/navigation";
import AddResourceDialog from "@/components/shared/AddResourceDialog";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  // ====== ADMIN PATH (profile not required)
  if (adminStatus) {
    if (!rolePermissions.includes("resources")) {
      redirect("/");
    }
  }
  // ====== NON-ADMIN PATH (profile required)
  else {
    // Profile must be Approved
    if (myProfile?.status !== "Approved") {
      redirect("/profile");
    }
  }

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
