import StudentResourceForm from "@/app/(root)/components/StudentResourceForm";

const CreateResourcePage = async () => {
  return (
    <section className="max-w-5xl mx-auto p-4">
      <StudentResourceForm type="Create" />
    </section>
  );
};

export default CreateResourcePage;
