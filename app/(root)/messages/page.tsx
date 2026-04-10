import MessageTable from "../components/MessageTable";
import { redirect } from "next/navigation";
import { Role } from "@/lib/database/models/message.model";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { email, adminStatus, myProfile } =
    await getUserContext("messages");

  let role: Role;

  if (adminStatus) {
    // Admins must have "messages" permission (already enforced in getUserContext)
    role = "Admin";
  } else {
    // Non-admins: resolve via profile
    const allowedRoles: Role[] = ["Agent", "Sub Agent", "Student"];

    if (!myProfile?.role || !allowedRoles.includes(myProfile.role)) {
      // If role is missing or not allowed, block access
      return redirect("/");
    }

    role = myProfile.role as Role;
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="h3-bold text-center sm:text-left">Inbox</h3>
      <MessageTable email={email} role={role} />
    </div>
  );
};

export default Page;
