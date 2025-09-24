import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import PaymentForm from "@/app/(root)/components/PaymentForm";

const CreatePaymentPage = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  const myProfile = await getProfileByEmail(email);

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <PaymentForm
        type="Create"
        agency={myProfile}
        isAdmin={adminStatus}
      />
    </section>
  );
};

export default CreatePaymentPage;
