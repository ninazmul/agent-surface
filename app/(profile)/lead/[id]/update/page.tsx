import { getAllCourses } from "@/lib/actions/course.actions";
import {
  getAllProfiles,
  getProfileByEmail,
} from "@/lib/actions/profile.actions";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/actions/admin.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getLeadById } from "@/lib/actions/lead.actions";
import LeadForm from "@/app/(root)/components/LeadForm";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);

  const lead = await getLeadById(id);
  if (!lead) redirect("/applications");

  const courses = await getAllCourses();

  const adminStatus = await isAdmin(email);

  let agency = [];
  if (adminStatus) {
    agency = await getAllProfiles();
  } else {
    const myAgency = await getProfileByEmail(email);
    if (myAgency) agency = [myAgency];
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update lead</h2>
      <LeadForm
        type="Update"
        Lead={lead}
        LeadId={id}
        email={email}
        courses={courses}
        agency={agency}
        isAdmin={adminStatus}
      />
    </div>
  );
};

export default UpdatePage;
