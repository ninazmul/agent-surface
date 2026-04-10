import MarketingResourceForm from "@/app/(root)/components/MarketingResourceForm";

const CreateResourcePage = async () => {
  return (
    <section className="max-w-5xl mx-auto p-4">
      <MarketingResourceForm type="Create" />
    </section>
  );
};

export default CreateResourcePage;
