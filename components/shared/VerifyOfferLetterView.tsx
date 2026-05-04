import { CheckCircle, User, BookOpen } from "lucide-react";
import { ILead } from "@/lib/database/models/lead.model";

type Props = {
  lead: ILead;
};

export default function VerifyOfferLetterView({ lead }: Props) {
  const courses = Array.isArray(lead?.course) ? lead.course : [];
  const issueDate = lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "N/A";

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold mb-2 text-primary">Offer Letter Verified</h1>
        <p className="text-gray-600">Details below are taken from the lead record and have been verified.</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <h2 className="text-2xl font-bold">{lead?.name || "Student"}</h2>
          <p className="text-sm opacity-90">
            {lead?._id && `Offer ID: ${lead._id.toString()}`} {issueDate !== "N/A" && `• Issued: ${issueDate}`}
          </p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">
          <div>
            <User className="w-5 h-5 inline-block mr-2 text-primary" />
            <strong>Student Details</strong>

            <ul className="mt-2 text-sm space-y-1">
              {lead?.name && <li><strong>Name:</strong> {lead.name}</li>}
              {lead?.dateOfBirth && <li><strong>Date of Birth:</strong> {new Date(lead.dateOfBirth).toLocaleDateString()}</li>}
              {lead?.passport?.number && <li><strong>Passport No.:</strong> {lead.passport.number}</li>}
            </ul>
          </div>

          <div>
            <BookOpen className="w-5 h-5 inline-block mr-2 text-primary" />
            <strong>Offer & Course Summary</strong>

            <ul className="mt-2 text-sm space-y-1">
              {courses.length > 0 && <li><strong>Course(s):</strong> {courses.map((c) => c.name).filter(Boolean).join(", ")}</li>}
              {courses.length > 0 && <li><strong>Commence / Completion:</strong> {courses.map((c) => `${c.startDate ? new Date(c.startDate).toLocaleDateString() : "TBA"} — ${c.endDate ? new Date(c.endDate).toLocaleDateString() : "TBA"}`).join("; ")}</li>}
              <li><strong>Offer Status:</strong> <span className="text-green-600 font-semibold">{lead?.status || "Verified"}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
