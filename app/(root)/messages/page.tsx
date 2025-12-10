import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import MessageTable from "../components/MessageTable";
import { redirect } from "next/navigation";
import { Role } from "@/lib/database/models/message.model";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;

  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  let role: Role;

  if (adminStatus) {
    const rolePermissions = await getAdminRolePermissionsByEmail(email);
    if (!rolePermissions.includes("messages")) {
      redirect("/");
    }
    role = "Admin"; // must match Role type
  } else {
    // Non-admin logic: get from profile
    const profile = await getProfileByEmail(email);
    const allowedRoles: Role[] = ["Agent", "Sub Agent", "Student"];
    if (!profile?.role || !allowedRoles.includes(profile.role)) {
      redirect("/");
    }
    role = profile.role;
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="h3-bold text-center sm:text-left">Inbox</h3>
      <MessageTable email={email} role={role} />
    </div>
  );
};

export default Page;
