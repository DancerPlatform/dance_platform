'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, StarsIcon, Loader2, User, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from './header';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [authenticationCode, setAuthenticationCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCreateNew = () => {
    router.push('/artist/portfolio-setup/create');
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

  const handleSelectPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setError(null);
    setSuccess(null);
  };

  const handleSubmitClaim = async () => {
    if (!selectedPortfolio) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          artist_id: selectedPortfolio.artist_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim request');
      }

      // Store the authentication code from the response
      setAuthenticationCode(data.claim?.authentication_code || null);
      setSuccess('Claim request submitted successfully!');
      setSearchQuery('');
      setPortfolios([]);
      setHasSearched(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async () => {
    if (!authenticationCode) return;

    try {
      await navigator.clipboard.writeText(authenticationCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
      alert("Copied to clipboard!")
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to dancers<span className='text-green-400'>.</span>bio</h1>
          <p className="text-gray-400 text-lg">
            Choose how you&apos;d like to set up your artist portfolio
          </p>
        </div>

        {/* Success Message with Authentication Code */}
        {success && authenticationCode && (
          <Card className="bg-zinc-900 border-green-500/50 mb-8">
            <CardContent className="pt-6 space-y-4">
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded">
                {success}
              </div>

              <div className="bg-blue-500/10 border-2 border-blue-500/50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-blue-400">Your Authentication Code:</p>
                <div className="bg-black/30 rounded px-4 py-3 flex items-center justify-center gap-3">
                  <p className="text-3xl font-bold text-white tracking-wider font-mono">
                    {authenticationCode}
                  </p>
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 w-10 p-0"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-300">
                  Send us your authentication code through your official artist account on Instagram <span className='text-green-500'>@dancers.bio</span>.
                </p>
                <Link className="bg-green-500 text-white px-3 py-2 rounded-sm" href="https://www.instagram.com/direct/t/17847765594602579/">Send us a message</Link>

              </div>

              <Button
                onClick={() => router.push('/main/profile')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to My Claims
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search Artists Section */}
        {!authenticationCode && (
        <div className="mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Search Artists</h3>
                  <p className="text-sm text-gray-400">Find and view existing artist portfolios</p>
                </div>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
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

              {/* Error Message */}
              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Search Results */}
              {hasSearched && portfolios.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-400">Search Results ({portfolios.length})</h4>
                  {portfolios.map((portfolio) => (
                    <div
                      key={portfolio.artist_id}
                      className="bg-zinc-800 border border-zinc-700 hover:border-white/20 transition-colors rounded-lg p-3"
                    >
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
                            onClick={() => handleSelectPortfolio(portfolio)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Claim
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasSearched && portfolios.length === 0 && !error && (
                <div className="mt-4 text-center text-gray-400 py-4">
                  No portfolios found. Try a different search term.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Claim Submission Form */}
        {selectedPortfolio && !authenticationCode && (
          <Card className="bg-zinc-900 border-zinc-800 mb-8">
            <CardHeader>
              <CardTitle>Submit Claim Request</CardTitle>
              <CardDescription className="text-gray-400">
                Verify your information to claim this portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Selected Portfolio:</p>
                <p className="font-semibold text-white">{selectedPortfolio.artist_name}</p>
                <p className="text-sm text-gray-500">ID: {selectedPortfolio.artist_id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitClaim}
                  disabled={isSubmitting}
                  className="flex-1 bg-white text-black hover:bg-white/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Claim Request'
                  )}
                </Button>
                <Button
                  onClick={() => setSelectedPortfolio(null)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create New Portfolio Card */}
        {!authenticationCode && (
          <>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-white/20 transition-colors py-6">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
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

            <button onClick={signOut} className='text-red-500 w-full mt-10'>
              Sign Out
            </button>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact support at sungeun8877@gmail.com
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
