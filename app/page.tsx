"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Search, Globe, BookText, Video,
  Zap, ShoppingBag, MapPin,
  Newspaper, GraduationCap, Lightbulb
} from "lucide-react";
import { SearchSource } from "@/types/search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Meteors } from "@/components/ui/meteors";
import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Home() {
  const router = useRouter();
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchSource | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [useDeepSearch, setUseDeepSearch] = useState(false);
  

  useEffect(() => {
    const savedSettings = localStorage.getItem("rSearch_settings");
    if (!savedSettings) {
      const defaultSettings = {
        aiProvider: "deepseek",
        searchProvider: "serper",
        autoExpandSections: true
      };
      localStorage.setItem("rSearch_settings", JSON.stringify(defaultSettings));
    }

    const deepToggle = localStorage.getItem("deepSearchToggle");
    if (deepToggle !== null) {
      setUseDeepSearch(JSON.parse(deepToggle));
    } else {
      setUseDeepSearch(false);
    }
  }, []);

  const searchModes = [
    { id: 'search' as SearchSource, icon: Globe, label: 'Web', description: 'Search across the entire internet' },
    { id: 'images' as SearchSource, icon: BookText, label: 'Images', description: 'Find images and visual content' },
    { id: 'videos' as SearchSource, icon: Video, label: 'Videos', description: 'Discover and watch videos' },
    { id: 'news' as SearchSource, icon: Newspaper, label: 'News', description: 'Latest news and updates' },
    { id: 'places' as SearchSource, icon: MapPin, label: 'Places', description: 'Find locations and businesses' },
    { id: 'shopping' as SearchSource, icon: ShoppingBag, label: 'Shopping', description: 'Search for products and deals' },
    { id: 'scholar' as SearchSource, icon: GraduationCap, label: 'Scholar', description: 'Search academic papers and research' },
    { id: 'patents' as SearchSource, icon: Lightbulb, label: 'Patents', description: 'Search patent databases' }
  ];

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    const encodedQuery = encodeURIComponent(searchTerm);
    if (useDeepSearch) {
      router.push(`/deep-research?q=${encodedQuery}`);
    } else {
      router.push(`/rsearch/?q=${encodedQuery}&mode=${searchMode || 'web'}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Logo className="transform hover:scale-105 transition-transform duration-300" />
          <p className="text-orange-600 text-[12px] sm:text-sm font-small bg-orange-100/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm text-center max-w-[90vw] mx-auto whitespace-nowrap">
            {process.env.NEXT_PUBLIC_LANDING_PAGE_COPY_TEXT}
          </p>
        </div>

        <div className="mt-4 w-full max-w-2xl">
          <div className="relative group">
            <Meteors number={30} />
            <div className="relative flex flex-col gap-4 bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-orange-200/50 hover:border-orange-300/70 transition-all duration-300">
              <Textarea
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="What are you looking for?"
                className="pl-4 text-md h-[120px] resize-none bg-transparent border border-orange-200/60 hover:border-orange-300/80 focus:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-2xl transition-all duration-300 shadow-inner placeholder:text-orange-600/70 text-orange-800 hover:shadow-lg hover:shadow-orange-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <div className="flex items-center justify-between px-2">
                <div className="flex gap-2 items-center">
                  <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-orange-500 hover:bg-orange-100 hover:text-orange-700 flex gap-2 border border-orange-200/50">
                        <Zap className="h-4 w-4" />
                        {!isDropdownOpen && searchMode
                          ? searchModes.find(mode => mode.id === searchMode)?.label
                          : 'Mode'
                        }
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[600px] mt-2 p-4 bg-white border-orange-200" sideOffset={8}>
                      <div className="grid grid-cols-4 grid-rows-2">
                        {searchModes.map((mode) => (
                          <DropdownMenuItem
                            key={mode.id}
                            onClick={() => {
                              setSearchMode(mode.id);
                              setIsDropdownOpen(false);
                            }}
                            className="flex flex-col items-start p-3 cursor-pointer hover:bg-orange-100/80 focus:bg-orange-100/80"
                          >
                            <div className="flex items-center gap-3">
                              <mode.icon className="h-5 w-5 text-orange-600 flex-shrink-0" />
                              <span className="font-medium text-orange-900">{mode.label}</span>
                            </div>
                            <p className="text-xs text-orange-600 leading-relaxed w-full">
                              {mode.description}
                            </p>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div
                    className="flex items-center gap-2"
                    
                  >
                    <Switch
                      id="deep-search-toggle"
                      checked={useDeepSearch}
                      onCheckedChange={(checked) => {
                        setUseDeepSearch(checked);
                        localStorage.setItem('deepSearchToggle', JSON.stringify(checked));
                      }}
                      className="data-[state=checked]:bg-orange-500"
                    />
                    <Label htmlFor="deep-search-toggle" className="text-sm text-orange-600 cursor-pointer">
                      Enable Deep Search
                    </Label>
                  </div>
                </div>
                <Button size="icon" onClick={handleSearch} className="h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-600 transition-all duration-300 overflow-hidden flex items-center justify-center shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105 active:scale-95">
                  <Search className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <p className="text-orange-600 text-sm font-medium text-center">
                Try Deep Research for in depth analysis of the results
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}