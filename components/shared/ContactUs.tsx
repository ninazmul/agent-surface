"use client";

import React, { useState } from "react";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ImFacebook, ImInstagram, ImLinkedin, ImTwitter } from "react-icons/im";
import toast from "react-hot-toast";

export const ContactUs = () => {
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("SUCCESS");
        toast.success("Message sent successfully!");
        setFormData({ user_name: "", user_email: "", phone: "", message: "" });
      } else {
        setStatus("FAILED");
        toast.error("Failed to send the message.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setStatus("FAILED");
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="bg-white shadow-lg rounded-lg p-6 md:p-10 w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Contact Form</h2>
        {!status && (
          <p className="text-gray-600 text-sm mb-6">
            Please feel free to contact us to share your ideas, suggestions, or
            any queries.
          </p>
        )}
        {status === "SUCCESS" && (
          <p className="text-green-600 font-medium mb-6">
            Message sent successfully!
          </p>
        )}
        {status === "FAILED" && (
          <p className="text-red-600 font-medium mb-6">
            Message failed to send. Please try again.
          </p>
        )}
        <div className="flex flex-col md:flex-row gap-8">
          <div>
            <div>
              <h3 className="font-semibold">Follow us on:</h3>
              <div className="flex items-center gap-4 py-4">
                <a href={"/"} target="_blank">
                  <ImFacebook className="size-10 bg-primary-500 p-2 rounded-md text-white hover:text-black shadow hover:bg-yellow-400 transition-colors" />
                </a>
                <a href={"/"} target="_blank">
                  <ImInstagram className="size-10 bg-primary-500 p-2 rounded-md text-white hover:text-black shadow hover:bg-yellow-400 transition-colors" />
                </a>
                <a href={"/"} target="_blank">
                  <ImTwitter className="size-10 bg-primary-500 p-2 rounded-md text-white hover:text-black shadow hover:bg-yellow-400 transition-colors" />
                </a>
                <a href={"/"} target="_blank">
                  <ImLinkedin className="size-10 bg-primary-500 p-2 rounded-md text-white hover:text-black shadow hover:bg-yellow-400 transition-colors" />
                </a>
              </div>
            </div>
            <div className="pt-4">
              <h3 className="font-semibold">Chat with us on WhatsApp:</h3>
              <a
                href="https://wa.me/8801XXXXXXXXX?text=Hello%2C%20I%20want%20to%20get%20in%20touch."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium shadow"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.04 2C6.54 2 2 6.51 2 12.01c0 1.96.5 3.81 1.43 5.46L2 22l4.66-1.38a9.96 9.96 0 005.38 1.52h.01c5.5 0 10-4.51 10-10S17.54 2 12.04 2zm5.59 14.25c-.24.66-1.42 1.3-1.97 1.37-.5.07-1.13.1-1.83-.14-.42-.13-.97-.31-1.67-.61a13.56 13.56 0 01-2.32-1.43 9.03 9.03 0 01-1.7-1.88 4.57 4.57 0 01-.9-2.38c-.02-.25.06-.5.23-.7.14-.17.35-.26.56-.26.1 0 .2.01.29.02.24.04.37.08.53.6.2.68.43 1.27.63 1.73.1.22.2.4.3.56.1.14.2.26.32.37l.12.1c.17.13.39.29.61.35.16.05.36.02.49-.1.16-.17.42-.57.66-.92.17-.25.38-.28.63-.18.25.1 1.58.75 1.85.89.27.13.45.2.52.32.06.12.06.7-.18 1.36z" />
                </svg>
                Message on WhatsApp
              </a>
            </div>
          </div>
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="user_name"
                  className="block text-sm font-medium"
                >
                  Name
                </Label>
                <Input
                  type="text"
                  id="user_name"
                  name="user_name"
                  placeholder="Your name"
                  value={formData.user_name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="user_email"
                  className="block text-sm font-medium"
                >
                  Email
                </Label>
                <Input
                  type="email"
                  id="user_email"
                  name="user_email"
                  placeholder="Your email"
                  value={formData.user_email}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="block text-sm font-medium">
                  Phone
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="message" className="block text-sm font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Your message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                disabled={loading} // Disable button when loading
                className={`w-full font-medium py-2 ${
                  loading
                    ? "bg-primary-500 text-white bg-muted-foreground"
                    : "bg-primary-500 text-white"
                }`}
              >
                {loading ? "Sending..." : "Send"} {/* Show loading text */}
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};
