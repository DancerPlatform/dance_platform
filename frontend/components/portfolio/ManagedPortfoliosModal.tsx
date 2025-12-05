'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ManagedPortfolio {
  artist_id: string;
  name: string;
  portfolio_photo: string | null;
}

interface ManagedPortfoliosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManagedPortfoliosModal({ isOpen, onClose }: ManagedPortfoliosModalProps) {
  const [portfolios, setPortfolios] = useState<ManagedPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch managed portfolios when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchManagedPortfolios();
    }
  }, [isOpen]);

  const fetchManagedPortfolios = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      const response = await fetch('/api/permissions/managed', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolios(data.portfolios || []);
      }
    } catch (error) {
      console.error('Error fetching managed portfolios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortfolioClick = (artistId: string) => {
    onClose();
    router.push(`/edit-portfolio/${artistId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-2xl">
        <DialogHeader>
          <DialogTitle>관리중인 포트폴리오</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin text-zinc-400" />
            </div>
          ) : portfolios.length === 0 ? (
            <p className="text-sm text-zinc-400 py-8 text-center">
              관리중인 포트폴리오가 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio.artist_id}
                  onClick={() => handlePortfolioClick(portfolio.artist_id)}
                  className="w-full flex items-center gap-4 p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-left"
                >
                  <div className="size-12 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {portfolio.portfolio_photo ? (
                      <Image
                        src={portfolio.portfolio_photo}
                        alt={portfolio.name}
                        width={48}
                        height={48}
                        className="size-full object-cover object-top"
                      />
                    ) : (
                      <User className="size-6 text-zinc-400" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{portfolio.name}</p>
                    <p className="text-sm text-zinc-400">포트폴리오 수정하기</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
