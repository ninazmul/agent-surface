"use client";

import { submitCampaignForm } from "@/lib/actions/campaign.actions";
import { CampaignField } from "@/types";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CampaignFormRenderer({ slug, fields }: { slug: string; fields: CampaignField[] }) {
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
      <div className="bg-white p-12 border border-gray-200 rounded-sm text-center shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">Thank you!</h2>
        <p className="text-gray-500 mt-2">Your submission has been received.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-sm border border-gray-200 border-t-[5px] border-t-[#4f70e7] rounded-sm overflow-hidden"
    >
      <div className="p-8 md:p-12 space-y-10">
        {fields.map((field) => {
          /**
           * Screenshot logic: 
           * Short fields (Name, Gender, DOB) take ~33% width.
           * Long fields (Email, Number, Address) take 100% width.
           */
          const isShort = /name|gender|birth|status/i.test(field.label);
          
          return (
            <div key={field._id} className="flex flex-col">
              <label className="text-[15px] font-semibold text-gray-700 mb-2 flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              <div className={isShort ? "max-w-sm" : "w-full"}>
                {field.type === "textarea" ? (
                  <textarea
                    rows={6}
                    className="w-full border border-gray-200 rounded-[2px] p-3 text-gray-800 outline-none focus:border-blue-400 transition-colors"
                    required={field.required}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.label.toLowerCase().includes("email") ? "ex: myname@example.com" : ""}
                    className="w-full border border-gray-200 rounded-[2px] p-3 text-gray-800 outline-none focus:border-blue-400 transition-colors placeholder:text-gray-300"
                    required={field.required}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}
              </div>
              
              {/* Sub-label (Caption) exactly like the screenshot */}
              <span className="text-[12px] text-gray-400 mt-1.5 font-normal">
                {field.label}
              </span>
            </div>
          );
        })}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3.5 bg-[#4f70e7] hover:bg-[#3d59c4] text-white font-medium rounded-sm transition-all disabled:bg-gray-300 uppercase text-sm tracking-wide"
          >
            {loading ? "Processing..." : "Submit Response"}
          </button>
        </div>
      </div>
    </form>
  );
}