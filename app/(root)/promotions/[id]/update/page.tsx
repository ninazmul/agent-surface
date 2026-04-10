import { redirect } from "next/navigation";
import { getPromotionById } from "@/lib/actions/promotion.actions";
import PromotionForm from "@/app/(root)/components/PromotionForm";
import { getAllProfiles } from "@/lib/actions/profile.actions";
import { getAllCourses } from "@/lib/actions/course.actions";
import { getAllServices } from "@/lib/actions/service.actions";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;

  const promotion = await getPromotionById(id);
  if (!promotion) redirect("/promotions");

  const courses = await getAllCourses();
  const services = await getAllServices();
  const agencies = await getAllProfiles();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update Promotion</h2>
      <PromotionForm
        promotion={promotion}
        promotionId={id}
        agencies={agencies}
        courses={courses}
        services={services}
        type="Update"
      />
    </div>
  );
};

export default UpdatePage;
