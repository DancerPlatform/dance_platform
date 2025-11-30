'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('bg-black border-t border-white/10 text-white', className)}>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        



        {/* Company Info Section */}
        <div className="space-y-1 mb-8 text-xs">
          <h3 className="font-semibold">(주)디츠리퍼블릭</h3>
          <div className="flex flex-col gap-1 text-gray-300">
            <div>
              <span className="text-gray-400">대표자:</span> [대표자명]
            </div>
            <div>
              <span className="text-gray-400">사업자등록번호:</span> [000-00-00000]
            </div>
            <div>
              <span className="text-gray-400">통신판매업 신고번호:</span> [제0000-서울강남-00000호]
            </div>
            <div>
              <span className="text-gray-400">사업장 소재지:</span> [주소]
            </div>
            <div>
              <span className="text-gray-400">대표전화:</span> [000-0000-0000]
            </div>
            <div>
              <span className="text-gray-400">이메일:</span> [contact@example.com]
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap gap-4 text-sm mb-8">
          <Link
            href="/terms"
            className="text-gray-300 hover:text-white transition-colors"
          >
            이용약관
          </Link>
          <Link
            href="/privacy"
            className="font-semibold text-white hover:text-gray-300 transition-colors"
          >
            개인정보처리방침
          </Link>
          {/* <Link
            href="/refund"
            className="text-gray-300 hover:text-white transition-colors"
          >
            환불정책
          </Link> */}
          {/* <Link
            href="/business-info"
            className="text-gray-300 hover:text-white transition-colors"
          >
            사업자정보확인
          </Link> */}
        </div>

        {/* Personal Information Manager */}
        {/* <div className="mb-8">
          <div className="text-sm text-gray-300">
            <span className="text-gray-400">개인정보보호책임자:</span> [책임자명] ([email@example.com])
          </div>
        </div> */}

        

        {/* Customer Service */}
        {/* <div className="mb-8">
          <h4 className="text-sm font-semibold mb-2">고객센터</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <div>운영시간: [평일 09:00 - 18:00]</div>
            <div>점심시간: [12:00 - 13:00]</div>
            <div>주말 및 공휴일 휴무</div>
          </div>
        </div> */}

        {/* Copyright & Disclaimer */}
        <div className="border-t border-white/10 pt-6 space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            ㈜[회사명]는 통신판매중개자로서 통신판매의 당사자가 아니며,
            아티스트가 등록한 상품정보 및 거래에 대해 책임을 지지 않습니다.
          </p>
          <p className="text-xs text-gray-400">
            Copyright © {new Date().getFullYear()} [Company Name]. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
