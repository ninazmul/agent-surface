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
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-2xl text-center animate-fadeIn">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
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
      className="max-w-6xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-fadeIn"
    >
      <div className="p-8 md:p-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <div
              key={field._id}
              className="relative group bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Floating Label */}
              <label className="absolute -top-3 left-4 px-1 text-xs font-semibold text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 group-focus-within:text-blue-500 transition-all">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {/* Field Input */}
              {field.type === "textarea" ? (
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-4 pt-6 text-gray-800 dark:text-white bg-white dark:bg-gray-900 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required={field.required}
                  placeholder={field.label}
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              ) : field.type === "select" && field.options ? (
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-4 pt-6 text-gray-800 dark:text-white bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
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
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-4 pt-6 text-gray-800 dark:text-white bg-white dark:bg-gray-900 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={
                    field.label.toLowerCase().includes("email")
                      ? "ex: myname@example.com"
                      : field.label
                  }
                  required={field.required}
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}

              {/* Optional guidance text */}
              {field.type === "select" &&
                field.options &&
                field.options.length > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                    Choose one option
                  </span>
                )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-wide text-lg"
          >
            {loading ? "Processing..." : "Submit Response"}
          </button>
        </div>
      </div>
    </form>
  );
}
