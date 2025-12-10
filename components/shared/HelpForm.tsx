"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function HelpModal() {
  const [open, setOpen] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!agentName.trim() || !agentEmail.trim() || !message.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/help-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName, agentEmail, message }),
      });

      if (res.ok) {
        toast.success("Help request sent!");
        setAgentName("");
        setAgentEmail("");
        setMessage("");
        setOpen(false);
      } else {
        toast.error("Failed to send help request.");
      }
    } catch {
      toast.error("Error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 z-50 bg-black text-white hover:bg-white hover:text-black border border-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white rounded-full w-12 h-12 shadow-lg flex items-center justify-center">
          <HelpCircle className="w-10 h-10" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl p-0 bg-white dark:bg-black text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">Request Help</DialogTitle>
        </DialogHeader>

        <Card className="p-6 border-0 shadow-none bg-transparent text-inherit">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Your name"
                className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                placeholder="Your email"
                className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Describe the help you need..."
                className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white border border-black rounded-md py-3 font-semibold transition"
            >
              {loading ? "Sending..." : "Send Help Request"}
            </Button>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
