import ProfileForm from "@/app/(root)/components/ProfileForm";
import { getAllProfiles } from "@/lib/actions/profile.actions";
import { IProfile } from "@/lib/database/models/profile.model";

const CreateProfilePage = async () => {

  const agent = (await getAllProfiles()).filter(
      (p: IProfile) => p.role === "Agent" && p.status === "Approved"
    );

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <ProfileForm agent={agent} type="Create" />
    </section>
  );
};

export default CreateProfilePage;
