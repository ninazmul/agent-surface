import CourseForm from "../../components/CourseForm";

const CreateCoursePage = async () => {

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <CourseForm type="Create" />
    </section>
  );
};

export default CreateCoursePage;
