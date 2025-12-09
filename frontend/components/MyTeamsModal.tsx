'use client';

import { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Team {
  team_id: string;
  team_name: string;
  photo: string | null;
  team_introduction: string | null;
  leader_id: string;
  subleader_id: string | null;
  role: 'leader' | 'subleader' | 'member';
}

interface MyTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyTeamsModal({ isOpen, onClose }: MyTeamsModalProps) {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyTeams = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('로그인이 필요합니다.');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/teams/my-teams', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch teams');
        }

        setTeams(data.teams || []);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch teams'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTeams();
  }, [isOpen]);

  const handleTeamClick = (teamId: string) => {
    onClose();
    router.push(`/edit-team/${teamId}`);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'leader':
        return <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">리더</span>;
      case 'subleader':
        return <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">서브리더</span>;
      default:
        return <span className="text-xs bg-zinc-700 text-white px-2 py-1 rounded">멤버</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">나의 팀</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-zinc-400">로딩 중...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !error && teams.length === 0 && (
            <div className="text-center py-12">
              <Users className="size-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg mb-2">소속된 팀이 없습니다</p>
              <p className="text-zinc-500 text-sm">
                그룹 생성하기 버튼을 눌러 새로운 팀을 만들어보세요.
              </p>
            </div>
          )}

          {!isLoading && !error && teams.length > 0 && (
            <div className="space-y-3">
              {teams.map((team) => (
                <button
                  key={team.team_id}
                  onClick={() => handleTeamClick(team.team_id)}
                  className="w-full bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg p-4 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Team Photo */}
                    <div className="w-16 h-16 rounded-lg bg-zinc-700 shrink-0 overflow-hidden flex items-center justify-center">
                      {team.photo ? (
                        <Image
                          src={team.photo}
                          alt={team.team_name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-zinc-500" />
                      )}
                    </div>

                    {/* Team Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium text-lg truncate">
                          {team.team_name}
                        </h3>
                        {getRoleBadge(team.role)}
                      </div>
                      <p className="text-zinc-500 text-sm truncate">
                        {team.team_id}
                      </p>
                      {team.team_introduction && (
                        <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
                          {team.team_introduction}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="text-zinc-500">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
