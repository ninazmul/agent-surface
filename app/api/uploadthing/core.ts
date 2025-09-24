import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: "4MB" },
    "application/pdf": { maxFileSize: "4MB" },
  }).onUploadComplete(async ({ file }) => {
    console.log("Upload complete:", file.ufsUrl);
    return { uploadedAt: new Date().toISOString() };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
