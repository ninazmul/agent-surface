import { Document, Schema, Types, model, models } from "mongoose";

export interface ICountryPrice {
  country: string;
  price: number;
}

export interface IMarketingResource extends Document {
  _id: Types.ObjectId;
  category: string;
  fileName: string;
  link: string;
  priceList: ICountryPrice[];
  createdAt?: Date;
}

const MarketingResourceSchema = new Schema<IMarketingResource>({
  category: { type: String, required: true },
  fileName: { type: String, required: true },
  link: { type: String, required: true },

  priceList: {
    type: [
      {
        country: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    required: true,
    default: [],
  },

  createdAt: { type: Date, default: Date.now },
});

const MarketingResource =
  models.MarketingResource ||
  model<IMarketingResource>("MarketingResource", MarketingResourceSchema);

export default MarketingResource;
