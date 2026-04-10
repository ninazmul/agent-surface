import QuotationTable from "../components/QuotationTable";
import { getAllLeads, getLeadsByAgency } from "@/lib/actions/lead.actions";
import {
  getAllQuotations,
  getQuotationsByAgency,
} from "@/lib/actions/quotation.actions";
import { getUserContext } from "@/lib/actions/userContext.actions";
import { ILead } from "@/lib/database/models/lead.model";
import { IQuotation } from "@/lib/database/models/quotation.model";
import { Types } from "mongoose";

interface ICombinedItem {
  _id: Types.ObjectId;
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
  // 🔑 One call enforces access rules and gives you user context
  const { email, adminStatus, adminCountry, myProfile } =
    await getUserContext("quotations");

  let leads: ILead[] = [];
  if (adminStatus) {
    const allLeads = await getAllLeads();
    leads =
      adminCountry.length === 0
        ? allLeads
        : allLeads.filter((r: ILead) => adminCountry.includes(r.home.country));
  } else {
    const agentEmails = [email, ...(myProfile?.subAgents || [])];
    const allLeads = await Promise.all(
      agentEmails.map((agent) => getLeadsByAgency(agent)),
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
        : allQuotations.filter((r: IQuotation) =>
            adminCountry.includes(r.home.country),
          );
  } else {
    const agentEmails = [email, ...(myProfile?.subAgents || [])];
    const allQuotations = await Promise.all(
      agentEmails.map((agent) => getQuotationsByAgency(agent)),
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
    <section className="p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
        <h3 className="h3-bold text-center sm:text-left">Converted Leads</h3>
      </div>

      <div className="overflow-x-auto my-8">
        <QuotationTable leads={combinedData} />
      </div>
    </section>
  );
};

export default Page;
