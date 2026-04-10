import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserEmailById } from "./user.actions";
import { getProfileByEmail, getAllProfiles } from "./profile.actions";
import { isAdmin, getAdminCountriesByEmail, getAdminRolePermissionsByEmail } from "./admin.actions";
import { getAllLeads, getLeadsByAgency } from "./lead.actions";
import { getAllCourses } from "./course.actions";
import { getAllServices } from "./service.actions";
import { ILead } from "@/lib/database/models/lead.model";

export async function getUserContext(requiredPermission?: string) {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);

  const adminStatus = await isAdmin(email);
  const adminCountry = await getAdminCountriesByEmail(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  // ====== ADMIN PATH
  if (adminStatus) {
    if (requiredPermission && !rolePermissions.includes(requiredPermission)) {
      redirect("/");
    }
  } 
  // ====== NON-ADMIN PATH
  else {
    // Must have a profile
    if (!myProfile) {
      redirect("/profile");
    }

    // Profile must be Approved
    if (myProfile.status !== "Approved") {
      redirect("/profile");
    }

    // Students are blocked
    if (myProfile.role === "Student") {
      redirect("/profile");
    }
  }

  // Agency resolution
  let agency = [];
  if (adminStatus) {
    agency = await getAllProfiles();
  } else {
    if (myProfile) agency = [myProfile];
  }

  // Leads resolution
  let leads: ILead[] = [];
  if (adminStatus) {
    const allLeads = await getAllLeads();
    leads =
      adminCountry.length === 0
        ? allLeads
        : allLeads.filter((r: ILead) => adminCountry.includes(r.home.country));
  } else {
    const agentEmails = [email, ...(myProfile?.subAgents || [])];
    const allLeads = await Promise.all(agentEmails.map((agent) => getLeadsByAgency(agent)));
    leads = allLeads.flat().filter(Boolean);
  }

  // Courses & Services
  const courses = await getAllCourses();
  const services = await getAllServices();

  return {
    email,
    adminStatus,
    adminCountry,
    rolePermissions,
    myProfile,
    agency,
    leads,
    courses,
    services,
  };
}
