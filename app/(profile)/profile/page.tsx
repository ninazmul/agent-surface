import {
  getAllProfiles,
  getProfileByEmail,
  getProfilesByEmail,
  getSubAgentsByEmail,
} from "@/lib/actions/profile.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { IProfile } from "@/lib/database/models/profile.model";
import ProfilePage from "@/app/(root)/components/ProfilePage";
import { getLeadsByAgency } from "@/lib/actions/lead.actions";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const adminCountry = await getAdminCountriesByEmail(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);

  if (adminStatus && !rolePermissions.includes("profile")) {
    redirect("/");
  }

  let profiles: IProfile[] = [];

  if (adminStatus) {
    const allProfiles = await getAllProfiles();

    if (adminCountry.length === 0) {
      profiles = allProfiles;
    } else {
      profiles = allProfiles.filter((r: IProfile) =>
        adminCountry.includes(r.country),
      );
    }
  } else {
    profiles = (await getProfilesByEmail(email)) || [];
  }

  const myProfile = await getProfileByEmail(email);
  const myLeads = await getLeadsByAgency(myProfile?.email || "");
  const subAgents = await getSubAgentsByEmail(email);
  const countryAgent = await getProfileByEmail(myProfile?.countryAgent || "");

  const isAgent = myProfile?.role === "Agent";

  const agent = (await getAllProfiles()).filter(
    (p: IProfile) => p.role === "Agent" && p.status === "Approved",
  );

  return (
    <ProfilePage
      adminStatus={adminStatus}
      profiles={profiles}
      myProfile={myProfile}
      countryAgent={countryAgent}
      agent={agent}
      subAgents={subAgents}
      isAgent={isAgent}
      myLeads={myLeads}
      email={email}
    />
  );
};

export default Page;
