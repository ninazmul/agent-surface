import { Document, Schema, model, models } from "mongoose";

export interface IStudentEvent {
  event: string;
  route?: string;
  status?: string;
  createdAt: Date;
}

export interface ITrack extends Document {
  _id: string;
  student: string;
  events: IStudentEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IStudentEvent>(
  {
    event: { type: String, required: true },
    route: { type: String, default: "/" },
    status: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TrackSchema = new Schema<ITrack>(
  {
    student: { type: String, required: true, lowercase: true, trim: true },
    events: [EventSchema],
  },
  { timestamps: true }
);

const Track = models.Track || model<ITrack>("Track", TrackSchema);

export default Track;
