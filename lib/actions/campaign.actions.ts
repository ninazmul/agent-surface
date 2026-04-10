"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database";
import {
  CampaignField,
  CampaignForm,
  CampaignSubmission,
} from "../database/models/campaign.model";
import mongoose from "mongoose";

export interface Option {
  label: string;
  value: string;
}

export interface FieldInput {
  label: string;
  name: string;
  type?: "text" | "email" | "number" | "textarea" | "select" | "date";
  required?: boolean;
  options?: Option[]; // only for select fields
}

export async function createCampaignForm({
  title,
  description,
  slug,
  author,
  fields,
}: {
  title: string;
  description?: string;
  slug: string;
  author: string;
  fields: FieldInput[];
}) {
  if (!author || !author.includes("@")) {
    throw new Error("Valid author email is required");
  }

  if (!fields || fields.length === 0) {
    throw new Error("At least one field is required");
  }

  await connectToDatabase();

  const existing = await CampaignForm.findOne({ slug });
  if (existing) {
    throw new Error("Form slug already exists");
  }

  // Validate select fields have options
  for (const field of fields) {
    if (field.type === "select") {
      if (!field.options || field.options.length === 0) {
        throw new Error(`Select field "${field.label}" must have at least one option`);
      }
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const form = await CampaignForm.create(
      [
        {
          title,
          description,
          slug,
          author,
        },
      ],
      { session }
    );

    const fieldDocs = fields.map((field) => ({
      formId: form[0]._id,
      label: field.label,
      name: field.name,
      type: field.type || "text",
      required: !!field.required,
      options: field.type === "select" ? field.options : undefined,
    }));

    await CampaignField.insertMany(fieldDocs, { session });

    await session.commitTransaction();
    session.endSession();

    revalidatePath("/leads/campaigns");

    return {
      success: true,
      formId: form[0]._id.toString(),
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    throw new Error("Failed to create campaign form");
  }
}

export async function submitCampaignForm({
  slug,
  answers,
}: {
  slug: string;
  answers: Record<string, unknown>;
}) {
  if (!slug) throw new Error("Form slug is required");
  if (!answers || Object.keys(answers).length === 0) {
    throw new Error("Submission data is required");
  }

  await connectToDatabase();

  const form = await CampaignForm.findOne({ slug });
  if (!form) throw new Error("Campaign form not found");

  await CampaignSubmission.create({
    formId: form._id,
    answers,
  });

  return { success: true };
}

export async function getCampaignFormsByAuthor(author: string) {
  if (!author) throw new Error("Author email is required");

  await connectToDatabase();

  return CampaignForm.find({ author }).sort({ createdAt: -1 });
}

export async function getCampaignFormBySlug(slug: string) {
  if (!slug) throw new Error("Slug required");

  await connectToDatabase();

  const form = await CampaignForm.findOne({ slug });
  if (!form) return null;

  const fields = await CampaignField.find({ formId: form._id });

  return { form, fields };
}

export async function getCampaignSubmissionsByFormId(formId: string) {
  if (!formId) throw new Error("Form ID is required");

  await connectToDatabase();

  return CampaignSubmission.find({ formId }).sort({ submittedAt: -1 });
}

interface GetAllFormsOptions {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "title";
  sortOrder?: "asc" | "desc";
  author?: string;
}

export async function getAllCampaignForms(options?: GetAllFormsOptions) {
  await connectToDatabase();

  const page = options?.page && options.page > 0 ? options.page : 1;
  const limit = options?.limit && options.limit > 0 ? options.limit : 50;
  const skip = (page - 1) * limit;

  const sortKey = options?.sortBy || "createdAt";
  const sortOrder = options?.sortOrder === "asc" ? 1 : -1;

  const query: Record<string, unknown> = {};
  if (options?.author) query.author = options.author;

  const [forms, total] = await Promise.all([
    CampaignForm.find(query).sort({ [sortKey]: sortOrder }).skip(skip).limit(limit),
    CampaignForm.countDocuments(query),
  ]);

  return {
    forms,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function deleteCampaignFormById(formId: string) {
  if (!formId) throw new Error("Form ID is required");

  await connectToDatabase();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await CampaignSubmission.deleteMany({ formId }).session(session);
    await CampaignField.deleteMany({ formId }).session(session);

    const result = await CampaignForm.deleteOne({ _id: formId }).session(session);
    if (result.deletedCount === 0) throw new Error("Form not found");

    await session.commitTransaction();
    session.endSession();

    revalidatePath("/leads/campaigns");

    return { success: true };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    throw new Error("Failed to delete campaign form");
  }
}
