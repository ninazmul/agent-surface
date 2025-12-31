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
      <div className="p-6 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-2xl text-center font-medium shadow-md">
        Thank you for your response!
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl max-w-xl mx-auto"
    >
      {fields.map((field) => (
        <div
          key={field._id}
          className="flex flex-col space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm"
        >
          <label className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>

          {field.type === "textarea" ? (
            <textarea
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              placeholder={`Enter ${field.label.toLowerCase()}`}
              required={field.required}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          ) : field.type === "select" ? (
            <select
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              required={field.required}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              <option value="">Select {field.label}</option>
              {/* Placeholder options */}
              <option value="Option 1">Option 1</option>
              <option value="Option 2">Option 2</option>
            </select>
          ) : (
            <input
              type={field.type}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
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
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white font-semibold shadow-lg hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
