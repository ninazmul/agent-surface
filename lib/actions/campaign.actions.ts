"use server";

import { connectToDatabase } from "../database";
import {
  CampaignField,
  CampaignForm,
  CampaignSubmission,
} from "../database/models/campaign.model";
import mongoose from "mongoose";

/* -------------------------------------------------------------------------- */
/*                               CREATE FORM                                  */
/* -------------------------------------------------------------------------- */

export interface FieldInput {
  label: string;
  name: string;
  type?: "text" | "email" | "number" | "textarea" | "select";
  required?: boolean;
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

  // Start Mongoose session for atomic creation
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
    }));

    await CampaignField.insertMany(fieldDocs, { session });

    await session.commitTransaction();
    session.endSession();

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

/* -------------------------------------------------------------------------- */
/*                              SUBMIT FORM                                   */
/* -------------------------------------------------------------------------- */

export async function submitCampaignForm({
  slug,
  answers,
}: {
  slug: string;
  answers: Record<string, unknown>;
}) {
  if (!slug || !answers || Object.keys(answers).length === 0) {
    throw new Error("Invalid submission data");
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

/* -------------------------------------------------------------------------- */
/*                        GET FORMS BY AUTHOR (DASHBOARD)                      */
/* -------------------------------------------------------------------------- */

export async function getCampaignFormsByAuthor(author: string) {
  if (!author) throw new Error("Author email is required");

  await connectToDatabase();

  return CampaignForm.find({ author }).sort({ createdAt: -1 });
}

/* -------------------------------------------------------------------------- */
/*                        GET FORM WITH FIELDS (PUBLIC)                        */
/* -------------------------------------------------------------------------- */

export async function getCampaignFormBySlug(slug: string) {
  if (!slug) throw new Error("Slug required");

  await connectToDatabase();

  const form = await CampaignForm.findOne({ slug });
  if (!form) return null;

  const fields = await CampaignField.find({ formId: form._id });

  return { form, fields };
}

/* -------------------------------------------------------------------------- */
/*                       GET SUBMISSIONS (OWNER ONLY)                          */
/* -------------------------------------------------------------------------- */

export async function getCampaignSubmissions({
  formId,
  author,
}: {
  formId: string;
  author: string;
}) {
  if (!formId || !author) throw new Error("Unauthorized access");

  await connectToDatabase();

  const form = await CampaignForm.findOne({ _id: formId, author });
  if (!form) throw new Error("Access denied");

  return CampaignSubmission.find({ formId }).sort({ submittedAt: -1 });
}
