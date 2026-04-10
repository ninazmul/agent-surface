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

  const fieldClassName =
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm transition placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400";

  if (success) {
    return (
      <div className="p-8 sm:p-10 text-center animate-fadeIn">
        <div className="mx-auto mb-5 h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-xl font-bold">
          ✓
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Thank you!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
          Your submission has been successfully received.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 md:p-8"
    >
      <div className="space-y-8">
        <div className="pb-4 border-b border-gray-200/80 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Fill in your details
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please complete all required fields to submit your response.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {fields.map((field) => {
            const isTextarea = field.type === "textarea";
            const isFullWidth = isTextarea;

            return (
              <div
                key={field._id}
                className={`space-y-2.5 ${isFullWidth ? "md:col-span-2" : ""}`}
              >
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {/* TEXTAREA */}
                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    required={field.required}
                    placeholder={field.label}
                    value={values[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={fieldClassName}
                  />
                ) : field.type === "select" && field.options ? (
                  /* SELECT */
                  <select
                    required={field.required}
                    value={values[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={fieldClassName}
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
                  /* INPUT */
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.label}
                    value={values[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={fieldClassName}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="pt-5 border-t border-gray-200/80 dark:border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-400 dark:hover:to-blue-400 text-white font-semibold tracking-wide shadow-lg shadow-indigo-500/25 transition disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Submit Response"}
          </button>
        </div>
      </div>
    </form>
  );
}
