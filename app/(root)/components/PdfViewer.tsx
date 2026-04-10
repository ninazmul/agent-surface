type PdfIframeProps = {
  language: string;
};

export default function PdfIframe({ language }: PdfIframeProps) {
  const fileMap: Record<string, string> = {
    en: "/assets/terms-en.pdf",
    pt: "/assets/terms-pt.pdf",
    es: "/assets/terms-es.pdf",
  };

  return (
    <iframe
      src={fileMap[language]}
      className="w-full h-full"
      title="Terms and Conditions"
    />
  );
}
