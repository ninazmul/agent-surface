import { Schema, model, models, Types, Document } from "mongoose";

/* -------------------------------------------------------------------------- */
/*                                FORM MODEL                                   */
/* -------------------------------------------------------------------------- */
export interface ICampaignForm extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  slug: string;
  author: string; // email
  createdAt: Date;
}

const CampaignFormSchema = new Schema<ICampaignForm>({
  title: { type: String, required: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true },
  author: { type: String, required: true, lowercase: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

/* -------------------------------------------------------------------------- */
/*                               FIELD MODEL                                   */
/* -------------------------------------------------------------------------- */
export interface ICampaignField extends Document {
  _id: Types.ObjectId;
  formId: Types.ObjectId;
  label: string;
  name: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "date";
  required: boolean;
}

const CampaignFieldSchema = new Schema<ICampaignField>({
  formId: { type: Schema.Types.ObjectId, ref: "CampaignForm", required: true },
  label: { type: String, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "email", "number", "textarea", "select" , "date"],
    default: "text",
  },
  required: { type: Boolean, default: false },
});

/* -------------------------------------------------------------------------- */
/*                             SUBMISSION MODEL                                */
/* -------------------------------------------------------------------------- */
export interface ICampaignSubmission extends Document {
  _id: Types.ObjectId;
  formId: Types.ObjectId;
  answers: Record<string, unknown>;
  submittedAt: Date;
}

const CampaignSubmissionSchema = new Schema<ICampaignSubmission>({
  formId: { type: Schema.Types.ObjectId, ref: "CampaignForm", required: true },
  answers: { type: Schema.Types.Mixed, required: true },
  submittedAt: { type: Date, default: Date.now },
});

/* -------------------------------------------------------------------------- */
/*                               EXPORT MODELS                                  */
/* -------------------------------------------------------------------------- */
export const CampaignForm =
  models.CampaignForm || model<ICampaignForm>("CampaignForm", CampaignFormSchema);

export const CampaignField =
  models.CampaignField || model<ICampaignField>("CampaignField", CampaignFieldSchema);

export const CampaignSubmission =
  models.CampaignSubmission ||
  model<ICampaignSubmission>("CampaignSubmission", CampaignSubmissionSchema);
