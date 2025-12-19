'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { COUNTRY_CODES } from '@/lib/countryCodes';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    artist_name: string;
    artist_name_eng: string;
    introduction: string;
    photo: string;
    instagram: string;
    twitter: string;
    youtube: string;
    nationality?: string;
  }) => Promise<void>;
  initialData: {
    artist_name: string;
    artist_name_eng?: string;
    introduction?: string;
    photo?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    nationality?: string;
  };
  artistId: string;
}

export function ProfileEditModal({ isOpen, onClose, onSave, initialData, artistId }: ProfileEditModalProps) {
  const [artistName, setArtistName] = useState(initialData.artist_name || '');
  const [artistNameEng, setArtistNameEng] = useState(initialData.artist_name_eng || '');
  const [introduction, setIntroduction] = useState(initialData.introduction || '');
  const [photo, setPhoto] = useState(initialData.photo || '');
  const [instagram, setInstagram] = useState(initialData.instagram || '');
  const [twitter, setTwitter] = useState(initialData.twitter || '');
  const [youtube, setYoutube] = useState(initialData.youtube || '');
  const [nationality, setNationality] = useState((initialData.nationality || '').toUpperCase());
  const [nationalitySearchTerm, setNationalitySearchTerm] = useState('');
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedNationality = nationality
    ? COUNTRY_CODES.find(country => country.code === nationality)
    : undefined;
  const normalizedSearch = nationalitySearchTerm.toLowerCase();
  const filteredNationalities = COUNTRY_CODES.filter(country =>
    country.name.toLowerCase().includes(normalizedSearch) ||
    country.code.toLowerCase().includes(normalizedSearch)
  );

  // Update state when initialData changes
  useEffect(() => {
    setArtistName(initialData.artist_name || '');
    setArtistNameEng(initialData.artist_name_eng || '');
    setIntroduction(initialData.introduction || '');
    setPhoto(initialData.photo || '');
    setInstagram(initialData.instagram || '');
    setTwitter(initialData.twitter || '');
    setYoutube(initialData.youtube || '');
    setNationality((initialData.nationality || '').toUpperCase());
    setNationalitySearchTerm('');
    setIsNationalityDropdownOpen(false);
  }, [initialData]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Authentication error:', authError);
        alert('로그인이 필요합니다.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${artistId}-${Date.now()}.${fileExt}`;
      // RLS policy requires files to be in a folder named after the user's auth.uid()
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        alert('이미지 업로드에 실패했습니다.');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath);

      setPhoto(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!artistName) {
      alert('이름을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        artist_name: artistName,
        artist_name_eng: artistNameEng,
        introduction,
        photo,
        instagram,
        twitter,
        youtube,
        nationality,
      });
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">프로필 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border border-white shadow-2xl">
                {photo ? (
                  <Image
                    src={photo}
                    alt={artistName}
                    width={128}
                    height={128}
                    className="object-cover object-top w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <Upload className="w-12 h-12 text-zinc-400" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 w-32 h-32 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Upload className="w-8 h-8 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="artist-name">이름 *</Label>
            <Input
              id="artist-name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div>
            <Label htmlFor="artist-name-eng">English Name</Label>
            <Input
              id="artist-name-eng"
              value={artistNameEng}
              onChange={(e) => setArtistNameEng(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div>
            <Label htmlFor="nationality">Nationality</Label>
            {nationality ? (
              <div className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-700 rounded-md">
                <Image
                  src={`https://flagsapi.com/${nationality}/flat/32.png`}
                  alt={`${selectedNationality?.name || nationality} flag`}
                  width={32}
                  height={24}
                  className="rounded-sm"
                />
                <span className="flex-1 text-sm sm:text-base">
                  {selectedNationality?.name || nationality}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNationality('')}
                  className="text-red-400 hover:text-red-300"
                >
                  Clear
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  id="nationality"
                  value={nationalitySearchTerm}
                  onChange={(e) => {
                    setNationalitySearchTerm(e.target.value);
                    setIsNationalityDropdownOpen(true);
                  }}
                  onFocus={() => setIsNationalityDropdownOpen(true)}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Search nationality..."
                />
                {isNationalityDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredNationalities.length > 0 ? (
                      filteredNationalities.map((country) => (
                        <div
                          key={country.code}
                          onClick={() => {
                            setNationality(country.code);
                            setNationalitySearchTerm('');
                            setIsNationalityDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-700 cursor-pointer transition-colors"
                        >
                          <Image
                            src={`https://flagsapi.com/${country.code}/flat/24.png`}
                            alt={country.name}
                            width={24}
                            height={18}
                            className="rounded-sm"
                          />
                          <span className="text-white text-sm">{country.name}</span>
                          <span className="text-gray-500 text-xs ml-auto">{country.code}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-400 text-sm">국가를 찾을 수 없습니다</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="introduction">소개</Label>
            <Textarea
              id="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              className="bg-zinc-800 border-zinc-700 min-h-[120px]"
              placeholder="자기소개를 입력하세요..."
            />
          </div>

          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="https://twitter.com/..."
            />
          </div>

          <div>
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 w-full sm:w-auto" disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
