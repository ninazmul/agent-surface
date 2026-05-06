import {
  getAllProfiles,
  getProfileByEmail,
} from "@/lib/actions/profile.actions";
import LeadForm from "../../components/LeadForm";
import { getCoursesByCountry } from "@/lib/actions/course.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import { getAllServices } from "@/lib/actions/service.actions";

const CreateLeadsPage = async () => {
  const { sessionClaims } = await auth();

  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

  let agency = [];
  let agencyCountry: string | undefined;

  if (adminStatus) {
    agency = await getAllProfiles();
  } else {
    const myAgency = await getProfileByEmail(email);

    if (myAgency) {
      agency = [myAgency];
      agencyCountry = myAgency.country;
    }
  }

  const courses = await getCoursesByCountry(agencyCountry);
  const services = await getAllServices();

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <LeadForm
        email={email}
        agency={agency}
        country={agencyCountry}
        courses={courses}
        services={services}
        isAdmin={adminStatus}
        type="Create"
      />
    </section>
  );
};

export default CreateLeadsPage;
