import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getAllLeads, getLeadsByAgency } from "@/lib/actions/lead.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { ILead } from "@/lib/database/models/lead.model";
import QuotationTable from "../components/QuotationTable";
import { IQuotation } from "@/lib/database/models/quotation.model";
import {
  getAllQuotations,
  getQuotationsByAgency,
} from "@/lib/actions/quotation.actions";

interface ICombinedItem {
  _id: string;
  name?: string;
  email?: string;
  number?: string;
  quotationStatus?: boolean;
  isPinned?: boolean;
  discount?: number | string;
  home: {
    address: string;
    zip: string;
    country: string;
    state: string;
    city: string;
  };
  course?: {
    name: string;
    courseDuration?: string;
    courseType?: string;
    courseFee?: string;
  }[];
  services?: {
    _id: string;
    serviceType: string;
    title: string;
    amount?: string;
    description?: string;
  }[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  author?: string;
  type: "Lead" | "Quotation";
  isAdditional?: boolean;
}

const Page = async () => {
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

  // Filter only Converted leads
  leads = leads.filter((lead: ILead) => lead.progress === "Converted");

  let quotations: IQuotation[] = [];

  if (adminStatus) {
    const allQuotations = await getAllQuotations();

    quotations =
      adminCountry.length === 0
        ? allQuotations
        : allQuotations.filter((r: ILead) =>
            adminCountry.includes(r.home.country)
          );
  } else {
    const profile = await getProfileByEmail(email);
    const agentEmails = [email, ...(profile?.subAgents || [])];

    const allQuotations = await Promise.all(
      agentEmails.map((agent) => getQuotationsByAgency(agent))
    );

    quotations = allQuotations.flat().filter(Boolean);
  }

  const mapLeadToCombined = (item: ILead): ICombinedItem => ({
    type: "Lead",
    ...item,
  });

  const mapQuotationToCombined = (item: IQuotation): ICombinedItem => ({
    type: "Quotation",
    ...item,
  });

  const combinedData: ICombinedItem[] = [
    ...leads.map(mapLeadToCombined),
    ...quotations.map(mapQuotationToCombined),
  ];

  combinedData.sort((a, b) => {
    const dateA = new Date(a.createdAt || "").getTime();
    const dateB = new Date(b.createdAt || "").getTime();
    return dateB - dateA;
  });

  return (
    <>
      <section className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          <h3 className="h3-bold text-center sm:text-left">Converted Leads</h3>
        </div>

        <div className="overflow-x-auto my-8">
          <QuotationTable leads={combinedData} />
        </div>
      </section>
    </>
  );
};

export default Page;
