import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getPaymentById } from "@/lib/actions/payment.actions";
import PaymentForm from "@/app/(root)/components/PaymentForm";
import { getProfileByEmail } from "@/lib/actions/profile.actions";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);

  const myProfile = await getProfileByEmail(email);

  const payment = await getPaymentById(id);
  if (!payment) redirect("/commissions/payment");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update Payment</h2>
      <PaymentForm
        agency={myProfile}
        Payment={payment}
        PaymentId={payment._id.toString()}
        type="Update"
      />
    </div>
  );
};

export default UpdatePage;
