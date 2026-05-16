type PdfIframeProps = {
  language: "en" | "pt" | "es";
};

export default function PdfIframe({ language }: PdfIframeProps) {
  const fileMap = {
    en: "/assets/terms-en.pdf",
    pt: "/assets/terms-pt.pdf",
    es: "/assets/terms-es.pdf",
  } satisfies Record<string, string>;

  const src = fileMap[language] ?? fileMap.en;

  return (
    <iframe src={src} className="w-full h-full" title="Terms and Conditions" />
  );
}
