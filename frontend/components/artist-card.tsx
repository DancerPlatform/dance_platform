import Image from "next/image";
import { cn } from "@/lib/utils";

interface ArtistCardProps {
  nameEN: string;
  nameKR: string;
  genre: string;
  imageUrl: string;
  className?: string;
}

export function ArtistCard({
  nameEN,
  nameKR,
  genre,
  imageUrl,
  className,
}: ArtistCardProps) {
  return (
    <div
      className={cn(
        "relative w-full aspect-[3/4] overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-blue-700 via-purple-700 to-purple-900",
        className
      )}
    >
      {/* Artist Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={nameEN}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        {/* Artist Name */}
        <div className="">
          <p className="text-md font-medium tracking-wide">{nameEN}</p>
          <h2 className="text-2xl font-bold tracking-tight">{nameKR}</h2>
        </div>
      </div>
    </div>
  );
}
