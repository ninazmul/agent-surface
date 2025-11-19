import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";

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
      agentEmails.map((agent) => getPaymentsByAgency(agent))
    );

    payments = payResults.flat().filter(Boolean);
  }

  return (
    <>
      <section className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">Payment Withdraw</h3>

          <a href={`/finance/payment/create`} className="w-full sm:w-auto">
            <Button
              size="sm"
              className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
            >
              <Plus size={16} /> Request Payment
            </Button>
          </a>
        </div>

        <div className="overflow-x-auto">
          <PaymentTable payments={payments} isAdmin={adminStatus} />
        </div>
      </section>
    </>
  );
};

export default Page;
