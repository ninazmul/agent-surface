import { Document, Schema, Types, model, models } from "mongoose";

export interface IRefund extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  number: string;
  country: string;
  leadNumber: string;
  note?: string;
  progress?: string;
  author: string;
  amount: string;
  createdAt: Date;
}

const RefundSchema = new Schema<IRefund>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  number: { type: String, required: true },
  country: { type: String, required: true },
  leadNumber: { type: String, required: true },
  note: { type: String },
  progress: { type: String, required: true },
  author: { type: String, required: true },
  amount: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Refund = models.Refund || model<IRefund>("Refund", RefundSchema);

export default Refund;
