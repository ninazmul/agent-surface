"use client";

import { submitCampaignForm } from "@/lib/actions/campaign.actions";
import { CampaignField, Option } from "@/types";
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
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Thank you!
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-lg">
          Your submission has been successfully received.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr"
    >
      {fields.map((field) => {
        const isFullWidth =
          field.type === "textarea" ||
          field.type === "select" ||
          field.name === "email";

        return (
          <div
            key={field._id}
            className={`flex flex-col ${isFullWidth ? "md:col-span-2" : ""}`}
          >
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-transparent px-3 py-2 text-gray-800 dark:text-white"
                required={field.required}
                placeholder={field.label}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            ) : field.type === "select" && field.options ? (
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-transparent px-3 py-2 text-gray-800 dark:text-white"
                required={field.required}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
              >
                <option value="" disabled>
                  Select {field.label}
                </option>
                {field.options.map((opt: Option, idx: number) => (
                  <option key={idx} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-transparent px-3 py-2 text-gray-800 dark:text-white"
                placeholder={field.label}
                required={field.required}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}
          </div>
        );
      })}

      {/* Submit Button */}
      <div className="md:col-span-2 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-wide"
        >
          {loading ? "Processing..." : "Submit Response"}
        </button>
      </div>
    </form>
  );
}
