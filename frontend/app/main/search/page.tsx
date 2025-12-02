'use client'
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";



export default function SearchPage() {
  const [searchWord, setSearchWord] = useState('');
  const [activeTab, setActiveTab] = useState('dancer');

  return (
    <div>
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 py-4 px-4 border-white/20">
          <Link href="/main">
            <ArrowLeft className="size-6"/>
          </Link>
          <Input
            placeholder="키워드를 입력하세요"
            className="w-full h-10 bg-zinc-800 border-none rounded-sm px-4 text-white placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button>
            <Search className="size-6" />
          </button>
        </div>
      </div>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-2">
        <TabsList className="w-full grid grid-cols-3 bg-zinc-900 border-white/20 rounded-sm p-1">
          <TabsTrigger
            value="dancer"
            onClick={() => {console.log(activeTab)}}
            className="data-[state=active]:bg-white/20 rounded-sm"
          >
            댄서
          </TabsTrigger>
          <TabsTrigger
            value="crew"
            className="data-[state=active]:bg-white/20 rounded-sm"
          >
            크루
          </TabsTrigger>
          <TabsTrigger
            value="career"
            className="data-[state=active]:bg-white/20 rounded-sm"
          >
            경력
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dancer" className="p-4">
          <p className="text-zinc-400 text-center py-8">댄서 검색 결과가 여기에 표시됩니다</p>
        </TabsContent>

        <TabsContent value="crew" className="p-4">
          <p className="text-zinc-400 text-center py-8">크루 검색 결과가 여기에 표시됩니다</p>
        </TabsContent>

        <TabsContent value="career" className="p-4">
          <p className="text-zinc-400 text-center py-8">경력 검색 결과가 여기에 표시됩니다</p>
        </TabsContent>
      </Tabs>

    </div>
  )
}