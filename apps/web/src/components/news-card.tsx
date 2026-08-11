import Image from "next/image";
import { ArrowUpRight, Clock3 } from "lucide-react";

type NewsCardItem = {
  title: string;
  excerpt: string | null;
  author: string | null;
  url: string;
  source: string;
  sourceImageUrl: string | null;
  publishedAt: Date;
  team: { name: string; abbreviation: string; logoUrl: string | null; primaryColor: string | null } | null;
};

export function NewsCard({ item, featured = false }: { item: NewsCardItem; featured?: boolean }) {
  const imageUrl = item.team?.logoUrl ?? item.sourceImageUrl;
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={`card card-hover group grid overflow-hidden !p-0 ${featured ? "md:grid-cols-[1.05fr_1fr]" : "grid-cols-[112px_1fr]"}`}>
      <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#eef4fb] to-[#e4edf8] ${featured ? "min-h-56" : "min-h-32"}`} style={item.team?.primaryColor ? { backgroundImage: `linear-gradient(145deg, ${item.team.primaryColor}22, #ffffff)` } : undefined}>
        {imageUrl ? <Image src={imageUrl} alt={item.team ? `${item.team.name} logo` : `${item.source} news source`} width={featured ? 210 : 82} height={featured ? 210 : 82} className={`${item.team ? "object-contain p-5" : "object-contain p-7"} h-full w-full transition duration-300 group-hover:scale-105`} /> : <span className="font-display text-2xl text-brand-primary">NFL</span>}
      </div>
      <div className={featured ? "p-6" : "p-4"}>
        <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-primary">
          <span>{item.source}{item.team ? ` · ${item.team.abbreviation}` : ""}</span>
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <h3 className={`mt-2 font-display font-semibold normal-case leading-tight text-brand-text ${featured ? "text-2xl" : "line-clamp-2 text-base"}`}>{item.title}</h3>
        {item.excerpt ? <p className={`mt-2 text-sm leading-6 text-brand-muted ${featured ? "line-clamp-4" : "line-clamp-2"}`}>{item.excerpt}</p> : null}
        <p className="mt-3 flex items-center gap-1.5 text-xs text-brand-muted"><Clock3 className="h-3.5 w-3.5" /> {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(item.publishedAt)} ET</p>
      </div>
    </a>
  );
}
