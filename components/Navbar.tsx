'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { Search as SearchIcon } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname?.startsWith(path);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 bg-white/90 dark:bg-[#0B0B0F]/90 backdrop-blur-md border-b transition-shadow ${
        scrolled
          ? 'border-gray-200 dark:border-gray-800/70 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'border-gray-200/60 dark:border-gray-800/30'
      }`}
    >
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center pr-8 lg:pr-12">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Image
                src="/logo.svg"
                alt="PHONEOCEAN Logo"
                width={56}
                height={56}
                className="w-12 h-12 lg:w-[52px] lg:h-[52px] object-contain"
                priority
              />
              <span className="font-sans font-bold text-xl sm:text-[1.35rem] tracking-[0.02em] text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-white dark:via-cyan-400 dark:to-white animate-gradient-x uppercase hidden sm:block">
                PHONEOCEAN
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 flex-1">
            <Link href="/news" className={`relative transition-colors text-sm font-bold uppercase tracking-widest py-2 ${isActive('/news') ? 'text-blue-600 dark:text-[#00E5FF]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
              News
              {isActive('/news') && <span className="absolute bottom-[-1.25rem] left-0 w-full h-[3px] bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]"></span>}
            </Link>
            <Link href="/interviews" className={`relative transition-colors text-sm font-bold uppercase tracking-widest py-2 ${isActive('/interviews') ? 'text-blue-600 dark:text-[#00E5FF]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
              Interviews
              {isActive('/interviews') && <span className="absolute bottom-[-1.25rem] left-0 w-full h-[3px] bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]"></span>}
            </Link>
            <Link href="/guides" className={`relative transition-colors text-sm font-bold uppercase tracking-widest py-2 ${isActive('/guides') ? 'text-blue-600 dark:text-[#00E5FF]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
              Guides
              {isActive('/guides') && <span className="absolute bottom-[-1.25rem] left-0 w-full h-[3px] bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]"></span>}
            </Link>
            <Link href="/videos" className={`relative transition-colors text-sm font-bold uppercase tracking-widest py-2 flex items-center gap-2 ${isActive('/videos') ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse"></span>
              Videos
              {isActive('/videos') && <span className="absolute bottom-[-1.25rem] left-0 w-full h-[3px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <form onSubmit={handleSearch} className="relative group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search esports..."
                aria-label="Search"
                className="bg-gray-100 dark:bg-[#13131A] text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 text-sm rounded-full py-2.5 pl-10 pr-5 w-64 border border-gray-300 dark:border-gray-800/80 focus:outline-none focus:border-blue-500 dark:focus:border-[#00E5FF]/60 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#00E5FF]/20 transition-all font-mono"
              />
            </form>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <ThemeToggle />
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 flex items-center justify-center h-12 w-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#0B0B0F] border-b border-gray-200 dark:border-gray-800/50 px-4 pt-2 pb-6 space-y-2 shadow-2xl">
          <Link href="/news" onClick={() => setIsOpen(false)} className={`block transition-colors text-base font-bold uppercase tracking-widest p-4 rounded-xl ${isActive('/news') ? 'text-blue-600 dark:text-[#00E5FF] bg-blue-50 dark:bg-blue-900/10' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}>News</Link>
          <Link href="/interviews" onClick={() => setIsOpen(false)} className={`block transition-colors text-base font-bold uppercase tracking-widest p-4 rounded-xl ${isActive('/interviews') ? 'text-blue-600 dark:text-[#00E5FF] bg-blue-50 dark:bg-blue-900/10' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}>Interviews</Link>
          <Link href="/guides" onClick={() => setIsOpen(false)} className={`block transition-colors text-base font-bold uppercase tracking-widest p-4 rounded-xl ${isActive('/guides') ? 'text-blue-600 dark:text-[#00E5FF] bg-blue-50 dark:bg-blue-900/10' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}>Guides</Link>
          <Link href="/videos" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 transition-colors text-base font-bold uppercase tracking-widest p-4 rounded-xl ${isActive('/videos') ? 'text-gray-900 dark:text-white bg-red-50 dark:bg-red-900/10' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
             <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse"></span>
             Videos
          </Link>
          <div className="pt-4 space-y-4">
             <form onSubmit={handleSearch} className="relative group px-1">
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search"
                className="bg-gray-100 dark:bg-[#13131A] text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 text-sm rounded-xl py-3 pl-11 pr-5 w-full border border-gray-300 dark:border-gray-800/80 focus:outline-none focus:border-blue-500 dark:focus:border-[#00E5FF]/60 transition-all font-mono"
              />
             </form>
          </div>
        </div>
      )}
    </nav>
  );
}
