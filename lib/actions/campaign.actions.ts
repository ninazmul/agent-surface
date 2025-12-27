"use server";

import { connectToDatabase } from "../database";
import CampaignFieldModel from "../database/models/campaignField.model";
import CampaignFormModel from "../database/models/campaignForm.model";
import CampaignSubmissionModel from "../database/models/campaignSubmission.model";

/* -------------------------------------------------------------------------- */
/*                               CREATE FORM                                  */
/* -------------------------------------------------------------------------- */

interface FieldInput {
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

  const existing = await CampaignFormModel.findOne({ slug });
  if (existing) {
    throw new Error("Form slug already exists");
  }

  const form = await CampaignFormModel.create({
    title,
    description,
    slug,
    author,
  });

  const fieldDocs = fields.map((field) => ({
    ...field,
    formId: form._id,
  }));

  await CampaignFieldModel.insertMany(fieldDocs);

  return {
    success: true,
    formId: form._id.toString(),
  };
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

  const form = await CampaignFormModel.findOne({ slug });
  if (!form) {
    throw new Error("Campaign form not found");
  }

  await CampaignSubmissionModel.create({
    formId: form._id,
    answers,
  });

  return { success: true };
}

/* -------------------------------------------------------------------------- */
/*                        GET FORMS BY AUTHOR (DASHBOARD)                      */
/* -------------------------------------------------------------------------- */

export async function getCampaignFormsByAuthor(author: string) {
  if (!author) {
    throw new Error("Author email is required");
  }

  await connectToDatabase();

  return CampaignFormModel.find({ author }).sort({ createdAt: -1 });
}

/* -------------------------------------------------------------------------- */
/*                        GET FORM WITH FIELDS (PUBLIC)                        */
/* -------------------------------------------------------------------------- */

export async function getCampaignFormBySlug(slug: string) {
  if (!slug) throw new Error("Slug required");

  await connectToDatabase();

  const form = await CampaignFormModel.findOne({ slug });
  if (!form) return null;

  const fields = await CampaignFieldModel.find({ formId: form._id });

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
  if (!formId || !author) {
    throw new Error("Unauthorized access");
  }

  await connectToDatabase();

  const form = await CampaignFormModel.findOne({
    _id: formId,
    author,
  });

  if (!form) {
    throw new Error("Access denied");
  }

  return CampaignSubmissionModel.find({ formId }).sort({
    submittedAt: -1,
  });
}
