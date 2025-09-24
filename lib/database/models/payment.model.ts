import { Document, Schema, model, models } from "mongoose";

export interface IPayment extends Document {
  _id: string;
  agency: string;
  amount: string;
  paymentMethod: string;
  accountDetails?: string;
  country: string;
  progress: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  agency: { type: String, required: true },
  amount: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  accountDetails: { type: String },
  country: { type: String, required: true },
  progress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Payment = models.Payment || model<IPayment>("Payment", PaymentSchema);

export default Payment;
