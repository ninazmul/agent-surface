import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import HomeSidebar from "../(root)/components/HomeSidebar";
import { Toaster } from "react-hot-toast";
import MessageCount from "../(root)/components/MessageCount";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import NotificationsCount from "../(root)/components/Notifications";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { getProfileByEmail } from "@/lib/actions/profile.actions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);
  
  return (
    <SidebarProvider defaultOpen={true}>
      <HomeSidebar
        rolePermissions={rolePermissions}
        isAdmin={adminStatus}
        role={myProfile?.role}
      />
      <Toaster />
      <main className="flex-1 h-screen mx-auto overflow-y-auto">
        <div
          className={`flex justify-between items-center p-4 w-full-10 rounded-2xl m-1 text-white no-print ${
            adminStatus ? "bg-purple-900" : "bg-primary-900"
          }`}
        >
          <SidebarTrigger />
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
        <div className="p-2">
          <Breadcrumbs />
        </div>
        <div className="p-2">{children}</div>
      </main>
    </SidebarProvider>
  );
}
