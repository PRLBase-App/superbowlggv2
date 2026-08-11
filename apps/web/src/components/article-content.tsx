import Link from "next/link";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/lib/articles";

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return nodeText((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

export function ArticleContent({ body }: { body: string }) {
  const usedHeadings = new Map<string, number>();
  const headingId = (children: ReactNode) => {
    const base = slugify(nodeText(children)) || "section";
    const count = usedHeadings.get(base) ?? 0;
    usedHeadings.set(base, count + 1);
    return count ? `${base}-${count + 1}` : base;
  };

  return (
    <div className="article-copy">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
          h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
          a: ({ href = "", children }) => href.startsWith("/")
            ? <Link href={href}>{children}</Link>
            : <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
          table: ({ children }) => <div className="article-table-wrap"><table>{children}</table></div>,
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
