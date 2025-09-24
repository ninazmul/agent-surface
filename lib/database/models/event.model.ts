import { Document, Schema, model, models } from "mongoose";

export interface IEvent extends Document {
  _id: string;
  title: string;
  description: string;
  date: Date;
  email?: string;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Event = models.Event || model<IEvent>("Event", EventSchema);

export default Event;
