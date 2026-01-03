

export default function AgreementPDF() {

  return (
    <iframe
      src={"/assets/contract.pdf"}
      className="w-full h-full"
      title="Terms and Conditions"
    />
  );
}
