import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { getAllLeads, getLeadsByAgency } from "@/lib/actions/lead.actions";
import { ILead } from "@/lib/database/models/lead.model";
import { IQuotation } from "@/lib/database/models/quotation.model";
import {
  getAllQuotations,
  getQuotationsByAgency,
} from "@/lib/actions/quotation.actions";
import CommissionReceivedTable from "../../components/CommissionReceivedTable";
import { Types } from "mongoose";

interface ICombinedItem {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  number?: string;
  quotationStatus?: boolean;
  paymentStatus?: string;
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

  if (adminStatus && !rolePermissions.includes("finance")) {
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
  leads = leads.filter(
    (lead: ILead) =>
      lead.quotationStatus === true && lead.paymentStatus === "Accepted"
  );

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

  // Filter only Converted quotations
  quotations = quotations.filter(
    (quotation: IQuotation) =>
      quotation.quotationStatus === true && quotation.paymentStatus === "Accepted"
  );

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
      <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">
            Received Payments
          </h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <CommissionReceivedTable leads={combinedData} isAdmin={adminStatus} email={email} />
        </div>
      </section>
    </>
  );
};

export default Page;
