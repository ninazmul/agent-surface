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
import AddServiceDialog from "@/components/shared/AddServiceDialog";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  // ====== ADMIN PATH (profile not required)
  if (adminStatus) {
    if (!rolePermissions.includes("services")) {
      redirect("/");
    }
  }
  // ====== NON-ADMIN PATH (profile required)
  else {
    // Profile must be Approved
    if (myProfile?.status !== "Approved") {
      redirect("/profile");
    }

    // Students are blocked
    if (myProfile?.role === "Student") {
      redirect("/profile");
    }
  }

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
