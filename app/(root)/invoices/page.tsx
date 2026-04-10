import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { redirect } from "next/navigation";
import { ILead } from "@/lib/database/models/lead.model";
import { getAllLeads, getLeadsByAgency } from "@/lib/actions/lead.actions";
import InvoiceTable from "../components/InvoiceTable";
import { IQuotation } from "@/lib/database/models/quotation.model";
import {
  getAllQuotations,
  getQuotationsByAgency,
} from "@/lib/actions/quotation.actions";
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
    _id: Types.ObjectId;
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

  // ====== ADMIN PATH (profile not required)
  if (adminStatus) {
    if (!rolePermissions.includes("invoices")) {
      redirect("/");
    }
  } 
  // ====== NON-ADMIN PATH (profile required)
  else {
    // Profile must be Approved
    if (myProfile?.status !== "Approved") {
      redirect("/profile");
    }

    // Students are blocked
    if (myProfile?.role === "Student") {
      redirect("/profile");
    }
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
  leads = leads.filter((lead: ILead) => lead.quotationStatus === true);

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
    (quotation: IQuotation) => quotation.quotationStatus === true
  );

  const mapLeadToCombined = (item: ILead): ICombinedItem => ({
    type: "Lead",
    ...item,
    services: item.services?.map((s) => ({
      ...s,
      _id: new Types.ObjectId(s._id),
    })),
  });

  const mapQuotationToCombined = (item: IQuotation): ICombinedItem => ({
    type: "Quotation",
    ...item,
    services: item.services?.map((s) => ({
      ...s,
      _id: new Types.ObjectId(s._id),
    })),
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">All Invoices</h3>
        </div>

        <div className="overflow-x-auto my-8">
          <InvoiceTable leads={combinedData} />
        </div>
      </section>
    </>
  );
};

export default Page;
