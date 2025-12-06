"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createMessage } from "@/lib/actions/message.actions";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

const MessageFormSchema = z.object({
  text: z.string().min(1, "Message cannot be empty"),
  country: z.string().optional(),
});

type MessageFormProps = {
  type: "Create" | "Update";
  userEmail: string;
  senderEmail: string;
  senderRole: "user" | "admin";
  country?: string;
  onMessageSent?: (message: {
    senderEmail: string;
    senderRole?: "user" | "admin";
    text: string;
    timestamp: string;
    _id?: string;
  }) => void;
};

const MessageForm = ({
  type,
  userEmail,
  senderEmail,
  senderRole,
  onMessageSent,
  country,
}: MessageFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof MessageFormSchema>>({
    resolver: zodResolver(MessageFormSchema),
    defaultValues: { text: "", country: country || "" },
    mode: "onSubmit",
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof MessageFormSchema>) => {
      const trimmedText = values.text.trim();
      if (!userEmail || !trimmedText) return;

      try {
        setError(null);

        const messageData = {
          userEmail,
          senderEmail,
          senderRole,
          text: trimmedText,
          country: values.country || "",
        };

        if (type === "Create") {
          const created = await createMessage(messageData);
          if (created) {
            const lastMsg = created.messages[created.messages.length - 1];
            form.reset({ text: "", country: country || "" });
            onMessageSent?.(lastMsg);
            router.refresh();
          }
        }
      } catch (err) {
        console.error("Message form submission failed", err);
        setError("Failed to send message. Please try again.");
      }
    },
    [
      userEmail,
      senderEmail,
      senderRole,
      type,
      country,
      onMessageSent,
      router,
      form,
    ]
  );

  return (
    <Form {...form}>
      <div className="flex flex-col h-full">
        {/* Message Input Area sticks to bottom */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-auto flex gap-2 items-center pt-2 bg-gray-100 dark:bg-gray-700"
        >
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem className="flex-grow mb-0">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Type a message..."
                    autoComplete="off"
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="sm"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending..." : "Send"}
          </Button>
        </form>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </Form>
  );
};

export default MessageForm;
