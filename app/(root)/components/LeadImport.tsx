"use client";

import { useState, ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeadImport() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setStatus("⏳ Uploading...");

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        body: formData,
      });

      const data: { success: boolean; count?: number; error?: string } = await res.json();

      if (data.success) {
        setStatus(`✅ Imported leads successfully`);
      } else {
        setStatus(`❌ Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setStatus(`❌ Failed: ${message}`);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-2xl mx-auto mt-10 p-6 border rounded-xl">
      <label className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
        <Upload className="w-10 h-10 text-gray-400 mb-2" />
        <span className="text-gray-600 dark:text-gray-200">
          {file ? file.name : "Click to select an Excel file (.xlsx)"}
        </span>
        <input
          type="file"
          accept=".xlsx, .xls"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      <Button
        onClick={handleUpload}
        disabled={!file}
        className="w-full text-white rounded-2xl"
      >
        {file ? "Upload & Import" : "Select a File First"}
      </Button>

      {status && (
        <p
          className={`mt-2 text-sm font-medium ${
            status.startsWith("✅")
              ? "text-green-600"
              : status.startsWith("❌")
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
