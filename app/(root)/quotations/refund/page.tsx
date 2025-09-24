import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getAllCourses } from "@/lib/actions/course.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import {
  getAllRefunds,
  getRefundsByAgency,
} from "@/lib/actions/refund.actions";
import { IRefund } from "@/lib/database/models/refund.model";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import RefundTable from "../../components/RefundTable";
import JsonToExcel from "../../components/JsonToExcel";

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

  if (adminStatus && !rolePermissions.includes("applications")) {
    redirect("/");
  }

  let refunds: IRefund[] = [];

  if (adminStatus) {
    const allRefunds = await getAllRefunds();

    refunds =
      adminCountry.length === 0
        ? allRefunds
        : allRefunds.filter((r: IRefund) => adminCountry.includes(r.country));
  } else {
    const profile = await getProfileByEmail(email);
    const agentEmails = [email, ...(profile?.subAgents || [])];

    const allRefunds = await Promise.all(
      agentEmails.map((agent) => getRefundsByAgency(agent))
    );

    refunds = allRefunds.flat().filter(Boolean);
  }

  const courses = await getAllCourses();

  return (
    <>
      <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">Refund Requests</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <JsonToExcel data={refunds} fileName="refunds.xlsx" />
            <a
              className="w-full sm:w-auto"
              href={`/applications/refund/create`}
            >
              <Button size="lg" className="rounded-full w-full sm:w-auto">
                Request Refund
              </Button>
            </a>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <RefundTable
            refunds={refunds}
            courses={courses}
            isAdmin={adminStatus}
          />
        </div>
      </section>
    </>
  );
};

export default Page;
