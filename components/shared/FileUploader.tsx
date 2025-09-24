"use client";

import React, { useCallback, useState } from "react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useUploadThing } from "@/lib/uploadthing";
import { useDropzone } from "@uploadthing/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FiUpload } from "react-icons/fi"; // Upload icon

type FileUploaderProps = {
  onFieldChange: (url: string) => void;
  fileUrl: string;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

export function FileUploader({
  onFieldChange,
  fileUrl,
  setFiles,
}: FileUploaderProps) {
  const { startUpload } = useUploadThing("mediaUploader");
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
      setFileName(acceptedFiles[0]?.name || null);
      setIsUploading(true);

      try {
        const res = await startUpload(acceptedFiles);
        setIsUploading(false);

        if (res && res[0]?.url) {
          onFieldChange(res[0].url);
        } else {
          console.error("Upload failed:", res);
          alert("Upload failed. Please try again.");
        }
      } catch (error) {
        setIsUploading(false);
        console.error("Error during upload:", error);
        alert("Something went wrong. Please try again.");
      }
    },
    [onFieldChange, setFiles, startUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(["image/*", "application/pdf"]),
  });

  return (
    <div {...getRootProps()} className="w-full">
      <input {...getInputProps()} className="hidden" />
      <div
        className={cn(
          "flex items-center h-10 w-full rounded-md border border-input bg-background dark:bg-gray-700 px-3 text-sm text-gray-700 dark:text-gray-200 placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 cursor-pointer transition",
          isUploading ? "bg-primary-50 border-primary-300" : ""
        )}
      >
        <FiUpload className="mr-2 text-gray-400 dark:text-gray-300" />
        {isUploading ? (
          <span className="text-primary-600 font-medium">Uploading...</span>
        ) : fileUrl ? (
          <div className="flex items-center gap-2 truncate">
            {fileUrl.endsWith(".pdf") ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 underline truncate"
              >
                {fileName || "View PDF"}
              </a>
            ) : fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <Image
                src={fileUrl}
                alt="uploaded"
                width={30}
                height={30}
                className="rounded object-contain"
              />
            ) : (
              <span className="truncate">{fileName || "File uploaded"}</span>
            )}
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 truncate">
            Click or drag a file here
          </span>
        )}
      </div>
    </div>
  );
}
