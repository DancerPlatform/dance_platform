import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ArtistPortfolioClient, type ArtistPortfolio } from '@/components/ArtistPortfolioClient';

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ artist: string }>;
}) {
  const { artist: artistId } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistId}`,
    // {
    //   next: { revalidate: 60 }, // Cache for 60 seconds
    // }
  );

  if (!response.ok) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Artist not found</h1>
          <p className="text-gray-400">Could not load portfolio for artist ID: {artistId}</p>
          <Link href="main" className='bg-white text-black p-3'>
          Back To Home
          </Link>
        </div>
      </div>
    );
  }

  const portfolio: ArtistPortfolio = await response.json();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* <Header /> */}
      <ArtistPortfolioClient portfolio={portfolio} />
      {/* <Footer /> */}
    </div>
  );
}
