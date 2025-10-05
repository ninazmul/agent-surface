import { getUserByClerkId, getUserEmailById } from "./user.actions";
import { isAdmin, getAdminCountriesByEmail } from "./admin.actions";
import { getAllLeads, getLeadsByAgency } from "./lead.actions";
import { ILead } from "../database/models/lead.model";

export const getDashboardLeads = async (clerkId: string) => {
  const user = await getUserByClerkId(clerkId);
  const email = await getUserEmailById(user);

  const [adminStatus, adminCountries, allLeads, agencyLeads] = await Promise.all([
    isAdmin(email),
    getAdminCountriesByEmail(email),
    getAllLeads(),
    getLeadsByAgency(email),
  ]);

  if (adminStatus) {
    return adminCountries.length
      ? allLeads.filter((l: ILead) => adminCountries.includes(l.home.country))
      : allLeads;
  }

  return agencyLeads || [];
};
