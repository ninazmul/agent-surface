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
      <div className="max-w-7xl mx-auto p-10 bg-white border border-gray-200 rounded-lg text-center">
        <h2 className="text-xl font-medium text-gray-900">Thank you!</h2>
        <p className="text-gray-500">Your submission has been received.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-7xl mx-auto bg-white p-10 shadow-sm border-t-4 border-t-blue-600 rounded-t-sm"
      >
        {/* Using a grid that adapts based on the field type */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-8">
          {fields.map((field) => {
            // Determine width based on field name hints (like 'city', 'zip', 'first')
            const isShort = /name|city|zip|state|phone|gender|date/i.test(
              field.label
            );
            const gridSpan = isShort ? "md:col-span-2" : "md:col-span-6";

            return (
              <div
                key={field._id}
                className={`${gridSpan} flex flex-col space-y-1`}
              >
                <label className="text-[16px] font-medium text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    className="w-full border border-gray-300 rounded-sm p-2 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    required={field.required}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                ) : field.type === "select" ? (
                  <select
                    className="w-full border border-gray-300 rounded-sm p-2.5 bg-white focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundImage:
                        'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                      backgroundSize: "10px",
                      backgroundPosition: "right 15px center",
                      backgroundRepeat: "no-repeat",
                    }}
                    required={field.required}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    <option value="">Please Select</option>
                    {/* Dynamic options would go here */}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    className="w-full border border-gray-300 rounded-sm p-2 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder={
                      field.label.toLowerCase().includes("email")
                        ? "ex: myname@example.com"
                        : ""
                    }
                    required={field.required}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}

                {/* Caption / Sub-label */}
                <span className="text-[13px] text-gray-500">{field.label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-10 py-3 bg-[#2c3345] hover:bg-black text-white font-semibold rounded-sm transition-all shadow-md disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "SUBMIT RESPONSE"}
          </button>
        </div>
      </form>
    </div>
  );
}
