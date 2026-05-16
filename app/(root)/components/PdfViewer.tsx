"use client";

import { useEffect, useState } from "react";

type PdfIframeProps = {
  language: "en" | "pt" | "es";
};

export default function PdfIframe({ language }: PdfIframeProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileMap = {
    en: "/assets/terms-en.pdf",
    pt: "/assets/terms-pt.pdf",
    es: "/assets/terms-es.pdf",
  } satisfies Record<string, string>;

  const src = fileMap[language] ?? fileMap.en;

  useEffect(() => {
    let currentUrl = "";
    const fetchPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        const blob = await response.blob();
        currentUrl = URL.createObjectURL(blob);
        setBlobUrl(currentUrl);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Unable to load the terms and conditions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 p-4 text-center">
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <iframe
      src={blobUrl || ""}
      className="w-full h-full border-none"
      title="Terms and Conditions"
    />
  );
}

