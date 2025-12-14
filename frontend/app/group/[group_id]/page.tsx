import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { GroupPortfolioClient, type GroupPortfolio } from '@/components/GroupPortfolioClient';

export default async function GroupPage({
  params,
}: {
  params: Promise<{ group_id: string }>;
}) {
  const { group_id } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/groups/${group_id}`,
    {
      next: { revalidate: 60 }, // Cache for 60 seconds
    }
  );

  if (!response.ok) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Group not found</h1>
          <p className="text-gray-400">Could not load group with ID: {group_id}</p>
          <Link href="/main" className='bg-white text-black p-3 rounded-lg inline-block mt-4'>
            Back To Home
          </Link>
        </div>
      </div>
    );
  }

  const group: GroupPortfolio = await response.json();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <GroupPortfolioClient group={group} />
      {/* <Footer /> */}
    </div>
  );
}
