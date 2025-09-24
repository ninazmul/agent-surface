import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import HomeSidebar from "./components/HomeSidebar";
import MessageCount from "./components/MessageCount";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import NotificationsCount from "./components/Notifications";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default async function AdminLayout({
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

  if (!userId) {
    redirect("/sign-in");
  }

  if (!userId) {
    redirect("/sign-in");
  }

  if (!adminStatus && myProfile?.status === "Pending") {
    redirect("/profile");
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <HomeSidebar rolePermissions={rolePermissions} isAdmin={adminStatus} role={myProfile?.role} />
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
