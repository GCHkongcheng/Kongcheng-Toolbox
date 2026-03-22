import Image from "next/image";
import { ExternalLink, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteLinkItem } from "../../lib/site-links";

interface SiteLinkCardProps {
  link: SiteLinkItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function SiteLinkCard({
  link,
  isFavorite,
  onToggleFavorite,
}: SiteLinkCardProps) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {link.iconUrl ? (
            <Image
              src={link.iconUrl}
              alt={`${link.name} icon`}
              className="h-4 w-4 rounded-sm"
              width={16}
              height={16}
            />
          ) : (
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-muted text-[10px] text-muted-foreground">
              •
            </span>
          )}
          <h3 className="text-xs font-semibold text-card-foreground">
            {link.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(link.id);
          }}
          className={cn(
            "rounded-md p-1 transition-colors",
            isFavorite
              ? "text-amber-500 hover:text-amber-600"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={isFavorite ? "取消收藏" : "收藏网址"}
        >
          <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
        {link.summary}
      </p>

      <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary">
        访问站点
        <ExternalLink
          size={12}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </a>
  );
}
