"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Lead from "../database/models/lead.model";
import { CampaignSubmission, LeadParams } from "@/types";
import { revalidatePath } from "next/cache";

// ====== CREATE LEAD
export const createLead = async (params: LeadParams) => {
  try {
    await connectToDatabase();
    const newLead = await Lead.create(params);

    revalidatePath("/leads");

    return JSON.parse(JSON.stringify(newLead));
  } catch (error) {
    handleError(error);
  }
};

// ====== BULK CREATE LEAD
export const bulkCreateLeads = async (leads: LeadParams[]) => {
  try {
    await connectToDatabase();

    const newLeads = await Lead.insertMany(leads, { ordered: false });
    // ordered:false → continues inserting even if some fail

    revalidatePath("/leads");

    return JSON.parse(JSON.stringify(newLeads));
  } catch (error) {
    handleError(error);
  }
};


export const bulkCreateLeadsFromSubmissions = async (
  submissions: CampaignSubmission[]
) => {
  const leads: LeadParams[] = submissions.map(({ answers, author }) => ({
    name: answers.name,
    email: answers.email,
    number: answers.number,
    gender: answers.gender,
    maritalStatus: answers.maritalStatus,
    dateOfBirth: new Date(answers.dateOfBirth),

    home: {
      address: answers.address ?? "",
      city: answers.city ?? "",
      state: answers.state ?? "",
      zip: answers.zip ?? "",
      country: answers.country ?? "",
    },

    social: {
      facebook: answers.facebook ?? "",
      instagram: answers.instagram ?? "",
      twitter: answers.twitter ?? "",
      skype: answers.skype ?? "",
    },

    progress: "Open",
    date: new Date(),
    source: answers.source,
    author,
  }));

  return bulkCreateLeads(leads);
};

// ====== GET ALL LEADS
export const getAllLeads = async () => {
  try {
    await connectToDatabase();
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(leads));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET LEAD BY ID
export const getLeadById = async (leadId: string) => {
  try {
    await connectToDatabase();

    const lead = await Lead.findById(leadId).lean();

    if (!lead) {
      throw new Error("Lead not found");
    }

    return JSON.parse(JSON.stringify(lead));
  } catch (error) {
    console.error("Error fetching lead by ID:", error);
    handleError(error);
  }
};

// ====== GET LEAD BY EMAIL
export const getLeadByEmail = async (email: string) => {
  try {
    await connectToDatabase();

    const lead = await Lead.findOne({ email }).lean();

    if (!lead) {
      console.warn(`Lead not found for email: ${email}`);
      return null;
    }

    return JSON.parse(JSON.stringify(lead));
  } catch (error) {
    console.error("Error fetching lead by email:", error);
    handleError(error);
    return null;
  }
};

// ====== GET LEADS BY AGENCY
export const getLeadsByAgency = async (author: string) => {
  try {
    await connectToDatabase();
    const leads = await Lead.find({ author }).sort({ date: -1 }).lean();

    if (!leads.length) {
      console.warn(`No leads found for author: ${author}`);
      return [];
    }

    return JSON.parse(JSON.stringify(leads));
  } catch (error) {
    console.error("Error fetching leads by author:", error);
    handleError(error);
  }
};

// ====== GET LEADS BY PROMOTION
export const getLeadsByPromotion = async (promotionSku: string) => {
  try {
    await connectToDatabase();

    const leads = await Lead.find({ promotionSku }).sort({ date: -1 }).lean();

    if (!leads.length) {
      console.warn(`No leads found for promotion SKU: ${promotionSku}`);
      return [];
    }

    return JSON.parse(JSON.stringify(leads));
  } catch (error) {
    console.error("Error fetching leads by promotion SKU:", error);
    handleError(error);
    return [];
  }
};

// ====== GET LEADS BY ASSIGNED USER
export const getLeadsByAssignedUser = async (email: string) => {
  try {
    await connectToDatabase();

    const leads = await Lead.find({ assignedTo: { $in: [email] } })
      .sort({ createdAt: -1 })
      .lean();

    if (!leads.length) {
      console.warn(`No leads found assigned to: ${email}`);
      return [];
    }

    return JSON.parse(JSON.stringify(leads));
  } catch (error) {
    console.error("Error fetching leads by assigned user:", error);
    handleError(error);
    return [];
  }
};

// ====== GET ALL ASSIGNED LEADS (for admins)
export const getAllAssignedLeads = async () => {
  try {
    await connectToDatabase();

    const leads = await Lead.find({ assignedTo: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 })
      .lean();

    if (!leads.length) {
      console.warn("No assigned leads found");
      return [];
    }

    return JSON.parse(JSON.stringify(leads));
  } catch (error) {
    console.error("Error fetching all assigned leads:", error);
    handleError(error);
    return [];
  }
};

// ====== UPDATE LEAD
export const updateLead = async (
  leadId: string,
  updateData: Partial<LeadParams>
) => {
  try {
    await connectToDatabase();

    const updatedLead = await Lead.findByIdAndUpdate(leadId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedLead) {
      throw new Error("Lead not found");
    }

    revalidatePath("/leads");

    return JSON.parse(JSON.stringify(updatedLead));
  } catch (error) {
    handleError(error);
  }
};

// ====== ASSIGN LEAD TO USER (supports multiple)
export const assignLeadToUser = async (leadId: string, email: string) => {
  try {
    await connectToDatabase();

    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      {
        $addToSet: { assignedTo: email }, // adds email if not already in array
      },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      throw new Error("Lead not found");
    }

    revalidatePath("/leads/assigned");

    return JSON.parse(JSON.stringify(updatedLead));
  } catch (error) {
    console.error("Error assigning lead:", error);
    handleError(error);
  }
};

// ====== UNASSIGN LEAD FROM USER
export const unassignLeadFromUser = async (
  leadId: string,
  email: string
) => {
  try {
    await connectToDatabase();

    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      {
        $pull: { assignedTo: email }, // removes email if exists
      },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      throw new Error("Lead not found");
    }

    revalidatePath("/leads/assigned");

    return JSON.parse(JSON.stringify(updatedLead));
  } catch (error) {
    console.error("Error unassigning lead:", error);
    handleError(error);
  }
};

// ====== DELETE LEAD
export const deleteLead = async (leadId: string) => {
  try {
    await connectToDatabase();

    const deletedLead = await Lead.findByIdAndDelete(leadId);

    if (!deletedLead) {
      throw new Error("Lead not found");
    }

    revalidatePath("/leads");

    return { message: "Lead deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
