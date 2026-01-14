import { Document, Schema, Types, model, models } from "mongoose";

export interface IProfile extends Document {
  _id: Types.ObjectId;
  name: string;
  logo?: string;
  email: string;
  number: string;
  country: string;
  location: string;
  licenseDocument?: string;
  agreementDocument?: string;
  bankName?: string;
  accountNumber?: string;
  swiftCode?: string;
  routingNumber?: string;
  branchAddress?: string;
  role: string;
  countryAgent?: string;
  subAgents?: string[];
  status: string;
  salesTarget?: string;
  commission?: string;
  signatureDocument?: string;
  createdAt: Date;
}

const ProfileSchema = new Schema<IProfile>({
  name: { type: String, required: true },
  logo: { type: String, required: false },
  email: { type: String, required: true },
  number: { type: String, required: true },
  country: { type: String, required: true },
  location: { type: String, required: true },
  licenseDocument: { type: String, required: false },
  agreementDocument: { type: String, required: false },
  bankName: { type: String, required: false },
  accountNumber: { type: String, required: false },
  swiftCode: { type: String, required: false },
  routingNumber: { type: String, required: false },
  branchAddress: { type: String, required: false },
  role: { type: String, required: true },
  countryAgent: { type: String, required: false },
  subAgents: { type: [String], default: undefined },
  status: { type: String, required: true },
  salesTarget: { type: String, required: false },
  commission: { type: String, required: false },
  signatureDocument: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Profile = models.Profile || model<IProfile>("Profile", ProfileSchema);

export default Profile;
