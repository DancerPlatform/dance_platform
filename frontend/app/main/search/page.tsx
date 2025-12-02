'use client'
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";



export default function SearchPage() {
  const [searchWord, setSearchWord] = useState('');



  return (
    <div>
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 py-4 px-4 border-b border-white/20">
          <Link href="/main">
            <ArrowLeft className="size-8"/>
          </Link>
          <Input
            placeholder="Search artists..."
            className="w-full h-14 bg-zinc-800 border-none rounded-xl px-4 text-white placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button>
            <Search className="size-8" />
          </button>
        </div>
      </div>


    </div>
  )
}