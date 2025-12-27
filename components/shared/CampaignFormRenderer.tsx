"use client";

import { submitCampaignForm } from "@/lib/actions/campaign.actions";
import { CampaignField } from "@/types";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CampaignFormRenderer({
  slug,
  fields,
}: {
  slug: string;
  fields: CampaignField[];
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitCampaignForm({ slug, answers: values });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-center font-medium shadow-sm">
        Thank you for your response!
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg max-w-lg mx-auto"
    >
      {fields.map((field) => (
        <div key={field._id} className="space-y-1">
          <label className="block font-medium text-gray-900 dark:text-gray-100">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.type === "textarea" ? (
            <textarea
              className="w-full border border-gray-300 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder={`Enter ${field.label.toLowerCase()}`}
              required={field.required}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          ) : field.type === "select" ? (
            <select
              className="w-full border border-gray-300 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              required={field.required}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              <option value="">Select {field.label}</option>
              {/* Example placeholder options, ideally dynamic */}
              <option value="Option 1">Option 1</option>
              <option value="Option 2">Option 2</option>
            </select>
          ) : (
            <input
              type={field.type}
              className="w-full border border-gray-300 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder={`Enter ${field.label.toLowerCase()}`}
              required={field.required}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold shadow hover:opacity-90 transition"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
