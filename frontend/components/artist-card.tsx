import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { User } from "lucide-react";

interface ArtistCardProps {
  artistId: string;
  nameEN: string | null;
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
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={nameEN || nameKR || 'Artist photo'}
            fill
            quality={75}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            preload
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <User className="w-20 h-20 text-gray-600" />
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        {/* Artist Name */}
        <div className="">
          {nameEN && <p className="text-sm font-medium tracking-wide">{nameEN}</p>}
          <h2 className="text-md md:text-lg font-bold tracking-tight">{nameKR}</h2>
        </div>
      </div>
    </Link>
  );
}
