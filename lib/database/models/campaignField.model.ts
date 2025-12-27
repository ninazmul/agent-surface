import { Schema, model, models, Types, Document } from "mongoose";

export interface ICampaignField extends Document {
  _id: Types.ObjectId;
  formId: Types.ObjectId;
  label: string;
  name: string; // key used in submission
  type: "text" | "email" | "number" | "textarea" | "select";
  required: boolean;
}

const CampaignFieldSchema = new Schema<ICampaignField>({
  formId: { type: Schema.Types.ObjectId, ref: "CampaignForm", required: true },
  label: { type: String, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "email", "number", "textarea", "select"],
    default: "text",
  },
  required: { type: Boolean, default: false },
});

export default models.CampaignField ||
  model<ICampaignField>("CampaignField", CampaignFieldSchema);
