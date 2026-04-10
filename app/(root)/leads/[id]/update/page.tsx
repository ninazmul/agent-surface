import {
  getAllProfiles,
  getProfileByEmail,
} from "@/lib/actions/profile.actions";
import { redirect } from "next/navigation";
import { getLeadById } from "@/lib/actions/lead.actions";
import { getAllCourses } from "@/lib/actions/course.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import LeadForm from "@/app/(root)/components/LeadForm";
import { getAllServices } from "@/lib/actions/service.actions";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  let agency = [];
  if (adminStatus) {
    agency = await getAllProfiles();
  } else {
    const myAgency = await getProfileByEmail(email);
    if (myAgency) agency = [myAgency];
  }

  const lead = await getLeadById(id);
  if (!lead) redirect("/leads");

  const courses = await getAllCourses();
  const services = await getAllServices();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update Lead</h2>
      <LeadForm
        email={email}
        Lead={lead}
        LeadId={id}
        agency={agency}
        courses={courses}
        services={services}
        isAdmin={adminStatus}
        type="Update"
      />
    </div>
  );
};

export default UpdatePage;
