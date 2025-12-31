"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createCampaignForm } from "@/lib/actions/campaign.actions";
import { useRouter } from "next/navigation";

type FieldType = "text" | "email" | "number" | "textarea";

interface Field {
  label: string;
  name: string;
  type: FieldType;
  required: boolean;
}

interface CampaignFormBuilderProps {
  author: string;
}

export default function CampaignFormBuilder({ author }: CampaignFormBuilderProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [fields, setFields] = useState<Field[]>([
    { label: "Name", name: "name", type: "text", required: true },
    { label: "Email", name: "email", type: "email", required: true },
    { label: "Number", name: "number", type: "text", required: true },
    { label: "Gender", name: "gender", type: "text", required: false },
    { label: "Marital Status", name: "maritalStatus", type: "text", required: false },
    { label: "Date of Birth", name: "dateOfBirth", type: "text", required: false },
    { label: "Home Address", name: "home", type: "textarea", required: false },
    { label: "Passport", name: "passport", type: "textarea", required: false },
    { label: "Note", name: "note", type: "textarea", required: false },
    { label: "Progress", name: "progress", type: "text", required: true },
    { label: "Status", name: "status", type: "text", required: false },
    { label: "Date", name: "date", type: "text", required: true },
    { label: "Author", name: "author", type: "text", required: true },
    { label: "Social", name: "social", type: "textarea", required: false },
  ]);

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { label: "", name: "", type: "text", required: false },
    ]);
  };

  const updateField = (index: number, key: keyof Field, value: unknown) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [key]: value } : f))
    );
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
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

  const [loading, setLoading] = useState(false);

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
              className="w-full border p-2 rounded bg-white dark:bg-gray-900 dark:text-white text-black border-gray-300 dark:border-gray-700"
              placeholder="Label"
              value={field.label}
              onChange={(e) => updateField(index, "label", e.target.value)}
            />

            <input
              className="w-full border p-2 rounded bg-white dark:bg-gray-900 dark:text-white text-black border-gray-300 dark:border-gray-700"
              placeholder="Name (key)"
              value={field.name}
              onChange={(e) => updateField(index, "name", e.target.value)}
            />

            <select
              className="w-full border p-2 rounded bg-white dark:bg-gray-900 dark:text-white text-black border-gray-300 dark:border-gray-700"
              value={field.type}
              onChange={(e) =>
                updateField(index, "type", e.target.value as FieldType)
              }
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
              <option value="textarea">Textarea</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-black dark:text-white">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) =>
                  updateField(index, "required", e.target.checked)
                }
              />
              Required
            </label>

            <button
              onClick={() => removeField(index)}
              className="text-red-600 dark:text-red-400 text-sm"
            >
              Remove field
            </button>
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
