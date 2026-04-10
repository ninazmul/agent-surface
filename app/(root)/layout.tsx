import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import HomeSidebar from "./components/HomeSidebar";
import MessageCount from "./components/MessageCount";
import {
  getAdminByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import NotificationsCount from "./components/Notifications";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { DashboardProvider } from "@/components/shared/DashboardProvider";
import HelpModal from "@/components/shared/HelpForm";
import { auth } from "@clerk/nextjs/server";
import { getProfileByEmail, getUserEmailById } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  if (!userId) redirect("/sign-in");

  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const myProfile = await getProfileByEmail(email);

  // ✅ Only block if not admin AND profile not approved
  if (!adminStatus && myProfile?.status !== "Approved") {
    redirect("/profile");
  }

  const admin = await getAdminByEmail(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);

  return (
    <SidebarProvider defaultOpen={true}>
      <HomeSidebar
        rolePermissions={rolePermissions}
        isAdmin={adminStatus}
        role={myProfile?.role}
        profile={myProfile}
        admin={admin}
      />
      <Toaster />
      <main className="flex-1 h-screen mx-auto overflow-y-auto relative">
        <div
          className={`flex justify-between items-center p-4 w-full text-white no-print bg-gray-50 dark:bg-gray-900 border-b`}
        >
          <div className="flex items-center justify-start">
            <SidebarTrigger />
            <div>
              <Breadcrumbs />
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:flex">
                &quot;Track everything from here for your recommendations&quot;
              </p>
            </div>
          </div>
          <div className="flex justify-end items-center gap-4">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {adminStatus && <MessageCount />}
              <NotificationsCount />
            </div>
            <SignedIn>
              <UserButton afterSwitchSessionUrl="/" />
            </SignedIn>
          </div>
        </div>

        <div>
          <DashboardProvider>{children}</DashboardProvider>
        </div>

        {/* Floating Help Button */}
        <HelpModal />
      </main>
    </SidebarProvider>
  );
}
