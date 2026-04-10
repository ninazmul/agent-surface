import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAllPayments,
  getPaymentsByAgency,
} from "@/lib/actions/payment.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { IPayment } from "@/lib/database/models/payment.model";
import PaymentTable from "../../components/PaymentTable";
import AddPaymentDialog from "@/components/shared/AddPaymentDialog";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const adminCountry = await getAdminCountriesByEmail(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  if (!adminStatus && myProfile?.role === "Student") {
    redirect("/profile");
  }

  if (adminStatus && !rolePermissions.includes("finance")) {
    redirect("/");
  }

  let payments: IPayment[] = [];

  if (adminStatus) {
    const allPayments = await getAllPayments();

    payments =
      adminCountry.length === 0
        ? allPayments
        : allPayments.filter((p: IPayment) => adminCountry.includes(p.country));
  } else {
    const profile = await getProfileByEmail(email);
    const agentEmails = [email, ...(profile?.subAgents || [])];

    const payResults = await Promise.all(
      agentEmails.map((agent) => getPaymentsByAgency(agent)),
    );

    payments = payResults.flat().filter(Boolean);
  }

  return (
    <>
      <section className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">Request Payment</h3>

          <AddPaymentDialog agency={myProfile} isAdmin={adminStatus} />
        </div>

        <div className="overflow-x-auto">
          <PaymentTable
            payments={payments}
            isAdmin={adminStatus}
            agency={myProfile}
          />
        </div>
      </section>
    </>
  );
};

export default Page;
