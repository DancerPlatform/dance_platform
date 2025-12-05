'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface User {
  auth_id: string;
  email: string;
  user_type: string;
}

interface Permission {
  auth_id: string;
  artist_id: string;
  email: string;
  user_type: string;
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistId: string;
}

export function PermissionsModal({ isOpen, onClose, artistId }: PermissionsModalProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user and existing permissions when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCurrentUser();
      fetchPermissions();
    }
  }, [isOpen, artistId]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      const response = await fetch(`/api/permissions?artist_id=${artistId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      console.log(response)
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions || []);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?email=${encodeURIComponent(searchEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      alert('사용자 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPermission = async (user: User) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          auth_id: user.auth_id,
          artist_id: artistId,
        }),
      });

      if (response.ok) {
        alert('권한이 추가되었습니다.');
        fetchPermissions();
        setSearchEmail('');
        setSearchResults([]);
      } else {
        const data = await response.json();
        alert(data.error || '권한 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error adding permission:', error);
      alert('권한 추가 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePermission = async (authId: string) => {
    if (!confirm('정말 이 권한을 제거하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(
        `/api/permissions?auth_id=${authId}&artist_id=${artistId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        alert('권한이 제거되었습니다.');
        fetchPermissions();
      } else {
        const data = await response.json();
        alert(data.error || '권한 제거에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error removing permission:', error);
      alert('권한 제거 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-2xl">
        <DialogHeader>
          <DialogTitle>포트폴리오 편집 권한 관리</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search Section */}
          <div>
            <Label htmlFor="search-email">이메일로 사용자 검색</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="search-email"
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-zinc-800 border-zinc-700"
                placeholder="user@example.com"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchEmail.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-zinc-400">검색 결과:</p>
                {searchResults.map((user) => {
                  const hasPermission = permissions.some(
                    (p) => p.auth_id === user.auth_id
                  );

                  return (
                    <div
                      key={user.auth_id}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-zinc-400">{user.user_type}</p>
                      </div>
                      {hasPermission ? (
                        <span className="text-xs text-green-500">이미 권한 있음</span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAddPermission(user)}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          추가
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Current Permissions List */}
          <div>
            <Label>현재 편집 권한이 있는 사용자</Label>
            <div className="mt-3 space-y-2">
              {permissions.filter(p => p.auth_id !== currentUserId).length === 0 ? (
                <p className="text-sm text-zinc-400 py-4 text-center">
                  아직 추가된 사용자가 없습니다.
                </p>
              ) : (
                permissions
                  .filter(permission => permission.auth_id !== currentUserId)
                  .map((permission) => (
                    <div
                      key={permission.auth_id}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {permission.email}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {permission.user_type}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemovePermission(permission.auth_id)}
                        disabled={isLoading}
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))
              )}
            </div>
          </div>
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
