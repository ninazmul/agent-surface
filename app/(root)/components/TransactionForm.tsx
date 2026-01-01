"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useUploadThing } from "@/lib/uploadthing";
import { FileUploader } from "@/components/shared/FileUploader";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createNotification } from "@/lib/actions/notification.actions";
import { ILead } from "@/lib/database/models/lead.model";
import { updateLead } from "@/lib/actions/lead.actions";
import { Input } from "@/components/ui/input"; // ✅ Added missing import
import { createTrack } from "@/lib/actions/track.actions";

// Schema
export const transcriptFormSchema = z.object({
  transcript: z
    .array(
      z.object({
        amount: z.string(),
        method: z.string(),
        fileUrl: z.string(),
      })
    )
    .optional(),
});

type TranscriptFormProps = {
  type: "Create" | "Update";
  lead?: ILead;
  leadId?: string;
  email?: string;
  isAdmin?: boolean;
};

const TranscriptForm = ({ type, lead, leadId }: TranscriptFormProps) => {
  const router = useRouter();
  const { startUpload } = useUploadThing("mediaUploader");

  // ✅ Proper default values
  const initialValues: z.infer<typeof transcriptFormSchema> = {
    transcript: type === "Update" && lead?.transcript ? lead.transcript : [],
  };

  const form = useForm<z.infer<typeof transcriptFormSchema>>({
    resolver: zodResolver(transcriptFormSchema),
    defaultValues: initialValues,
  });

  // ✅ Fixed onSubmit
  async function onSubmit(values: z.infer<typeof transcriptFormSchema>) {
    try {
      if (type === "Update" && leadId) {
        const updatedLead = await updateLead(leadId, {
          transcript: values.transcript || [],
        });

        if (updatedLead) {
          await createNotification({
            title: `${lead?.name}'s transcript updated!`,
            agency: lead?.author || "",
            country: lead?.home?.country || "",
            route: `/finance`,
          });
          await createTrack({
            student: updatedLead.email,
            event: `${updatedLead.name}'s proof of payment updated`,
            route: `/finance`,
            status: "Proof of payment Updated",
          });
          form.reset({ transcript: values.transcript || [] });
          toast.success("Lead updated successfully!");
          router.push("/finance");
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Lead update failed", error);
      toast.error("Failed to update lead!");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm space-y-4"
      >
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Additional Documents</h3>
          {form.watch("transcript")?.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-4 items-center border p-4 rounded-md bg-muted/40"
            >
              {/* Amount */}
              <FormField
                control={form.control}
                name={`transcript.${index}.amount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Name */}
              <FormField
                control={form.control}
                name={`transcript.${index}.method`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Input placeholder="Payment method" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Uploader */}
              <FormField
                control={form.control}
                name={`transcript.${index}.fileUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload File</FormLabel>
                    <FormControl>
                      <FileUploader
                        onFieldChange={async (
                          fileUrl: string,
                          files?: File[]
                        ) => {
                          if (files && files.length > 0) {
                            const uploaded = await startUpload(files);
                            if (uploaded && uploaded[0]) {
                              field.onChange(uploaded[0].url);
                            }
                          } else {
                            field.onChange(fileUrl);
                          }
                        }}
                        fileUrl={field.value || ""}
                        setFiles={() => {}}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remove Button */}
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  const current = form.getValues("transcript") || [];
                  const updated = [
                    ...current.slice(0, index),
                    ...current.slice(index + 1),
                  ];
                  form.setValue("transcript", updated);
                }}
              >
                Remove
              </Button>
            </div>
          ))}

          {/* Add New Document Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const current = form.getValues("transcript") || [];
              form.setValue("transcript", [
                ...current,
                { amount: "", method: "", fileUrl: "" },
              ]);
            }}
          >
            Add Document
          </Button>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full col-span-2 rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
          >
            {form.formState.isSubmitting ? "Submitting..." : "Submit File"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TranscriptForm;
