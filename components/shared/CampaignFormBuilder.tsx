"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createCampaignForm } from "@/lib/actions/campaign.actions";

type FieldType = "text" | "email" | "number" | "textarea" | "select" | "date";

interface Option {
  label: string;
  value: string;
}

interface Field {
  label: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: Option[];
  value?: string;
  isDefault?: boolean;
}

interface CampaignFormBuilderProps {
  author: string;
  onSuccess?: () => void;
}

export default function CampaignFormBuilder({
  author,
  onSuccess,
}: CampaignFormBuilderProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Field[]>([
    {
      label: "Name",
      name: "name",
      type: "text",
      required: true,
      isDefault: true,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: true,
      isDefault: true,
    },
    {
      label: "Number",
      name: "number",
      type: "number",
      required: true,
      isDefault: true,
    },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      required: true,
      isDefault: true,
      options: [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
      ],
    },
    {
      label: "Marital Status",
      name: "maritalStatus",
      type: "select",
      required: true,
      isDefault: true,
      options: [
        { label: "Single", value: "Single" },
        { label: "Married", value: "Married" },
        { label: "Divorced", value: "Divorced" },
        { label: "Widowed", value: "Widowed" },
      ],
    },
    {
      label: "Date of Birth",
      name: "dateOfBirth",
      type: "date",
      required: true,
      isDefault: true,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      isDefault: true,
    },
    {
      label: "City",
      name: "city",
      type: "text",
      required: false,
      isDefault: true,
    },
    {
      label: "State",
      name: "state",
      type: "text",
      required: false,
      isDefault: true,
    },
    {
      label: "Zip",
      name: "zip",
      type: "text",
      required: false,
      isDefault: true,
    },
    {
      label: "Country",
      name: "country",
      type: "text",
      required: false,
      isDefault: true,
    },
    {
      label: "Facebook",
      name: "facebook",
      type: "text",
      required: false,
      isDefault: true,
    },
    {
      label: "Instagram",
      name: "instagram",
      type: "text",
      required: false,
      isDefault: true,
    },
    {
      label: "Twitter",
      name: "twitter",
      type: "text",
      required: false,
      isDefault: true,
    },
    {
      label: "Skype",
      name: "skype",
      type: "text",
      required: false,
      isDefault: true,
    },
    {
      label: "How did you hear about us?",
      name: "source",
      type: "select",
      required: true,
      isDefault: true,
      options: [
        { label: "Google", value: "google" },
        { label: "Facebook", value: "facebook" },
        { label: "Instagram", value: "instagram" },
        { label: "Friend / Referral", value: "referral" },
        { label: "Other", value: "other" },
      ],
    },
  ]);

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { label: "", name: "", type: "text", required: false, options: [] },
    ]);
  };

  const updateField = (
    index: number,
    key: keyof Field,
    value: string | boolean | Option[],
  ) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [key]: value } : f)),
    );
  };

  const updateFieldType = (index: number, type: FieldType) => {
    setFields((prev) =>
      prev.map((f, i) =>
        i === index
          ? {
              ...f,
              type,
              options:
                type === "select"
                  ? f.options || [{ label: "", value: "" }]
                  : [],
              value: type !== "select" ? f.value || "" : undefined,
            }
          : f,
      ),
    );
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const addOption = (fieldIndex: number) => {
    setFields((prev) =>
      prev.map((f, i) =>
        i === fieldIndex
          ? { ...f, options: [...(f.options || []), { label: "", value: "" }] }
          : f,
      ),
    );
  };

  const updateOption = (
    fieldIndex: number,
    optionIndex: number,
    key: keyof Option,
    value: string,
  ) => {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== fieldIndex) return f;
        const newOptions = [...(f.options || [])];
        newOptions[optionIndex] = { ...newOptions[optionIndex], [key]: value };
        return { ...f, options: newOptions };
      }),
    );
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    setFields((prev) =>
      prev.map((f, i) =>
        i === fieldIndex
          ? { ...f, options: f.options?.filter((_, j) => j !== optionIndex) }
          : f,
      ),
    );
  };

  const generateFieldName = (label: string) =>
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_");

  const handleCreate = async () => {
    if (!title || !slug || fields.length === 0) {
      toast.error("Title, slug, and at least one field are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        slug,
        author,
        fields: fields.map((f) => ({
          label: f.label,
          name: f.name,
          type: f.type,
          required: f.required,
          ...(f.type === "select" && { options: f.options || [] }), // include options only for select
        })),
      };

      await createCampaignForm(payload);
      toast.success("Form created successfully!");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div
        className="space-y-6 max-w-4xl mx-auto
        w-full
        min-w-0
        rounded-2xl
        bg-white dark:bg-gray-800
        p-4 sm:p-6
        shadow-sm
      "
      >
        {/* Form Meta */}
        <div className="space-y-4">
          <div className="flex items-start gap-4 border-b pb-4">
            {/* Circle Number */}
            <div className="flex items-center justify-center w-8 h-8 text-purple-950 font-semibold rounded-full bg-purple-100">
              1
            </div>

            {/* Text Content */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Campaign Identity
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Basic information about your campaign.
              </p>
            </div>
          </div>
          {/* Title + Slug Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col">
              <label
                htmlFor="campaign-title"
                className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Campaign Title
              </label>
              <input
                id="campaign-title"
                type="text"
                className="w-full border p-2 rounded bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Eid Offer Leads"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label
                htmlFor="campaign-slug"
                className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Campaign Slug
              </label>
              <input
                id="campaign-slug"
                type="text"
                className="w-full border p-2 rounded bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. eid-offer-leads"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label
              htmlFor="campaign-description"
              className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="campaign-description"
              rows={4}
              className="w-full border p-2 rounded bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe the purpose of this campaign..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Default Fields Preview */}
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-8 h-8 text-purple-950 font-semibold rounded-full bg-purple-100">
              2
            </div>

            <div className="flex-1">
              <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
                Default Lead Fields{" "}
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  Preview Only
                </span>
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                These system-defined fields will automatically be included in
                every campaign.
              </p>
            </div>
          </div>

          {/* Preview Card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-6 space-y-10">
            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Basic Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    disabled
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    disabled
                    placeholder="john@email.com"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Demographics
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Marital Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Single", "Married", "Divorced", "Widowed"].map(
                      (item) => (
                        <span
                          key={item}
                          className="px-3 py-1 text-xs rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          {item}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Male", "Female", "Other", "Prefer not to say"].map(
                      (item) => (
                        <span
                          key={item}
                          className="px-3 py-1 text-xs rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          {item}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Date of Birth
              </h3>

              <input
                disabled
                type="date"
                className="w-full md:w-1/2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Location */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Location
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  disabled
                  placeholder="Street Address"
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                />

                <input
                  disabled
                  placeholder="City"
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                />

                <input
                  disabled
                  placeholder="State / Province"
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                />

                <input
                  disabled
                  placeholder="Zip / Postal Code"
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                />

                <input
                  disabled
                  placeholder="Country"
                  className="md:col-span-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Referral */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Referral Source
              </h3>

              <div className="flex flex-wrap gap-2">
                {["Google", "Facebook", "Instagram", "Referral", "Other"].map(
                  (item) => (
                    <span
                      key={item}
                      className="px-3 py-1 text-xs rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Fields */}
        <div className="space-y-4">
          <div className="flex items-start gap-4 border-b pb-4">
            {/* Circle Number */}
            <div className="flex items-center justify-center w-8 h-8 text-purple-950 font-semibold rounded-full bg-purple-100">
              3
            </div>

            {/* Text Content */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Custom Input Fields
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Define a custom data point to collect.
              </p>
            </div>
          </div>

          {fields.map((field, index) => {
            if (field.isDefault) return null;

            return (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-6 space-y-6 transition"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                      Custom Field
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Define the input type and validation rules.
                    </p>
                  </div>

                  <button
                    onClick={() => removeField(index)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>

                {/* Label */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Field Label
                  </label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      updateField(index, "label", newLabel);
                      updateField(index, "name", generateFieldName(newLabel));
                    }}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder="e.g. Company Name"
                  />
                </div>

                {/* Type + Required */}
                <div className="grid md:grid-cols-2 justify-items-center gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Field Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateFieldType(index, e.target.value as FieldType)
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                      <option value="date">Date</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(index, "required", e.target.checked)
                        }
                        className="accent-purple-600"
                      />
                      Required Field
                    </label>
                  </div>
                </div>

                {/* Select Options */}
                {field.type === "select" && (
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Options
                    </label>

                    {(field.options || []).map((opt, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <input
                          placeholder="Option Label"
                          value={opt.label}
                          onChange={(e) =>
                            updateOption(index, i, "label", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        />

                        <button
                          onClick={() => removeOption(index, i)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => addOption(index)}
                      className="text-sm font-medium text-purple-600 hover:underline"
                    >
                      + Add Option
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add new custom field */}
          <button
            onClick={addField}
            className="px-4 py-2 border rounded bg-black text-white dark:bg-white dark:text-black"
          >
            + Add Field
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-2 mt-4 rounded bg-black text-white dark:bg-white dark:text-black disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Form"}
        </button>
      </div>
    </div>
  );
}
