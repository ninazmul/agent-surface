import ResourcePriceListForm from "@/app/(root)/components/ResourcePriceListForm";

const CreateResourcePage = async () => {
  return (
    <section className="max-w-5xl mx-auto p-4">
      <ResourcePriceListForm type="Create" />
    </section>
  );
};

export default CreateResourcePage;
