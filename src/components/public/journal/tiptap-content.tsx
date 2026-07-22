import type { ReactNode } from "react";
import Image from "next/image";
// NOTE: sesuaikan path import ini dengan lokasi types.ts di project kamu
// (mis. "@/types" atau "@/lib/types").
import type { TiptapJSON, TiptapNode } from "@/lib/types";

/**
 * Merender dokumen TiptapJSON (dari ArticleView.content) menjadi HTML
 * dengan styling yang konsisten dengan desain ORI (font-serif untuk heading,
 * text-body untuk paragraf).
 */
export default function TiptapContent({ doc }: { doc: TiptapJSON }) {
  if (!doc.content?.length) return null;

  return (
    <div className="space-y-5">
      {doc.content.map((node, index) => (
        <RenderNode key={index} node={node} />
      ))}
    </div>
  );
}

function RenderNode({ node }: { node: TiptapNode }) {
  switch (node.type) {
    case "paragraph":
      return (
        <p className="text-base leading-relaxed text-body">
          {renderInline(node.content)}
        </p>
      );

    case "heading": {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 2), 1), 4) as
        | 1
        | 2
        | 3
        | 4;
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
      const sizeClass =
        level <= 2
          ? "text-2xl md:text-3xl"
          : level === 3
            ? "text-xl"
            : "text-lg";

      return (
        <Tag className={`pt-4 font-serif ${sizeClass} text-headline`}>
          {renderInline(node.content)}
        </Tag>
      );
    }

    case "bulletList":
      return (
        <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-body">
          {node.content?.map((item, index) => (
            <RenderNode key={index} node={item} />
          ))}
        </ul>
      );

    case "orderedList":
      return (
        <ol className="list-decimal space-y-2 pl-5 text-base leading-relaxed text-body">
          {node.content?.map((item, index) => (
            <RenderNode key={index} node={item} />
          ))}
        </ol>
      );

    case "listItem":
      return (
        <li>
          {node.content?.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote className="border-l-2 border-eyebrow py-1 pl-5 font-serif text-xl italic leading-snug text-headline">
          {node.content?.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </blockquote>
      );

    case "image": {
      const src = node.attrs?.src as string | undefined;
      if (!src) return null;
      return (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-background-alt">
          <Image
            src={src}
            alt={(node.attrs?.alt as string) ?? ""}
            fill
            className="object-cover"
          />
        </div>
      );
    }

    case "codeBlock":
      // StarterKit enables the ``` shortcut, so a code block can appear even
      // though the toolbar doesn't offer one — render it properly rather than
      // letting it fall through as unstyled text.
      return (
        <pre className="overflow-x-auto bg-background-alt p-4 text-sm">
          <code>{renderInline(node.content)}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr className="border-headline/10" />;

    case "hardBreak":
      return <br />;

    default:
      // Fallback: tetap render children kalau tipe node belum di-handle
      // secara eksplisit, supaya konten tidak hilang begitu saja.
      return node.content ? (
        <>
          {node.content.map((child, index) => (
            <RenderNode key={index} node={child} />
          ))}
        </>
      ) : null;
  }
}

function renderInline(nodes?: TiptapNode[]): ReactNode {
  if (!nodes) return null;

  return nodes.map((node, index) => {
    if (node.type === "hardBreak") return <br key={index} />;

    if (node.type !== "text") {
      return <RenderNode key={index} node={node} />;
    }

    let content: ReactNode = node.text;
    for (const mark of node.marks ?? []) {
      switch (mark.type) {
        case "bold":
          content = <strong>{content}</strong>;
          break;
        case "italic":
          content = <em>{content}</em>;
          break;
        case "underline":
          content = <span className="underline">{content}</span>;
          break;
        case "strike":
          content = <span className="line-through">{content}</span>;
          break;
        case "code":
          content = (
            <code className="rounded bg-background-alt px-1.5 py-0.5 text-sm">
              {content}
            </code>
          );
          break;
        case "link": {
          const href = (mark.attrs?.href as string) ?? "#";
          content = (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-headline underline underline-offset-2 hover:opacity-70"
            >
              {content}
            </a>
          );
          break;
        }
        default:
          break;
      }
    }

    return <span key={index}>{content}</span>;
  });
}
