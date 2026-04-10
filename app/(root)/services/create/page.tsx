import ServiceForm from "../../components/ServiceForm";

const CreateServicePage = async () => {
  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <ServiceForm type="Create" />
    </section>
  );
};

export default CreateServicePage;
