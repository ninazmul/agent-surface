import { getAllCourses } from "@/lib/actions/course.actions";
import CourseTable from "../components/CourseTable";
import AddCourseDialog from "@/components/shared/AddCourseDialog";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { adminStatus } = await getUserContext("courses");

  // Fetch courses
  const courses = await getAllCourses();

  return (
    <>
      <section className="p-4">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">All Courses</h3>

          {adminStatus && <AddCourseDialog />}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <CourseTable courses={courses} />
        </div>
      </section>
    </>
  );
};

export default Page;
