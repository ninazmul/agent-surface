"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createCampaignForm } from "@/lib/actions/campaign.actions";
import { useRouter } from "next/navigation";

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
}

export default function CampaignFormBuilder({
  author,
}: CampaignFormBuilderProps) {
  const router = useRouter();
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
      type: "textarea",
      required: false,
      isDefault: true,
    },
    {
      label: "City",
      name: "city",
      type: "textarea",
      required: false,
      isDefault: true,
    },
    {
      label: "State",
      name: "state",
      type: "textarea",
      required: false,
      isDefault: true,
    },
    {
      label: "Zip",
      name: "zip",
      type: "textarea",
      required: false,
      isDefault: true,
    },
    {
      label: "Country",
      name: "country",
      type: "textarea",
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
    value: string | boolean | Option[]
  ) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [key]: value } : f))
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
            }
          : f
      )
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
          : f
      )
    );
  };

  const updateOption = (
    fieldIndex: number,
    optionIndex: number,
    key: keyof Option,
    value: string
  ) => {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== fieldIndex) return f;
        const newOptions = [...(f.options || [])];
        newOptions[optionIndex] = { ...newOptions[optionIndex], [key]: value };
        return { ...f, options: newOptions };
      })
    );
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    setFields((prev) =>
      prev.map((f, i) =>
        i === fieldIndex
          ? { ...f, options: f.options?.filter((_, j) => j !== optionIndex) }
          : f
      )
    );
  };

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
        progress: "Open",
        fields,
      };
      await createCampaignForm(payload);
      toast.success("Form created successfully!");
      router.push("/leads/campaigns");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      {/* Form Meta */}
      <div className="space-y-3">
        <input
          className="w-full border p-2 rounded bg-white dark:bg-gray-900 dark:text-white text-black border-gray-300 dark:border-gray-700"
          placeholder="Form title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border p-2 rounded bg-white dark:bg-gray-900 dark:text-white text-black border-gray-300 dark:border-gray-700"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded bg-white dark:bg-gray-900 dark:text-white text-black border-gray-300 dark:border-gray-700"
          placeholder="Slug (e.g. eid-offer-leads)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <h3 className="font-semibold text-black dark:text-white">Fields</h3>
        {fields.map((field, index) => (
          <div
            key={index}
            className="border rounded p-3 space-y-2 bg-gray-50 dark:bg-gray-800"
          >
            <input
              placeholder="Label"
              className="w-full border p-2 rounded"
              value={field.label}
              onChange={(e) => updateField(index, "label", e.target.value)}
            />
            <input
              placeholder="Name (key)"
              className="w-full border p-2 rounded"
              value={field.name}
              onChange={(e) => updateField(index, "name", e.target.value)}
            />
            <select
              className="w-full border p-2 rounded"
              value={field.type}
              onChange={(e) =>
                updateFieldType(index, e.target.value as FieldType)
              }
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
              <option value="date">Date</option>
            </select>

            {/* Options for select */}
            {field.type === "select" && (
              <div className="space-y-1">
                {(field.options || []).map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      placeholder="Label"
                      className="border p-1 rounded flex-1"
                      value={opt.label}
                      onChange={(e) =>
                        updateOption(index, i, "label", e.target.value)
                      }
                    />
                    <input
                      placeholder="Value"
                      className="border p-1 rounded flex-1"
                      value={opt.value}
                      onChange={(e) =>
                        updateOption(index, i, "value", e.target.value)
                      }
                    />
                    <button
                      onClick={() => removeOption(index, i)}
                      className="text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOption(index)}
                  className="px-2 py-1 border rounded bg-gray-200"
                >
                  + Add Option
                </button>
              </div>
            )}

            {/* Value input */}
            {field.type !== "select" &&
              (field.type === "textarea" ? (
                <textarea
                  className="w-full border p-2 rounded"
                  value={field.value || ""}
                  onChange={(e) => updateField(index, "value", e.target.value)}
                />
              ) : (
                <input
                  type={field.type}
                  className="w-full border p-2 rounded"
                  value={field.value || ""}
                  onChange={(e) => updateField(index, "value", e.target.value)}
                />
              ))}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) =>
                  updateField(index, "required", e.target.checked)
                }
              />
              Required
            </label>

            {!field.isDefault && (
              <button
                onClick={() => removeField(index)}
                className="text-red-600 text-sm"
              >
                Remove field
              </button>
            )}
          </div>
        ))}

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
        className="w-full py-2 rounded bg-black text-white dark:bg-white dark:text-black"
      >
        {loading ? "Creating..." : "Create Form"}
      </button>
    </div>
  );
}
