import { Button } from "@/components/ui/button";
import { getAllCourses } from "@/lib/actions/course.actions";
import JsonToExcel from "../components/JsonToExcel";
import CourseTable from "../components/CourseTable";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import { getProfileByEmail } from "@/lib/actions/profile.actions";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);

  if (!adminStatus && myProfile?.role === "Student") {
    redirect("/profile");
  }

  if (!adminStatus || (adminStatus && !rolePermissions.includes("courses"))) {
    redirect("/");
  }

  const courses = await getAllCourses();

  return (
    <>
      <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="h3-bold text-center sm:text-left">All Courses</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <JsonToExcel data={courses} fileName="courses.xlsx" />
            <a href={`/courses/create`} className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full w-full sm:w-auto">
                Add Course
              </Button>
            </a>
          </div>
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
