import {
  getAllProfiles,
  getProfileByEmail,
} from "@/lib/actions/profile.actions";
import LeadForm from "../../components/LeadForm";
import { getAllCourses } from "@/lib/actions/course.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import { getAllServices } from "@/lib/actions/service.actions";
// import { getAllServices } from "@/lib/actions/service.actions";

const CreateLeadsPage = async () => {
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

  const courses = await getAllCourses();
  const services = await getAllServices();

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <LeadForm
        email={email}
        agency={agency}
        courses={courses}
        services={services}
        isAdmin={adminStatus}
        type="Create"
      />
    </section>
  );
};

export default CreateLeadsPage;
