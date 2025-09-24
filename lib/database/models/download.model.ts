import { Document, Schema, model, models } from "mongoose";

export interface IDownload extends Document {
  _id: string;
  name: string;
  email: string;
  date: Date;
  country: string;
  documents: {
    fileName: string;
    fileUrl: string;
  }[];
  author?: string;
  createdAt: Date;
}

const DownloadSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, required: true },
  country: { type: String, required: true },
  documents: [
    {
      fileName: { type: String },
      fileUrl: { type: String },
    },
  ],
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Download = models.Download || model("Download", DownloadSchema);

export default Download;
