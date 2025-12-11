import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Users } from "lucide-react";

interface GroupCardProps {
  groupId: string;
  nameEN?: string;
  nameKR: string;
  imageUrl: string | null;
  memberCount: number;
  className?: string;
}

export function GroupCard({
  groupId,
  nameEN,
  nameKR,
  imageUrl,
  memberCount,
  className,
}: GroupCardProps) {
  return (
    <Link
      href={`/group/${groupId}`}
      prefetch
      className={cn(
        "relative w-full aspect-3/4 overflow-hidden rounded-lg bg-gray-950 border-gray-400 group hover:scale-105 transition-transform",
        className
      )}
    >
      {/* Group Image */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={nameKR}
            fill
            quality={75}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Users className="w-20 h-20 text-gray-600" />
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Member Count Badge */}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        {/* Group Name */}
        <div className="">
          {/* {nameEN && <p className="text-md font-medium tracking-wide">{nameEN}</p>} */}
          <h2 className="text-md font-bold tracking-tight">{nameKR}</h2>
        </div>
      </div>
    </Link>
  );
}
