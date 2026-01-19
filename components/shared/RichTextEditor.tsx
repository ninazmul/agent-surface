"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import ListItem from "@tiptap/extension-list-item";
import ImageExtension from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Code as CodeIcon,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Image as ImageIcon,
} from "lucide-react";

import { useUploadThing } from "@/lib/uploadthing";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const RichTextEditor = ({ value, onChange }: Props) => {
  const { startUpload } = useUploadThing("mediaUploader");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true }),
      Code,
      CodeBlock,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Blockquote,
      HorizontalRule,
      ListItem,
      ImageExtension.configure({ inline: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        className:
          "tiptap-editor min-h-[200px] p-2 rounded-md " +
          "border border-gray-300 dark:border-gray-600 " + // always visible border
          "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 " +
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 " + // highlight on focus
          "dark:focus:ring-indigo-400 dark:focus:border-indigo-400",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  const addImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);

      const confirmUpload = confirm("Do you want to insert this image?");
      if (!confirmUpload) {
        setPreviewImage(null);
        return;
      }

      try {
        const uploaded = await startUpload([file]);
        if (uploaded && uploaded[0]) {
          editor.chain().focus().setImage({ src: uploaded[0].url }).run();
        }
      } catch (error) {
        console.error("Image upload failed", error);
        alert("Failed to upload image. Try again.");
      } finally {
        setPreviewImage(null);
      }
    };
    input.click();
  };

  const toolbarButtonClasses = (isActive: boolean) =>
    `p-1 rounded ${
      isActive
        ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-700 dark:text-indigo-300"
        : "hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md bg-gray-50 px-2 py-1
                dark:border-gray-600 dark:bg-gray-800
                focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500
                dark:focus-within:ring-indigo-400 dark:focus-within:border-indigo-400"
      >
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarButtonClasses(editor.isActive("bold"))}
        >
          <Bold size={18} />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarButtonClasses(editor.isActive("italic"))}
        >
          <Italic size={18} />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarButtonClasses(editor.isActive("underline"))}
        >
          U
        </button>

        {/* Strike */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={toolbarButtonClasses(editor.isActive("strike"))}
        >
          <Strikethrough size={18} />
        </button>

        {/* Code Inline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={toolbarButtonClasses(editor.isActive("code"))}
        >
          <CodeIcon size={18} />
        </button>

        {/* Highlight */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={toolbarButtonClasses(editor.isActive("highlight"))}
        >
          H
        </button>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClasses(editor.isActive("bulletList"))}
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarButtonClasses(editor.isActive("orderedList"))}
        >
          <ListOrdered size={18} />
        </button>

        {/* Text Align */}
        {["left", "center", "right", "justify"].map((align) => {
          const Icon =
            align === "left"
              ? AlignLeft
              : align === "center"
                ? AlignCenter
                : align === "right"
                  ? AlignRight
                  : AlignJustify;
          return (
            <button
              key={align}
              type="button"
              onClick={() => editor.chain().focus().setTextAlign(align).run()}
              className={toolbarButtonClasses(
                editor.isActive({ textAlign: align }),
              )}
            >
              <Icon size={18} />
            </button>
          );
        })}

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL");
            if (!url) return;
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
          className={toolbarButtonClasses(editor.isActive("link"))}
        >
          <LinkIcon size={18} />
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={addImage}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ImageIcon size={18} />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={toolbarButtonClasses(editor.isActive("blockquote"))}
        >
          <Quote size={18} />
        </button>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Minus size={18} />
        </button>

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Undo2 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Redo2 size={18} />
        </button>
      </div>

      {/* Preview */}
      {previewImage && (
        <div className="border rounded-md p-2 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Image Preview:
          </p>
          <div className="relative w-full h-[200px]">
            <Image
              src={previewImage}
              alt="Preview"
              fill
              className="object-contain rounded-md"
            />
          </div>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} className="tiptap-editor" />

      <style jsx>{`
        .tiptap-editor a {
          @apply text-blue-600 dark:text-blue-400 underline;
        }
        .tiptap-editor img {
          @apply max-w-full rounded-md my-2;
        }
      `}</style>
    </div>
  );
};
