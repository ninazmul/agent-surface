"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Lead from "../database/models/lead.model";
import { GetLeadsParams, LeadDTO, LeadParams } from "@/types";
import { FilterQuery } from "mongoose";
import { PaginationMeta } from "@/types/pagination";

// ====== CREATE LEAD
export const createLead = async (params: LeadParams) => {
  try {
    await connectToDatabase();
    const newLead = await Lead.create(params);
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

    return JSON.parse(JSON.stringify(newLeads));
  } catch (error) {
    handleError(error);
  }
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

interface GetLeadsResponse {
  data: LeadDTO[];
  pagination: PaginationMeta;
}

export const getFilteredLeads = async (
  params: GetLeadsParams
): Promise<GetLeadsResponse> => {
  await connectToDatabase();

  const {
    search,
    progress,
    status,
    author,
    assignedTo,
    isPinned,
    isVoid = false,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = params;

  const skip = (page - 1) * limit;

  // 🔍 Build filter safely
  const filter: FilterQuery<Record<string, unknown>> = {
    isVoid,
  };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { number: { $regex: search, $options: "i" } },
    ];
  }

  if (progress) filter.progress = progress;
  if (status) filter.status = status;
  if (author) filter.author = author;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (typeof isPinned === "boolean") filter.isPinned = isPinned;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = startDate;
    if (endDate) filter.createdAt.$lte = endDate;
  }

  // 🚀 Query + count in parallel
  const [rawLeads, total] = await Promise.all([
    Lead.find(filter)
      .select(
        "name email number gender maritalStatus progress status author isPinned assignedTo home.country createdAt"
      )
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Lead.countDocuments(filter),
  ]);

  // 🔄 Serialize to DTO (important)
  const leads: LeadDTO[] = rawLeads.map((lead) => ({
    _id: lead._id as string,
    name: lead.name,
    email: lead.email,
    number: lead.number,
    gender: lead.gender,
    maritalStatus: lead.maritalStatus,
    progress: lead.progress,
    status: lead.status,
    author: lead.author,
    isPinned: lead.isPinned,
    assignedTo: lead.assignedTo,
    home: {
      country: lead.home.country,
    },
    createdAt: lead.createdAt.toISOString(),
  }));

  const pagination: PaginationMeta = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };

  return {
    data: leads,
    pagination,
  };
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

    return JSON.parse(JSON.stringify(updatedLead));
  } catch (error) {
    console.error("Error assigning lead:", error);
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

    return { message: "Lead deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
