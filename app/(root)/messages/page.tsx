import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import MessageForm from "../components/MessageForm";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import MessageTable from "../components/MessageTable";
import Conversation from "../components/Conversation";
import { redirect } from "next/navigation";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import SubAgentMessagesTable from "../components/SubAgentMessagesTable";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  if (adminStatus) {
    const rolePermissions = await getAdminRolePermissionsByEmail(email);
    const adminCountry = await getAdminCountriesByEmail(email);

    if (!rolePermissions.includes("messages")) {
      redirect("/");
    }

    return (
      <div className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        <MessageTable email={email} role="admin" country={adminCountry || []} />
      </div>
    );
  }

  // Only fetch profile for non-admin users
  const profile = await getProfileByEmail(email);
  const hasSubAgents = profile?.subAgents?.length > 0;

  return (
    <>
      <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        {/* Their own conversation */}
        <Conversation userEmail={email} />
        <MessageForm
          userEmail={email}
          senderEmail={email}
          country={profile.country || ""}
          senderRole="user"
          type="Create"
        />
      </section>

      {/* Message form */}
      {hasSubAgents && (
        <div className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
          <SubAgentMessagesTable email={email} />
        </div>
      )}
    </>
  );
};

export default Page;
