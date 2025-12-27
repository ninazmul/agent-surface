import { Schema, model, models, Types, Document } from "mongoose";

export interface ICampaignForm extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  slug: string;
  author: string;
  createdAt: Date;
}

const CampaignFormSchema = new Schema<ICampaignForm>({
  title: { type: String, required: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true },
  author: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default models.CampaignForm ||
  model<ICampaignForm>("CampaignForm", CampaignFormSchema);
