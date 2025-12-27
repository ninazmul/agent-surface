import { Schema, model, models, Types, Document } from "mongoose";

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

export default models.CampaignSubmission ||
  model<ICampaignSubmission>(
    "CampaignSubmission",
    CampaignSubmissionSchema
  );
