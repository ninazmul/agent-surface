import {
  getAllProfiles,
  getProfileByEmail,
} from "@/lib/actions/profile.actions";
import { getCoursesByCountry } from "@/lib/actions/course.actions";
import { getAllServices } from "@/lib/actions/service.actions";
import AdditionalQuotationForm from "@/app/(root)/components/AdditionalQuotationForm";
import { getAllLeads, getLeadsByAgency } from "@/lib/actions/lead.actions";
import { ILead } from "@/lib/database/models/lead.model";
import { getUserContext } from "@/lib/actions/userContext.actions";
// import { getAllServices } from "@/lib/actions/service.actions";

const CreateLeadsPage = async () => {
  const { email, adminStatus, adminCountry } =
    await getUserContext("quotations");

  let agency = [];
  if (adminStatus) {
    agency = await getAllProfiles();
  } else {
    const myAgency = await getProfileByEmail(email);
    if (myAgency) agency = [myAgency];
  }

  const courses = await getCoursesByCountry();
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
      agentEmails.map((agent) => getLeadsByAgency(agent)),
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
