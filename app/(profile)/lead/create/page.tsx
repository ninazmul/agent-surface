import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAllProfiles,
  getProfileByEmail,
} from "@/lib/actions/profile.actions";
import {
  getCoursesByCountry,
} from "@/lib/actions/course.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import LeadForm from "@/app/(root)/components/LeadForm";

const CreateLeadPage = async () => {
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

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <LeadForm
        email={email}
        type="Create"
        agency={agency}
        country={agencyCountry}
        courses={courses}
        isAdmin={adminStatus}
      />
    </section>
  );
};

export default CreateLeadPage;
