import {
  getAllProfiles,
  getProfileByEmail,
  getProfilesByEmail,
  getSubAgentsByEmail,
} from "@/lib/actions/profile.actions";
import { IProfile } from "@/lib/database/models/profile.model";
import ProfilePage from "@/app/(root)/components/ProfilePage";
import { getLeadsByAgency } from "@/lib/actions/lead.actions";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { email, adminStatus, adminCountry, myProfile } =
    await getUserContext("profile");

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
