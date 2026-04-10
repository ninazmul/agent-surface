import { Document, Schema, Types, model, models } from "mongoose";

export interface IResourcePriceList extends Document {
  _id: Types.ObjectId;
  country: string;
  fileName: string;
  link: string;
  createdAt?: Date;
}

const ResourcePriceListSchema = new Schema({
  country: { type: String, required: true },
  fileName: { type: String, required: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ResourcePriceList =
  models.ResourcePriceList || model("ResourcePriceList", ResourcePriceListSchema);

export default ResourcePriceList;
