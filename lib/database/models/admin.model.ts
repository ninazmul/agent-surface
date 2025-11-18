import { Document, Schema, Types, model, models } from "mongoose";

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  rolePermissions: string[];
  countries?: string[];
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rolePermissions: { type: [String], required: true },
  countries: { type: [String], default: undefined },
  createdAt: { type: Date, default: Date.now },
});

const Admin = models.Admin || model<IAdmin>("Admin", AdminSchema);

export default Admin;
