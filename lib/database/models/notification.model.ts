import { Document, Schema, Types, model, models } from "mongoose";

export interface IReadBy {
  email?: string;
  status: "read" | "unread";
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  title: string;
  route?: string;
  agency: string;
  country: string;
  readBy?: IReadBy[];
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  route: { type: String, default: "/" },
  agency: { type: String, required: true },
  country: { type: String, required: true },
  readBy: [
    {
      email: { type: String, required: false },
      status: {
        type: String,
        enum: ["read", "unread"],
        default: "unread",
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Notification =
  models.Notification ||
  model<INotification>("Notification", NotificationSchema);

export default Notification;
