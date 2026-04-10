import { Document, Schema, Types, model, models } from "mongoose";

export interface IResource extends Document {
  _id: Types.ObjectId;
  category: string;
  fileName: string;
  link: string;
  createdAt?: Date;
}

const ResourceSchema = new Schema({
  category: { type: String, required: true },
  fileName: { type: String, required: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Resource =
  models.Resource || model("Resource", ResourceSchema);

export default Resource;
