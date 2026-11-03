"use client";

import {
  Bold,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import Link from "@tiptap/extension-link";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/admin/ui/form";
import { Input } from "@/components/admin/ui/input";
import { cn } from "@/lib/utils";
import type { Control, FieldValues, Path } from "react-hook-form";

function isSafeLink(value: string) {
  if (
    (value.startsWith("/") && !value.startsWith("//")) ||
    value.startsWith("#")
  ) {
    return true;
  }
  try {
    return ["http:", "https:", "mailto:", "tel:"].includes(
      new URL(value).protocol,
    );
  } catch {
    return false;
  }
}

function normalizeLink(value: string) {
  const trimmed = value.trim();
  if (
    trimmed &&
    !/^[a-z][a-z\d+.-]*:/i.test(trimmed) &&
    !trimmed.startsWith("/") &&
    !trimmed.startsWith("#")
  ) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toEditorHtml(value: string) {
  if (!value) return "";
  if (
    /<(?:p|h[1-4]|ul|ol|li|blockquote|a|strong|b|em|i|u|s|del|hr|table|thead|tbody|tr|th|td)\b/i.test(
      value,
    )
  ) {
    return value;
  }
  return value
    .trim()
    .split(/\n{2,}/)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

const editorExtensions = [
  StarterKit.configure({
    code: false,
    codeBlock: false,
    heading: { levels: [2, 3, 4] },
    link: false,
    underline: false,
  }),
  Link.configure({
    openOnClick: false,
    defaultProtocol: "https",
    protocols: ["mailto", "tel"],
    isAllowedUri: (url, { defaultValidate }) =>
      isSafeLink(url) || defaultValidate(url),
    HTMLAttributes: {
      target: "_blank",
      rel: "noopener noreferrer nofollow",
    },
  }),
  Underline,
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
];

type ToolbarState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  heading2: boolean;
  heading3: boolean;
  heading4: boolean;
  bulletList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  link: boolean;
  table: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canAddRow: boolean;
  canAddColumn: boolean;
};

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active && "border-border bg-accent text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function EditorToolbar({
  editor,
  state,
}: {
  editor: Editor;
  state: ToolbarState;
}) {
  const [linkEditorOpen, setLinkEditorOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");

  function openLinkEditor() {
    setLinkUrl(String(editor.getAttributes("link").href ?? ""));
    setLinkError("");
    setLinkEditorOpen((open) => !open);
  }

  function applyLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = normalizeLink(linkUrl);
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkEditorOpen(false);
      return;
    }
    if (!isSafeLink(url)) {
      setLinkError("Enter an http, https, mailto, tel, or relative link.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setLinkEditorOpen(false);
    setLinkError("");
  }

  return (
    <div className="border-border bg-muted/40 flex flex-wrap items-center gap-1 border-b p-2">
      <ToolbarButton
        label="Paragraph"
        active={!state.heading2 && !state.heading3 && !state.heading4}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <span className="text-xs font-semibold">P</span>
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        active={state.heading2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={state.heading3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 4"
        active={state.heading4}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <Heading4 className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <span className="bg-border mx-1 h-6 w-px" aria-hidden="true" />
      <ToolbarButton
        label="Bold"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={state.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <span className="bg-border mx-1 h-6 w-px" aria-hidden="true" />
      <ToolbarButton
        label="Bulleted list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Block quote"
        active={state.blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Insert divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Link" active={state.link} onClick={openLinkEditor}>
        <LinkIcon className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Insert table"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <Table2 className="size-4" aria-hidden="true" />
      </ToolbarButton>
      {state.table ? (
        <>
          <ToolbarButton
            label="Add table row"
            disabled={!state.canAddRow}
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <span className="text-xs font-semibold">+R</span>
          </ToolbarButton>
          <ToolbarButton
            label="Add table column"
            disabled={!state.canAddColumn}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <span className="text-xs font-semibold">+C</span>
          </ToolbarButton>
          <ToolbarButton
            label="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <span className="text-xs font-semibold">−T</span>
          </ToolbarButton>
        </>
      ) : null}
      <span className="bg-border mx-1 h-6 w-px" aria-hidden="true" />
      <ToolbarButton
        label="Undo"
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="size-4" aria-hidden="true" />
      </ToolbarButton>
      {linkEditorOpen ? (
        <div className="flex basis-full flex-wrap items-start gap-2 pt-2">
          <form
            className="flex min-w-0 flex-1 items-start gap-2"
            onSubmit={applyLink}
          >
            <Input
              aria-label="Link URL"
              autoFocus
              className="bg-card max-w-md"
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setLinkEditorOpen(false);
              }}
              placeholder="https://example.com or /page"
              value={linkUrl}
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground h-9 shrink-0 rounded-lg px-3 text-sm"
            >
              Apply
            </button>
          </form>
          {linkError ? (
            <p className="text-destructive basis-full text-sm" role="alert">
              {linkError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function BlogContentEditor({
  value,
  onChange,
  onBlur,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  label: string;
}) {
  const { formItemId, formDescriptionId, formMessageId, error } =
    useFormField();
  const editorContent = useMemo(() => toEditorHtml(value), [value]);
  const describedBy = error
    ? `${formDescriptionId} ${formMessageId}`
    : formDescriptionId;
  const editor = useEditor({
    extensions: editorExtensions,
    content: editorContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id: formItemId,
        class: "blog-editor-content focus:outline-none",
        role: "textbox",
        "aria-label": label,
        "aria-multiline": "true",
        "aria-describedby": describedBy,
        "aria-invalid": String(Boolean(error)),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.isEmpty ? "" : currentEditor.getHTML());
    },
    onBlur,
  });
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return null;
      return {
        bold: currentEditor.isActive("bold"),
        italic: currentEditor.isActive("italic"),
        underline: currentEditor.isActive("underline"),
        strike: currentEditor.isActive("strike"),
        heading2: currentEditor.isActive("heading", { level: 2 }),
        heading3: currentEditor.isActive("heading", { level: 3 }),
        heading4: currentEditor.isActive("heading", { level: 4 }),
        bulletList: currentEditor.isActive("bulletList"),
        orderedList: currentEditor.isActive("orderedList"),
        blockquote: currentEditor.isActive("blockquote"),
        link: currentEditor.isActive("link"),
        table: currentEditor.isActive("table"),
        canUndo: currentEditor.can().undo(),
        canRedo: currentEditor.can().redo(),
        canAddRow:
          currentEditor.isActive("table") && currentEditor.can().addRowAfter(),
        canAddColumn:
          currentEditor.isActive("table") &&
          currentEditor.can().addColumnAfter(),
      };
    },
  });

  useEffect(() => {
    if (!editor || (editor.isEmpty && !value)) return;
    if (editor.getHTML() !== editorContent) {
      editor.commands.setContent(editorContent, { emitUpdate: false });
    }
  }, [editor, editorContent, value]);

  return (
    <div
      className={cn(
        "border-input bg-card overflow-hidden rounded-xl border shadow-sm",
        error && "border-destructive",
      )}
    >
      {editor ? (
        <EditorToolbar
          editor={editor}
          state={
            toolbarState ?? {
              bold: false,
              italic: false,
              underline: false,
              strike: false,
              heading2: false,
              heading3: false,
              heading4: false,
              bulletList: false,
              orderedList: false,
              blockquote: false,
              link: false,
              table: false,
              canUndo: false,
              canRedo: false,
              canAddRow: false,
              canAddColumn: false,
            }
          }
        />
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}

export function BlogContentEditorField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  required?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required ? <span className="text-destructive">*</span> : null}
          </FormLabel>
          <BlogContentEditor
            value={typeof field.value === "string" ? field.value : ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            label={label}
          />
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
