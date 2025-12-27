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

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      await submitCampaignForm({ slug, answers: values });
      setSuccess(true);
    } catch {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return <p className="text-green-600">Thank you for your response!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field._id}>
          <label className="block mb-1 font-medium">
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </label>

          {field.type === "textarea" ? (
            <textarea
              required={field.required}
              className="w-full border rounded p-2"
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          ) : (
            <input
              type={field.type}
              required={field.required}
              className="w-full border rounded p-2"
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
