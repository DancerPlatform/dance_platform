'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Add Choreography Modal
interface AddChoreographyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    song: {
      title: string;
      singer: string;
      youtube_link: string;
      date: string;
    };
    role: string[];
  }) => void;
}

export function AddChoreographyModal({ isOpen, onClose, onAdd }: AddChoreographyModalProps) {
  const [title, setTitle] = useState('');
  const [singer, setSinger] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [date, setDate] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = () => {
    if (!title || !singer || !youtubeLink || !date) {
      alert('모든 필수 필드를 입력해주세요.');
      return;
    }

    onAdd({
      song: {
        title,
        singer,
        youtube_link: youtubeLink,
        date,
      },
      role: role.split(',').map(r => r.trim()).filter(Boolean),
    });

    // Reset form
    setTitle('');
    setSinger('');
    setYoutubeLink('');
    setDate('');
    setRole('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>안무 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="singer">가수 *</Label>
            <Input
              id="singer"
              value={singer}
              onChange={(e) => setSinger(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 아이유"
            />
          </div>
          <div>
            <Label htmlFor="title">곡 제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: Love poem"
            />
          </div>
          <div>
            <Label htmlFor="youtube">YouTube 링크 *</Label>
            <Input
              id="youtube"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div>
            <Label htmlFor="date">날짜 *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="role">역할 (쉼표로 구분)</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 안무가, 퍼포머"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Media Modal
interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    youtube_link: string;
    title: string;
    role?: string;
    video_date?: string;
  }) => void;
}

export function AddMediaModal({ isOpen, onClose, onAdd }: AddMediaModalProps) {
  const [title, setTitle] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [role, setRole] = useState('');
  const [videoDate, setVideoDate] = useState('');

  const handleSubmit = () => {
    if (!youtubeLink || !title) {
      alert('YouTube 링크와 제목을 입력해주세요.');
      return;
    }

    onAdd({
      youtube_link: youtubeLink,
      title,
      role: role || undefined,
      video_date: videoDate || undefined,
    });

    // Reset form
    setTitle('');
    setYoutubeLink('');
    setRole('');
    setVideoDate('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>미디어 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="media-title">제목 *</Label>
            <Input
              id="media-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="영상 제목"
            />
          </div>
          <div>
            <Label htmlFor="media-youtube">YouTube 링크 *</Label>
            <Input
              id="media-youtube"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div>
            <Label htmlFor="media-role">역할</Label>
            <Input
              id="media-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 안무가"
            />
          </div>
          <div>
            <Label htmlFor="media-date">영상 날짜</Label>
            <Input
              id="media-date"
              type="date"
              value={videoDate}
              onChange={(e) => setVideoDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Performance Modal
interface AddPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    performance_title: string;
    date: string;
    category?: string;
  }) => void;
}

export function AddPerformanceModal({ isOpen, onClose, onAdd }: AddPerformanceModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = () => {
    if (!title || !date) {
      alert('제목과 날짜를 입력해주세요.');
      return;
    }

    onAdd({
      performance_title: title,
      date,
      category: category || undefined,
    });

    // Reset form
    setTitle('');
    setDate('');
    setCategory('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>공연 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="perf-title">공연 제목 *</Label>
            <Input
              id="perf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="공연 이름"
            />
          </div>
          <div>
            <Label htmlFor="perf-date">날짜 *</Label>
            <Input
              id="perf-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="perf-category">카테고리</Label>
            <Input
              id="perf-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 참가, 주최"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Directing Modal
interface AddDirectingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    title: string;
    date: string;
  }) => void;
}

export function AddDirectingModal({ isOpen, onClose, onAdd }: AddDirectingModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = () => {
    if (!title || !date) {
      alert('제목과 날짜를 입력해주세요.');
      return;
    }

    onAdd({
      title,
      date,
    });

    // Reset form
    setTitle('');
    setDate('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>연출 작품 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="dir-title">작품 제목 *</Label>
            <Input
              id="dir-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="연출 작품명"
            />
          </div>
          <div>
            <Label htmlFor="dir-date">날짜 *</Label>
            <Input
              id="dir-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Workshop Modal
interface AddWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    class_name: string;
    class_date: string;
    country: string;
    class_role?: string[];
  }) => void;
}

export function AddWorkshopModal({ isOpen, onClose, onAdd }: AddWorkshopModalProps) {
  const [className, setClassName] = useState('');
  const [classDate, setClassDate] = useState('');
  const [country, setCountry] = useState('');
  const [classRole, setClassRole] = useState('');

  const handleSubmit = () => {
    if (!className || !classDate || !country) {
      alert('모든 필수 필드를 입력해주세요.');
      return;
    }

    onAdd({
      class_name: className,
      class_date: classDate,
      country,
      class_role: classRole.split(',').map(r => r.trim()).filter(Boolean),
    });

    // Reset form
    setClassName('');
    setClassDate('');
    setCountry('');
    setClassRole('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>워크샵/클래스 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="class-name">클래스 이름 *</Label>
            <Input
              id="class-name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="워크샵 또는 클래스명"
            />
          </div>
          <div>
            <Label htmlFor="class-date">날짜 *</Label>
            <Input
              id="class-date"
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <Label htmlFor="class-country">국가 *</Label>
            <Input
              id="class-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 한국, USA"
            />
          </div>
          <div>
            <Label htmlFor="class-role">역할 (쉼표로 구분)</Label>
            <Input
              id="class-role"
              value={classRole}
              onChange={(e) => setClassRole(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="예: 강사, 게스트"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Award Modal
interface AddAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    award_title: string;
    issuing_org: string;
    received_date: string;
  }) => void;
}

export function AddAwardModal({ isOpen, onClose, onAdd }: AddAwardModalProps) {
  const [awardTitle, setAwardTitle] = useState('');
  const [issuingOrg, setIssuingOrg] = useState('');
  const [receivedDate, setReceivedDate] = useState('');

  const handleSubmit = () => {
    if (!awardTitle || !issuingOrg || !receivedDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    onAdd({
      award_title: awardTitle,
      issuing_org: issuingOrg,
      received_date: receivedDate,
    });

    // Reset form
    setAwardTitle('');
    setIssuingOrg('');
    setReceivedDate('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>수상 경력 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="award-title">수상명 *</Label>
            <Input
              id="award-title"
              value={awardTitle}
              onChange={(e) => setAwardTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="상 이름"
            />
          </div>
          <div>
            <Label htmlFor="award-org">수여 기관 *</Label>
            <Input
              id="award-org"
              value={issuingOrg}
              onChange={(e) => setIssuingOrg(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="수여한 조직/기관"
            />
          </div>
          <div>
            <Label htmlFor="award-date">수상 날짜 *</Label>
            <Input
              id="award-date"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700">
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
