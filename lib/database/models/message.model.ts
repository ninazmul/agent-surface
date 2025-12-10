import { Schema, model, models, Types, Document } from "mongoose";

export type Role = "Admin" | "Agent" | "Sub Agent" | "Student";

export interface IChatMessage {
  _id: Types.ObjectId;
  senderEmail: string;
  senderRole: Role;
  text: string;
  timestamp: Date;
  read: boolean;
  country?: string;
}

export interface IMessage extends Document {
  userEmail: string;
  country?: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  senderEmail: { type: String, required: true },
  senderRole: { type: String, enum: ["Admin", "Agent", "Sub Agent", "Student"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  country: { type: String },
});

const MessageSchema = new Schema<IMessage>(
  {
    userEmail: { type: String, required: true, index: true },
    country: { type: String },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true }
);

const Message = models.Message || model<IMessage>("Message", MessageSchema);
export default Message;
