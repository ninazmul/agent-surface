"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createCampaignForm } from "@/lib/actions/campaign.actions";

type FieldType = "text" | "email" | "number" | "textarea";

interface Field {
  label: string;
  name: string;
  type: FieldType;
  required: boolean;
}

export default function CampaignFormBuilder({ author }: { author: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  function addField() {
    setFields((prev) => [
      ...prev,
      {
        label: "",
        name: "",
        type: "text",
        required: false,
      },
    ]);
  }

  function updateField(index: number, key: keyof Field, value: unknown) {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [key]: value } : f))
    );
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate() {
    if (!title || !slug || fields.length === 0) {
      toast.error("Title, slug and at least one field are required");
      return;
    }

    setLoading(true);

    try {
      await createCampaignForm({
        title,
        description,
        slug,
        author: author,
        fields,
      });

      const url = `${window.location.origin}/campaign/${slug}`;
      setShareUrl(url);
      toast.success("Form created successfully");
    } catch {
      toast.error("Failed to create form");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Meta */}
      <div className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Form title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Slug (e.g. eid-offer-leads)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <h3 className="font-semibold">Fields</h3>

        {fields.map((field, index) => (
          <div key={index} className="border rounded p-3 space-y-2 bg-gray-50">
            <input
              className="w-full border p-2 rounded"
              placeholder="Label"
              value={field.label}
              onChange={(e) => updateField(index, "label", e.target.value)}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Name (key)"
              value={field.name}
              onChange={(e) => updateField(index, "name", e.target.value)}
            />

            <select
              className="w-full border p-2 rounded"
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

            <button
              onClick={() => removeField(index)}
              className="text-red-600 text-sm"
            >
              Remove field
            </button>
          </div>
        ))}

        <button onClick={addField} className="px-4 py-2 border rounded">
          + Add Field
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded"
      >
        {loading ? "Creating..." : "Create Form"}
      </button>

      {/* Share */}
      {shareUrl && (
        <div className="p-4 border rounded bg-green-50">
          <p className="font-medium">Share this link:</p>
          <a
            href={shareUrl}
            target="_blank"
            className="text-blue-600 break-all"
          >
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
}
