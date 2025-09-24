import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import EventCalender from "../components/EventCalenderTable";
import {
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { getProfileByEmail } from "@/lib/actions/profile.actions";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  if (!adminStatus && myProfile?.role === "Student") {
    redirect("/profile");
  }

  if (adminStatus && !rolePermissions.includes("events")) {
    redirect("/");
  }

  return (
    <>
      <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">Upcoming Events</h3>

          {adminStatus && (
            <a href={`/events/create`} className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full w-full sm:w-auto">
                Create Event
              </Button>
            </a>
          )}
        </div>

        {/* Calendar */}
        <div className="overflow-x-auto mb-8">
          <EventCalender />
        </div>
      </section>
    </>
  );
};

export default Page;
