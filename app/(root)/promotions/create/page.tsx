import { getAllCourses } from "@/lib/actions/course.actions";
import PromotionForm from "../../components/PromotionForm";
import { getAllServices } from "@/lib/actions/service.actions";
import { getAllProfiles } from "@/lib/actions/profile.actions";

const CreatePromotionPage = async () => {
  const courses = await getAllCourses();
  const services = await getAllServices();
  const agencies = await getAllProfiles();
  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <PromotionForm type="Create" courses={courses} services={services} agencies={agencies} />
    </section>
  );
};

export default CreatePromotionPage;
