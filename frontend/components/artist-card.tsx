import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ArtistCardProps {
  artistId: string;
  nameEN: string;
  nameKR: string;
  imageUrl: string | null;
  className?: string;
}

export function ArtistCard({
  artistId,
  nameEN,
  nameKR,
  imageUrl,
  className,
}: ArtistCardProps) {
  return (
    <Link
      href={`/${artistId}`}
      prefetch
      className={cn(
        "relative w-full aspect-3/4 overflow-hidden rounded-lg bg-gray-950 border-gray-400 hover:scale-105 transition-transform",
        className
      )}
    >
      {/* Artist Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl ? imageUrl : ""}
          alt={nameEN}
          fill
          quality={75}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          preload
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        {/* Artist Name */}
        <div className="">
          <p className="text-md font-medium tracking-wide">{nameEN}</p>
          <h2 className="text-2xl font-bold tracking-tight">{nameKR}</h2>
        </div>
      </div>
    </Link>
  );
}
