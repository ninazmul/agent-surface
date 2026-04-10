import { getAllUsers, getUserEmailById } from "@/lib/actions/user.actions";
import UserTable from "../components/UserTable";
import JsonToExcel from "../components/JsonToExcel";
import { auth } from "@clerk/nextjs/server";
import {
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { getProfileByEmail } from "@/lib/actions/profile.actions";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  // ====== ADMIN PATH (profile not required)
  if (adminStatus) {
    if (!rolePermissions.includes("users")) {
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

  const users = await getAllUsers();

  return (
    <>
      <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <h3 className="h3-bold text-center sm:text-left">All Users</h3>
            <JsonToExcel data={users} fileName="users.xlsx" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto my-8">
          <UserTable users={users} />
        </div>
      </section>
    </>
  );
};

export default Page;
