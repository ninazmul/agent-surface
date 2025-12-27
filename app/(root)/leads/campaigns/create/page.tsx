import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import CampaignFormBuilder from "@/components/shared/CampaignFormBuilder";

const CreateLeadsPage = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <CampaignFormBuilder author={email} />
    </section>
  );
};

export default CreateLeadsPage;
