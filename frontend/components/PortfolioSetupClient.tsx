'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, StarsIcon, Loader2, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from './header';
import Image from 'next/image';

interface Portfolio {
  artist_id: string;
  name: string;
  artist_name: string;
  artist_name_eng?: string;
  photo?: string;
  email: string;
  phone?: string;
}

export function PortfolioSetupClient() {
  const router = useRouter();
  const {signOut} = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateNew = () => {
    router.push('/artist/portfolio-setup/create');
  };

  const handleClaimExisting = () => {
    router.push('/artist/portfolio-setup/claim');
  };

  const handleCreateAI = () => {
    router.push('/artist/portfolio-setup/create/ai');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim().length < 2) {
      setError('Please enter at least 2 characters to search');
      return;
    }

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/artists?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search artists');
      }

      // Transform the artists data to match Portfolio interface
      const transformedPortfolios = (data.artists || []).map((artist: {
        artist_id: string;
        artist_name: string;
        artist_name_eng?: string;
        photo?: string;
      }) => ({
        artist_id: artist.artist_id,
        name: artist.artist_name,
        artist_name: artist.artist_name,
        artist_name_eng: artist.artist_name_eng,
        photo: artist.photo,
        email: '',
        phone: '',
      }));

      setPortfolios(transformedPortfolios);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPortfolios([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewPortfolio = (artistId: string) => {
    router.push(`/${artistId}`);
  };

  const handleClaimPortfolio = (artistId: string) => {
    router.push(`/artist/portfolio-setup/claim?artist_id=${artistId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to dancers<span className='text-green-400'>.</span>bio</h1>
          <p className="text-gray-400 text-lg">
            Choose how you&apos;d like to set up your artist portfolio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create New Portfolio */}
          <Card className="bg-zinc-900 border-zinc-800 hover:border-white/20 transition-colors cursor-pointer group py-6">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <PlusCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl text-white">Create New Portfolio</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Start fresh with a brand new artist portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-gray-400">
                <li>• Choose your unique artist ID</li>
                <li>• Build your portfolio from scratch</li>
                <li>• Full control from day one</li>
              </ul>
              <Button
                onClick={handleCreateNew}
                className="w-full bg-white text-black hover:bg-white/90"
              >
                Create from Scratch
              </Button>
              <Button
                onClick={handleCreateAI}
                className="w-full text-white font-bold hover:bg-white/90 mt-2 from-purple-800 to-blue-800 bg-linear-to-tr"
              >
                Create with AI
                <span><StarsIcon /></span>
              </Button>
            </CardContent>
          </Card>

          {/* Search Artists */}
          <Card className="bg-zinc-900 border-zinc-800 hover:border-white/20 transition-colors py-6">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl text-white">Search Artists</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Find and view existing artist portfolios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="Search by artist ID or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
                <Button
                  type="submit"
                  disabled={isSearching || searchQuery.trim().length < 2}
                  className="bg-white text-black hover:bg-white/90 whitespace-nowrap"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </form>

              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">or</p>
              </div>

              <Button
                onClick={handleClaimExisting}
                variant="outline"
                className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Claim Unclaimed Portfolio
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Search Results */}
        {hasSearched && portfolios.length > 0 && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-semibold">Search Results ({portfolios.length})</h2>
            {portfolios.map((portfolio) => (
              <Card
                key={portfolio.artist_id}
                className="bg-zinc-900 border-zinc-800 hover:border-white/20 transition-colors"
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Photo */}
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
                      {portfolio.photo ? (
                        <Image
                          src={portfolio.photo}
                          alt={portfolio.artist_name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-500" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{portfolio.artist_name}</h3>
                      {portfolio.artist_name_eng && (
                        <p className="text-sm text-gray-400">{portfolio.artist_name_eng}</p>
                      )}
                      <p className="text-sm text-green-500">@{portfolio.artist_id}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewPortfolio(portfolio.artist_id)}
                        variant="outline"
                        className="bg-transparent border-white/20 text-white hover:bg-white/10"
                      >
                        View
                      </Button>
                      <Button
                        onClick={() => handleClaimPortfolio(portfolio.artist_id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Claim
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {hasSearched && portfolios.length === 0 && !error && (
          <div className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-8 text-center text-gray-400">
                No portfolios found. Try a different search term.
              </CardContent>
            </Card>
          </div>
        )}

        <button onClick={signOut} className='text-red-500 w-full mt-10'>
          Sign Out
        </button>


        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support at sungeun8877@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
