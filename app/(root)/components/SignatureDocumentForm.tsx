"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUploadThing } from "@/lib/uploadthing";
import { uploadSignatureDocument } from "@/lib/actions/profile.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DigitalSignaturePad from "@/components/shared/DigitalSignaturePad";

/* ---------------- Schema ---------------- */
const signatureSchema = z.object({
  signatureDocument: z.string().min(1, "Signature file is required"),
  signatureDate: z.date(),
});

type SignatureFormProps = {
  profileId: string;
  onClose?: () => void;
};

export function SignatureDocumentForm({
  profileId,
  onClose,
}: SignatureFormProps & { onClose?: () => void }) {
  const router = useRouter();
  const [signatureDocument, setSignatureDocument] = useState<File[]>([]);
  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<z.infer<typeof signatureSchema>>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      signatureDocument: "",
      signatureDate: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof signatureSchema>) {
    try {
      let uploadedSignatureDocumentUrl = values.signatureDocument;

      if (signatureDocument.length > 0) {
        const uploaded = await startUpload(signatureDocument);
        if (!uploaded || uploaded.length === 0)
          throw new Error("Upload failed");
        uploadedSignatureDocumentUrl = uploaded[0].url;
      }

      // Ensure signatureDate is current date
      const signatureDate = new Date();

      await uploadSignatureDocument(profileId, uploadedSignatureDocumentUrl, signatureDate);

      toast.success("Signature submitted successfully");

      // Refresh data
      router.refresh();

      // Close modal if onClose is provided
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit signature");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="signatureDocument"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Draw Your Signature</FormLabel>
              <FormControl>
                <DigitalSignaturePad
                  onSave={(file) => {
                    setSignatureDocument([file]);
                    // Automatically set signatureDate to current date
                    form.setValue("signatureDate", new Date());
                    field.onChange("signature.png"); // satisfies Zod
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full rounded-xl"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Submitting..." : "Submit Signature"}
        </Button>
      </form>
    </Form>
  );
}
