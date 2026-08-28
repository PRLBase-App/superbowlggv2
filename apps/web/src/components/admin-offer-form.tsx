"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminOfferForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coinPrice, setCoinPrice] = useState("1000");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [promoCode, setPromoCode] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [inventory, setInventory] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMsg(null); setError(null);
    try {
      const res = await fetch("/api/admin/marketplace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), description, coinPrice: Number(coinPrice), categoryId, promoCode: promoCode || undefined, destinationUrl: destinationUrl || undefined, inventory: inventory ? Number(inventory) : undefined }) });
      const body = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Create failed");
      setMsg("Offer created"); setTitle(""); setSlug(""); setDescription(""); setPromoCode(""); setDestinationUrl(""); setInventory(""); router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The network did not respond.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={create} className="card grid gap-3 sm:grid-cols-2">
      <div>
        <label className="label">Title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="label">Slug (optional)</label>
        <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Description</label>
        <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="label">Coin price</label>
        <input className="input" type="number" min={1} value={coinPrice} onChange={(e) => setCoinPrice(e.target.value)} required />
      </div>
      <div>
        <label className="label">Category</label>
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Promo code</label>
        <input className="input" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Real fulfillment code" />
      </div>
      <div>
        <label className="label">Reward URL</label>
        <input className="input" type="url" value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} placeholder="https://partner.example/reward" />
      </div>
      <div>
        <label className="label">Inventory (optional)</label>
        <input className="input" type="number" min={1} value={inventory} onChange={(e) => setInventory(e.target.value)} />
      </div>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button className="btn-primary" type="submit" disabled={busy}>{busy ? "Creating…" : "Create offer"}</button>
        {msg ? <span className="text-sm text-brand-muted">{msg}</span> : null}
        {error ? <span className="text-sm text-brand-danger" role="alert">{error}</span> : null}
      </div>
    </form>
  );
}
