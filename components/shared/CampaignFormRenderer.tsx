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
      <div className="max-w-xl mx-auto bg-white p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Thank you!</h2>
        <p className="text-gray-500 mt-3">
          Your submission has been successfully received.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
    >
      <div className="p-8 md:p-12 space-y-8">
        {fields.map((field) => {
          const isShort = /name|gender|birth|status/i.test(field.label);
          return (
            <div key={field._id} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              <div className={isShort ? "max-w-md" : "w-full"}>
                {field.type === "textarea" ? (
                  <textarea
                    rows={5}
                    className="w-full border border-gray-300 rounded-md p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    required={field.required}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                ) : field.type === "select" && field.options ? (
                  <select
                    className="w-full border border-gray-300 rounded-md p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    required={field.required}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((opt: Option, idx: number) => (
                      <option key={idx} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    className="w-full border border-gray-300 rounded-md p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder={
                      field.label.toLowerCase().includes("email")
                        ? "ex: myname@example.com"
                        : `Enter ${field.label.toLowerCase()}`
                    }
                    required={field.required}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}
              </div>

              <span className="text-xs text-gray-400 mt-1">{field.label}</span>
            </div>
          );
        })}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm transition-all disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            {loading ? "Processing..." : "Submit Response"}
          </button>
        </div>
      </div>
    </form>
  );
}
