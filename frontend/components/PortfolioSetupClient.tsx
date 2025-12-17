'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

export function PortfolioSetupClient() {
  const router = useRouter();
  const {signOut} = useAuth();

  const handleCreateNew = () => {
    router.push('/artist/portfolio-setup/create');
  };

  const handleClaimExisting = () => {
    router.push('/artist/portfolio-setup/claim');
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32">
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
                Create New Portfolio
              </Button>
            </CardContent>
          </Card>

          {/* Claim Existing Portfolio */}
          <Card className="bg-zinc-900 border-zinc-800 hover:border-white/20 transition-colors cursor-pointer group py-6">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Search className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl text-white">Claim Existing Portfolio</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Take ownership of an existing portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-gray-400">
                <li>• Search for your existing portfolio</li>
                <li>• Verify your identity</li>
                <li>• Gain editing access after approval</li>
              </ul>
              <Button
                onClick={handleClaimExisting}
                variant="outline"
                className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Claim Portfolio
              </Button>
            </CardContent>
          </Card>
        </div>

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
