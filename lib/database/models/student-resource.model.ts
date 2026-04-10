import { Document, Schema, Types, model, models } from "mongoose";

export interface IStudentResource extends Document {
  _id: Types.ObjectId;
  category: string;
  fileName: string;
  link: string;
  createdAt?: Date;
}

const StudentResourceSchema = new Schema({
  category: { type: String, required: true },
  fileName: { type: String, required: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const StudentResource =
  models.StudentResource || model("StudentResource", StudentResourceSchema);

export default StudentResource;
