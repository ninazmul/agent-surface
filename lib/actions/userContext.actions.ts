import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserEmailById } from "./user.actions";
import { getProfileByEmail, getAllProfiles } from "./profile.actions";
import {
  isAdmin,
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
} from "./admin.actions";
import { getAllLeads, getLeadsByAgency } from "./lead.actions";
import { getCoursesByCountry } from "./course.actions";
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

  if (adminStatus) {
    if (requiredPermission && !rolePermissions.includes(requiredPermission)) {
      redirect("/");
    }
  } else {
    if (!myProfile) redirect("/profile");
    if (myProfile.status !== "Approved") redirect("/profile");

    if (myProfile.role === "Student" && requiredPermission) {
      redirect("/profile");
    }
  }

  let accessibleKeys: string[] = [];

  if (adminStatus) {
    accessibleKeys = rolePermissions.length
      ? rolePermissions.concat("profile")
      : [
          "dashboard",
          "quotations",
          "events",
          "leads",
          "resources",
          "promotions",
          "finance",
          "invoices",
          "downloads",
          "messages",
          "notifications",
          "profile",
          "about",
          "tutorial",
        ];
  } else if (myProfile?.role === "Student") {
    accessibleKeys = [
      "profile",
      "messages",
      "resources",
      "downloads",
      "about",
      "tutorial",
    ];
  } else if (myProfile?.role === "Agent" || myProfile?.role === "Sub Agent") {
    accessibleKeys = [
      "dashboard",
      "quotations",
      "events",
      "leads",
      "resources",
      "promotions",
      "finance",
      "invoices",
      "downloads",
      "messages",
      "notifications",
      "profile",
      "about",
      "tutorial",
    ];
  }

  let agency = [];
  if (adminStatus) {
    agency = await getAllProfiles();
  } else if (myProfile) {
    agency = [myProfile];
  }

  let leads: ILead[] = [];
  if (adminStatus) {
    const allLeads = await getAllLeads();
    leads =
      adminCountry.length === 0
        ? allLeads
        : allLeads.filter((lead: ILead) =>
            adminCountry.includes(lead.home.country),
          );
  } else {
    const agentEmails = [email, ...(myProfile?.subAgents || [])];
    const allLeads = await Promise.all(
      agentEmails.map((agentEmail) => getLeadsByAgency(agentEmail)),
    );
    leads = allLeads.flat().filter(Boolean);
  }

  let courseCountry: string | undefined;

  if (adminStatus) {
    if (adminCountry.length === 1) {
      courseCountry = adminCountry[0];
    }
  } else {
    courseCountry = myProfile?.country || undefined;
  }

  const courses = await getCoursesByCountry(courseCountry);
  const services = await getAllServices();

  return {
    email,
    adminStatus,
    adminCountry,
    rolePermissions,
    myProfile,
    accessibleKeys,
    agency,
    leads,
    courses,
    services,
    courseCountry,
  };
}
