'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Twitter, Youtube, Crown } from 'lucide-react';
import { ArtistCard } from './artist-card';
import SocialSection from './portfolio/SocialSection';

interface ArtistInfo {
  artist_id: string;
  name: string;
  email: string;
  phone: string;
  birth: string | null;
}

interface PortfolioInfo {
  artist_name: string;
  artist_name_eng?: string;
  introduction?: string;
  photo?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

interface GroupMember {
  artist_id: string;
  is_leader: boolean;
  joined_date: string | null;
  artist: ArtistInfo;
  portfolio: PortfolioInfo;
}

export interface GroupPortfolio {
  group_id: string;
  group_name: string;
  group_name_eng?: string;
  introduction?: string;
  photo?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  created_at?: string;
  members: GroupMember[];
}

export function GroupPortfolioClient({ group }: { group: GroupPortfolio }) {
  console.log(group.instagram)

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        {group.photo && (
          <>
            <Image
              src={group.photo}
              alt={group.group_name}
              fill
              className="object-cover object-top blur-sm"
              priority
            />
            <div className="absolute bottom-0 inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
          </>
        )}

        {/* Group Info Section */}
        <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col items-center pb-8">
          {group.photo && (
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl mb-4">
              <Image
                src={group.photo}
                alt={group.group_name}
                width={128}
                height={128}
                className="object-cover object-top w-full h-full"
                priority
              />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-2">{group.group_name}</h1>
          {group.group_name_eng && (
            <p className="text-xl text-gray-300">{group.group_name_eng}</p>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* Social Links */}
        {(group.instagram || group.twitter || group.youtube) && (
          <SocialSection 
            instagram={group.instagram}
            twitter={group.twitter}
            youtube={group.youtube}
          />
        )}

        {/* Introduction */}
        {group.introduction && (
          <section>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-center">
              {group.introduction}
            </p>
          </section>
        )}

        {/* Members Section */}
        {group.members && group.members.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-3xl font-bold">Members</h2>
              <p className="text-gray-400 text-sm mt-2">
                {group.members.length} member{group.members.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {group.members.map((member) => (
                <ArtistCard 
                key={member.artist_id}
                artistId={member.artist_id}
                nameEN={`${member.portfolio.artist_name_eng}`}
                nameKR={member.portfolio.artist_name}
                imageUrl={member.portfolio.photo as string}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
