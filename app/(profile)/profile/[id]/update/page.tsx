import ProfileForm from "@/app/(root)/components/ProfileForm";
import { getAllProfiles, getProfileById } from "@/lib/actions/profile.actions";
import { IProfile } from "@/lib/database/models/profile.model";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;

  const profile = await getProfileById(id);

  const agent = (await getAllProfiles()).filter(
    (p: IProfile) => p.role === "Agent" && p.status === "Approved"
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update Profile</h2>
      <ProfileForm
        profile={profile}
        profileId={id}
        agent={agent}
        type="Update"
      />
    </div>
  );
};

export default UpdatePage;
