import { getCourseById } from "@/lib/actions/course.actions";
import { redirect } from "next/navigation";
import CourseForm from "@/app/(root)/components/CourseForm";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;

  const course = await getCourseById(id);
  if (!course) redirect("/applications");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update Course</h2>
      <CourseForm
        type="Update"
        Course={course}
        CourseId={course._id.toString()}
      />
    </div>
  );
};

export default UpdatePage;
