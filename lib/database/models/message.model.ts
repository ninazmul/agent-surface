import { Document, Schema, model, models } from "mongoose";

export interface IChatMessage {
  _id: string;
  senderEmail: string;
  senderRole?: "user" | "admin";
  text: string;
  timestamp: Date;
}

export interface IMessage extends Document {
  _id: string;
  userEmail: string;
  country?:string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    senderEmail: { type: String, required: true },
    senderRole: { type: String, enum: ["user", "admin"], required: false },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
);

const MessageSchema = new Schema<IMessage>(
  {
    userEmail: { type: String, required: true, unique: true },
    country:{type: String},
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true }
);

const Message = models.Message || model<IMessage>("Message", MessageSchema);

export default Message;
