"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

import type { TiptapJSON } from "@/lib/types";

/** An empty Tiptap document — the shape the API expects when there's no body yet. */
export const EMPTY_DOC: TiptapJSON = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

/** True when the document has no actual text (only empty paragraphs). */
export function isEmptyDoc(doc: TiptapJSON): boolean {
  const walk = (nodes: TiptapJSON["content"]): boolean =>
    (nodes ?? []).some((node) =>
      node.type === "text"
        ? Boolean(node.text?.trim())
        : walk(node.content ?? []),
    );
  return !walk(doc.content);
}

const ICON = { size: 14, strokeWidth: 1.8 } as const;

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-7 w-7 items-center justify-center transition-colors hover:cursor-pointer disabled:opacity-40 ${
        active
          ? "bg-eyebrow text-background-main"
          : "text-eyebrow hover:bg-eyebrow/10"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-4 w-px bg-headline/15" />;

/** Prompt for a URL and apply it to the selection (empty input removes the link). */
function promptForLink(editor: Editor) {
  const current = editor.getAttributes("link").href as string | undefined;
  const input = window.prompt(
    "Link URL — https://…, mailto:… or an internal path like /projects",
    current ?? "https://",
  );
  if (input === null) return; // cancelled

  const url = input.trim();
  if (!url) {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  if (!/^(https?:\/\/|mailto:|\/)/i.test(url)) {
    window.alert("Link must start with https://, mailto: or /");
    return;
  }
  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

function Toolbar({ editor }: { editor: Editor }) {
  // v3: the editor no longer re-renders on every transaction, so subscribe
  // explicitly — otherwise the active states would go stale.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      h4: e.isActive("heading", { level: 4 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-eyebrow/40 bg-background-alt/60 px-2 py-1.5">
      <ToolbarButton
        label="Bold"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={state.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={state.code}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code {...ICON} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Heading 2"
        active={state.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={state.h3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 4"
        active={state.h4}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <Heading4 {...ICON} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Bullet list"
        active={state.bullet}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={state.ordered}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={state.quote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        label="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus {...ICON} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label={state.link ? "Edit link" : "Add link"}
        active={state.link}
        onClick={() => promptForLink(editor)}
      >
        <Link2 {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        label="Remove link"
        disabled={!state.link}
        onClick={() =>
          editor.chain().focus().extendMarkRange("link").unsetLink().run()
        }
      >
        <Link2Off {...ICON} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Undo"
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 {...ICON} />
      </ToolbarButton>
    </div>
  );
}

// WYSIWYG: these mirror how tiptap-content.tsx renders the same nodes on the
// public site, so what the admin sees is what visitors get.
const PROSE_CLASSES = [
  "min-h-48 px-4 py-3 text-sm leading-relaxed text-headline focus:outline-none",
  "[&_p]:mb-3",
  "[&_h2]:font-serif [&_h2]:text-2xl [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-headline",
  "[&_h3]:font-serif [&_h3]:text-xl [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-headline",
  "[&_h4]:font-serif [&_h4]:text-lg [&_h4]:mt-3 [&_h4]:mb-2 [&_h4]:text-headline",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1",
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-eyebrow [&_blockquote]:pl-5 [&_blockquote]:py-1 [&_blockquote]:font-serif [&_blockquote]:text-lg [&_blockquote]:italic",
  "[&_hr]:my-5 [&_hr]:border-headline/15",
  "[&_a]:text-headline [&_a]:underline [&_a]:underline-offset-2",
  "[&_code]:rounded [&_code]:bg-background-alt [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em]",
  "[&_pre]:bg-background-alt [&_pre]:p-4 [&_pre]:mb-3 [&_pre]:overflow-x-auto [&_pre]:text-xs",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
].join(" ");

export default function TiptapEditor({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: TiptapJSON;
  onChange: (doc: TiptapJSON) => void;
  error?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // The article title is the page's h1, so body headings start at h2 —
        // keeps the document outline valid for SEO and screen readers.
        heading: { levels: [2, 3, 4] },
        // Clicking a link in the editor should place the cursor, not navigate.
        link: { openOnClick: false },
      }),
    ],
    content: value,
    // Required under SSR — rendering immediately causes a hydration mismatch.
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON() as TiptapJSON),
    editorProps: { attributes: { class: PROSE_CLASSES } },
  });

  return (
    <div>
      <p className="text-xs tracking-widest uppercase text-headline">{label}</p>
      <div className="mt-3 border border-eyebrow/50">
        {editor && <Toolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
    </div>
  );
}
