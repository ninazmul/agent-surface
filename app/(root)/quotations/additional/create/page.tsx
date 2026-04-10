import {
  getAllProfiles,
  getProfileByEmail,
} from "@/lib/actions/profile.actions";
import { getAllCourses } from "@/lib/actions/course.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getAdminCountriesByEmail, isAdmin } from "@/lib/actions/admin.actions";
import { getAllServices } from "@/lib/actions/service.actions";
import AdditionalQuotationForm from "@/app/(root)/components/AdditionalQuotationForm";
import { getAllLeads, getLeadsByAgency } from "@/lib/actions/lead.actions";
import { ILead } from "@/lib/database/models/lead.model";
// import { getAllServices } from "@/lib/actions/service.actions";

const CreateLeadsPage = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const adminCountry = await getAdminCountriesByEmail(email);

  let agency = [];
  if (adminStatus) {
    agency = await getAllProfiles();
  } else {
    const myAgency = await getProfileByEmail(email);
    if (myAgency) agency = [myAgency];
  }

  const courses = await getAllCourses();
  const services = await getAllServices();

  let leads: ILead[] = [];

  if (adminStatus) {
    const allLeads = await getAllLeads();

    leads =
      adminCountry.length === 0
        ? allLeads
        : allLeads.filter((r: ILead) => adminCountry.includes(r.home.country));
  } else {
    const profile = await getProfileByEmail(email);
    const agentEmails = [email, ...(profile?.subAgents || [])];

    const allLeads = await Promise.all(
      agentEmails.map((agent) => getLeadsByAgency(agent))
    );

    leads = allLeads.flat().filter(Boolean);
  }

  leads = leads.filter((lead: ILead) => lead.isVoid === true);

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <AdditionalQuotationForm
        leads={leads}
        email={email}
        agency={agency}
        courses={courses}
        services={services}
        isAdmin={adminStatus}
        type="Create"
      />
    </section>
  );
};

export default CreateLeadsPage;
