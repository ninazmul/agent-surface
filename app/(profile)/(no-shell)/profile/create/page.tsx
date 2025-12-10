import ProfileForm from "@/app/(root)/components/ProfileForm";
import {
  getAllProfiles,
  getProfileByEmail,
} from "@/lib/actions/profile.actions";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { IProfile } from "@/lib/database/models/profile.model";
import { auth } from "@clerk/nextjs/server";

const CreateProfilePage = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const myProfile = await getProfileByEmail(email);
  const isAgent = myProfile?.role === "Agent";

  const agent = (await getAllProfiles()).filter(
    (p: IProfile) => p.role === "Agent" && p.status === "Approved"
  );

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <ProfileForm
        agent={agent}
        isAgent={isAgent}
        email={email}
        type="Create"
      />
    </section>
  );
};

export default CreateProfilePage;