'use client';

import { useState } from 'react';
import { X, Upload, Instagram, Twitter, Youtube } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  const router = useRouter();
  const { artistUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    team_id: '',
    team_name: '',
    team_introduction: '',
    photo: '',
    instagram: '',
    twitter: '',
    youtube: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      photo: url,
    }));
    setPhotoPreview(url);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Authentication error:', authError);
        setError('로그인이 필요합니다.');
        setIsUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `team-${formData.team_id || Date.now()}-${Date.now()}.${fileExt}`;
      // RLS policy requires files to be in a folder named after the user's auth.uid()
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setError('이미지 업로드에 실패했습니다.');
        setIsUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        photo: publicUrl,
      }));
      setPhotoPreview(publicUrl);
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('이미지 업로드 중 오류가 발생했습니다.');
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.team_id || !formData.team_name) {
      setError('팀 ID와 팀 이름은 필수입니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('로그인이 필요합니다.');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team');
      }

      // Close modal and redirect to edit-team page
      onClose();
      router.push(`/edit-team/${formData.team_id}`);
    } catch (err) {
      console.error('Error creating team:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create team'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isUploading) {
      setFormData({
        team_id: '',
        team_name: '',
        team_introduction: '',
        photo: '',
        instagram: '',
        twitter: '',
        youtube: '',
      });
      setPhotoPreview(null);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">그룹 생성</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting || isUploading}
            className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Team ID */}
          <div>
            <label className="block text-white font-medium mb-2">
              팀 ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="team_id"
              value={formData.team_id}
              onChange={handleInputChange}
              placeholder="예: team_abc123 (영문, 숫자, 언더스코어만 사용)"
              required
              disabled={isSubmitting || isUploading}
              className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <p className="text-zinc-500 text-sm mt-1">
              팀의 고유 식별자입니다. 변경할 수 없으니 신중하게 입력하세요.
            </p>
          </div>

          {/* Team Name */}
          <div>
            <label className="block text-white font-medium mb-2">
              팀 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="team_name"
              value={formData.team_name}
              onChange={handleInputChange}
              placeholder="팀 이름을 입력하세요"
              required
              disabled={isSubmitting || isUploading}
              className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Team Introduction */}
          <div>
            <label className="block text-white font-medium mb-2">
              팀 소개
            </label>
            <textarea
              name="team_introduction"
              value={formData.team_introduction}
              onChange={handleInputChange}
              placeholder="팀에 대한 간단한 소개를 입력하세요"
              rows={4}
              disabled={isSubmitting || isUploading}
              className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-white font-medium mb-2">
              팀 사진
            </label>
            <div className="flex items-start gap-4">
              {photoPreview ? (
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                  <Image
                    src={photoPreview}
                    alt="Team photo preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    onError={() => setPhotoPreview(null)}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg bg-zinc-800 shrink-0 flex items-center justify-center">
                  <Upload className="w-12 h-12 text-zinc-600" />
                </div>
              )}
              <div className="flex-1 space-y-3">
                {/* File Upload Button */}
                <div>
                  <input
                    type="file"
                    id="team-photo-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isSubmitting || isUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="team-photo-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium cursor-pointer transition-colors ${
                      isSubmitting || isUploading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-blue-600'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? '업로드 중...' : '이미지 업로드'}
                  </label>
                  <p className="text-zinc-500 text-sm mt-2">
                    파일을 선택하여 업로드하세요. (JPG, PNG, GIF 등)
                  </p>
                </div>

                {/* Or URL Input */}
                <div>
                  <p className="text-zinc-400 text-sm mb-2">또는 이미지 URL 입력:</p>
                  <input
                    type="url"
                    name="photo"
                    value={formData.photo}
                    onChange={handlePhotoUrlChange}
                    placeholder="https://example.com/image.jpg"
                    disabled={isSubmitting || isUploading}
                    className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">소셜 미디어</h3>

            {/* Instagram */}
            <div>
              <label className="flex items-center text-zinc-400 mb-2 gap-2">
                <Instagram className="size-4" />
                <span>Instagram</span>
              </label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/..."
                disabled={isSubmitting || isUploading}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Twitter */}
            <div>
              <label className="flex items-center text-zinc-400 mb-2 gap-2">
                <Twitter className="size-4" />
                <span>Twitter</span>
              </label>
              <input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/..."
                disabled={isSubmitting || isUploading}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="flex items-center text-zinc-400 mb-2 gap-2">
                <Youtube className="size-4" />
                <span>YouTube</span>
              </label>
              <input
                type="url"
                name="youtube"
                value={formData.youtube}
                onChange={handleInputChange}
                placeholder="https://youtube.com/..."
                disabled={isSubmitting || isUploading}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Leader Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              <span className="font-medium">리더:</span> {artistUser?.name} ({artistUser?.artist_id})
            </p>
            <p className="text-zinc-500 text-xs mt-1">
              그룹 생성 시 자동으로 리더로 설정됩니다.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || isUploading}
              className="flex-1 bg-zinc-800 text-white py-3 rounded-lg font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '생성 중...' : isUploading ? '업로드 중...' : '그룹 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
