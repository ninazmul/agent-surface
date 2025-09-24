import {
  getAllProfiles,
  getProfileByEmail,
} from "@/lib/actions/profile.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import PromotionLeadForm from "@/app/(root)/components/PromotionLeadForm";
import { getPromotionById } from "@/lib/actions/promotion.actions";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};
const CreateLeadsPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const promotion = await getPromotionById(id);
  if (!promotion) redirect("/promotions");

  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  let agency = [];
  if (adminStatus) {
    agency = await getAllProfiles();
  } else {
    const myAgency = await getProfileByEmail(email);
    if (myAgency) agency = [myAgency];
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <PromotionLeadForm
        email={email}
        agency={agency}
        promotion={promotion}
        isAdmin={adminStatus}
        type="Create"
      />
    </section>
  );
};

export default CreateLeadsPage;
