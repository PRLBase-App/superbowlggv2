"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Plus, Save, Trash2 } from "lucide-react";
import { ArticleContent } from "@/components/article-content";
import { articleReadingMinutes, articleWordCount, slugify } from "@/lib/article-utils";

export interface ArticleEditorValue {
  id?: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  heroImageUrl: string;
  heroImageAlt: string;
  seoTitle: string;
  seoDescription: string;
  sourceLinks: { title: string; url: string }[];
}

const blankSource = () => ({ title: "", url: "" });

export function ArticleEditor({ initialValue, authors }: { initialValue: ArticleEditorValue; authors: { id: string; name: string }[] }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [tags, setTags] = useState(initialValue.tags.join(", "));
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValue.id));
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const words = useMemo(() => articleWordCount(value.body), [value.body]);

  const set = <K extends keyof ArticleEditorValue>(field: K, next: ArticleEditorValue[K]) => setValue((current) => ({ ...current, [field]: next }));

  function updateTitle(title: string) {
    setValue((current) => ({ ...current, title, slug: slugTouched ? current.slug : slugify(title) }));
  }

  function updateSource(index: number, field: "title" | "url", next: string) {
    setValue((current) => ({ ...current, sourceLinks: current.sourceLinks.map((source, sourceIndex) => sourceIndex === index ? { ...source, [field]: next } : source) }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const payload = {
      ...value,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      sourceLinks: value.sourceLinks.filter((source) => source.title.trim() || source.url.trim()),
    };
    const response = await fetch(value.id ? `/api/admin/articles/${value.id}` : "/api/admin/articles", {
      method: value.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setMessage({ tone: "error", text: result.error ?? "The article could not be saved." });
      return;
    }
    setMessage({ tone: "success", text: value.status === "PUBLISHED" ? "Article published." : "Article saved." });
    if (!value.id && result.id) {
      router.replace(`/admin/articles/${result.id}`);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="sticky top-24 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border bg-white/95 p-3 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted"><span>{words.toLocaleString()} words</span><span aria-hidden>·</span><span>{articleReadingMinutes(value.body)} min read</span><span aria-hidden>·</span><span>{value.status.toLowerCase()}</span></div>
        <div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary" onClick={() => setPreview((open) => !open)}><Eye className="h-4 w-4" /> {preview ? "Edit" : "Preview"}</button><button type="submit" className="btn-primary" disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving…" : value.status === "PUBLISHED" ? "Save & publish" : "Save article"}</button></div>
      </div>

      {message ? <p role="status" className={`rounded-xl border px-4 py-3 text-sm font-medium ${message.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{message.text}</p> : null}

      {preview ? (
        <div className="rounded-[24px] border border-brand-border bg-white px-5 py-8 shadow-sm sm:px-10"><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">Preview</p><h1 className="mt-3 font-display text-4xl font-bold text-brand-text">{value.title || "Untitled article"}</h1><p className="mt-3 border-b border-brand-border pb-6 text-brand-muted">{value.excerpt}</p><div className="mt-7"><ArticleContent body={value.body || "Start writing to preview the article."} /></div></div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <section className="card space-y-4">
              <div><label htmlFor="article-title" className="label">Title</label><input id="article-title" className="input text-base font-semibold" value={value.title} onChange={(event) => updateTitle(event.target.value)} minLength={10} maxLength={140} required /></div>
              <div><label htmlFor="article-slug" className="label">URL slug</label><div className="flex items-center rounded-xl border border-brand-border bg-brand-surface focus-within:border-brand-primary/70 focus-within:ring-2 focus-within:ring-brand-primary/20"><span className="pl-3 text-sm text-brand-muted">/blog/</span><input id="article-slug" className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm outline-none" value={value.slug} onChange={(event) => { setSlugTouched(true); set("slug", slugify(event.target.value)); }} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></div></div>
              <div><label htmlFor="article-excerpt" className="label">Excerpt <span className="normal-case tracking-normal">({value.excerpt.length}/320)</span></label><textarea id="article-excerpt" className="input min-h-28 resize-y" value={value.excerpt} onChange={(event) => set("excerpt", event.target.value)} minLength={40} maxLength={320} required /></div>
            </section>

            <section className="card"><div className="flex items-end justify-between gap-3"><div><label htmlFor="article-body" className="label">Article body (Markdown)</label><p className="text-xs text-brand-muted">Use ## for major sections. Raw HTML is intentionally disabled.</p></div><span className={`text-xs font-semibold ${words >= 600 ? "text-brand-success" : "text-brand-warning"}`}>{words} words</span></div><textarea id="article-body" className="input mt-3 min-h-[720px] resize-y font-mono text-[13px] leading-6" value={value.body} onChange={(event) => set("body", event.target.value)} minLength={400} required /></section>

            <section className="card space-y-4">
              <div><p className="label">Sources</p><p className="text-xs leading-5 text-brand-muted">Published articles require at least one identifiable HTTP(S) source. Use official or primary sources whenever possible.</p></div>
              {value.sourceLinks.map((source, index) => <div key={index} className="grid gap-2 rounded-xl border border-brand-border bg-brand-surface2 p-3 sm:grid-cols-[1fr_1.3fr_auto]"><div><label className="label" htmlFor={`source-title-${index}`}>Source title</label><input id={`source-title-${index}`} className="input" value={source.title} onChange={(event) => updateSource(index, "title", event.target.value)} /></div><div><label className="label" htmlFor={`source-url-${index}`}>HTTP(S) URL</label><input id={`source-url-${index}`} type="url" className="input" value={source.url} onChange={(event) => updateSource(index, "url", event.target.value)} /></div><button type="button" className="btn-ghost self-end !px-3 text-brand-danger" onClick={() => set("sourceLinks", value.sourceLinks.filter((_, sourceIndex) => sourceIndex !== index))} aria-label={`Remove source ${index + 1}`}><Trash2 className="h-4 w-4" /></button></div>)}
              <button type="button" className="btn-secondary" onClick={() => set("sourceLinks", [...value.sourceLinks, blankSource()])}><Plus className="h-4 w-4" /> Add source</button>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="card space-y-4">
              <div><label htmlFor="article-status" className="label">Publishing status</label><select id="article-status" className="input" value={value.status} onChange={(event) => set("status", event.target.value as ArticleEditorValue["status"])}><option value="DRAFT">Draft — private</option><option value="PUBLISHED">Published — public</option><option value="ARCHIVED">Archived — private</option></select></div>
              <label className="flex items-center gap-3 rounded-xl border border-brand-border p-3 text-sm font-medium text-brand-text"><input type="checkbox" checked={value.featured} onChange={(event) => set("featured", event.target.checked)} className="h-4 w-4 accent-brand-primary" /> Feature this article</label>
              <div><label htmlFor="article-author" className="label">Byline</label><select id="article-author" className="input" value={value.authorId} onChange={(event) => set("authorId", event.target.value)} required>{authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}</select></div>
              <div><label htmlFor="article-category" className="label">Category</label><input id="article-category" className="input" list="article-categories" value={value.category} onChange={(event) => set("category", event.target.value)} required /><datalist id="article-categories"><option value="Season Guide" /><option value="Matchup Guide" /><option value="Stats Lab" /><option value="Playoffs" /><option value="Injuries" /><option value="Odds Education" /><option value="Super Bowl History" /></datalist></div>
              <div><label htmlFor="article-tags" className="label">Tags (comma separated)</label><input id="article-tags" className="input" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="NFL schedule, 2026 season" /></div>
            </section>

            <section className="card space-y-4"><div><p className="label">Search appearance</p><p className="text-xs text-brand-muted">Optional overrides. The title and excerpt are used when blank.</p></div><div><label htmlFor="article-seo-title" className="label">SEO title <span className="normal-case tracking-normal">({value.seoTitle.length}/70)</span></label><input id="article-seo-title" className="input" value={value.seoTitle} onChange={(event) => set("seoTitle", event.target.value)} maxLength={70} /></div><div><label htmlFor="article-seo-description" className="label">SEO description <span className="normal-case tracking-normal">({value.seoDescription.length}/170)</span></label><textarea id="article-seo-description" className="input min-h-24 resize-y" value={value.seoDescription} onChange={(event) => set("seoDescription", event.target.value)} maxLength={170} /></div></section>

            <section className="card space-y-4"><div><p className="label">Optional hero image</p><p className="text-xs text-brand-muted">Use only an image you are allowed to publish. The current launch articles use branded layouts instead.</p></div><div><label htmlFor="article-image" className="label">HTTP(S) image URL</label><input id="article-image" type="url" className="input" value={value.heroImageUrl} onChange={(event) => set("heroImageUrl", event.target.value)} /></div><div><label htmlFor="article-image-alt" className="label">Image alternative text</label><input id="article-image-alt" className="input" value={value.heroImageAlt} onChange={(event) => set("heroImageAlt", event.target.value)} maxLength={180} /></div></section>
          </aside>
        </div>
      )}
    </form>
  );
}
