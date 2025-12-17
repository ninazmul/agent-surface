import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { getFilteredLeads } from "@/lib/actions/lead.actions";
import LeadTableClient from "../components/LeadTableClient";

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

const Page = async ({ searchParams }: PageProps) => {
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

  if (adminStatus && !rolePermissions.includes("leads")) {
    redirect("/");
  }

  const page = Number(searchParams.page) || 1;
  const limit = 20;

  // 🔥 DATABASE-LEVEL FILTERING
  const result = await getFilteredLeads({
    page,
    limit,
    author: adminStatus ? undefined : email,
  });

  // 🌍 Admin country filter (still DB-friendly)
  const filteredLeads =
    adminStatus && adminCountry.length
      ? result.data.filter((l) => adminCountry.includes(l.home.country))
      : result.data;

  return (
    <LeadTableClient
      initialLeads={filteredLeads}
      pagination={result.pagination}
      isAdmin={adminStatus}
      email={email}
    />
  );
};

export default Page;
