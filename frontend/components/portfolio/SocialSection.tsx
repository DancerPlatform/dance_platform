
import { Instagram, Twitter, X, Youtube } from "lucide-react";

interface SocialSectionProps {
  instagram?: string | null;
  twitter?: string | null;
  youtube?: string | null;
}

export default function SocialSection({instagram, twitter, youtube}: SocialSectionProps) {
  return (
    <section>
      <div className="flex gap-3">
        {instagram && (
          <a
            href={`https://www.instagram.com/${instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Instagram className="w-5 h-5" />
          </a>
        )}
        {twitter && (
          <a
            href={`${twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>
        )}
        {youtube && (
          <a
            href={`${youtube}`}
            target="_blank"
            rel="noopener noreferrer"
            className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Youtube className="w-5 h-5" />
          </a>
        )}
      </div>
    </section>
  )
}