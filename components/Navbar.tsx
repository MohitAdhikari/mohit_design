'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-[#0B0B0F]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/40">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center pr-8 lg:pr-12">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Image 
                src="/logo.png" 
                alt="PHONEOCEAN Logo" 
                width={190} 
                height={68} 
                className="w-auto h-[62px] lg:h-[68px] object-contain"
                priority
              />
              <span className="font-sans font-bold text-xl sm:text-[1.35rem] tracking-[0.02em] text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-cyan-400 uppercase hidden sm:block">
                PHONEOCEAN
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 flex-1">
            <Link href="/news" className={`relative transition-colors text-sm font-bold uppercase tracking-widest py-2 ${isActive('/news') ? 'text-[#00E5FF]' : 'text-gray-400 hover:text-gray-200'}`}>
              News
              {isActive('/news') && <span className="absolute bottom-[-1.25rem] left-0 w-full h-[3px] bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]"></span>}
            </Link>
            <Link href="/interviews" className={`relative transition-colors text-sm font-bold uppercase tracking-widest py-2 ${isActive('/interviews') ? 'text-[#00E5FF]' : 'text-gray-400 hover:text-gray-200'}`}>
              Interviews
              {isActive('/interviews') && <span className="absolute bottom-[-1.25rem] left-0 w-full h-[3px] bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]"></span>}
            </Link>
            <Link href="/guides" className={`relative transition-colors text-sm font-bold uppercase tracking-widest py-2 ${isActive('/guides') ? 'text-[#00E5FF]' : 'text-gray-400 hover:text-gray-200'}`}>
              Guides
              {isActive('/guides') && <span className="absolute bottom-[-1.25rem] left-0 w-full h-[3px] bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]"></span>}
            </Link>
            <Link href="/videos" className={`relative transition-colors text-sm font-bold uppercase tracking-widest py-2 flex items-center gap-2 ${isActive('/videos') ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse"></span>
              Videos
              {isActive('/videos') && <span className="absolute bottom-[-1.25rem] left-0 w-full h-[3px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search esports..." 
                className="bg-gray-100 dark:bg-[#13131A] text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 text-sm rounded-full py-2.5 px-5 w-64 border border-gray-300 dark:border-gray-800/80 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600 transition-all font-mono"
              />
            </div>
            <ThemeToggle />
            <Link href="/studio" className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold font-sans text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-[#00E5FF] dark:bg-[#00E5FF]/10 dark:hover:bg-[#00E5FF]/20 transition-all uppercase tracking-wider">
              Studio
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <ThemeToggle />
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-300 hover:text-white p-2 flex items-center justify-center h-12 w-12 rounded-full hover:bg-gray-800/50 transition-colors"
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
             <div className="relative group px-1">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-gray-100 dark:bg-[#13131A] text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 text-sm rounded-xl py-3 px-5 w-full border border-gray-300 dark:border-gray-800/80 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-all font-mono"
              />
             </div>
             <Link href="/studio" onClick={() => setIsOpen(false)} className="flex w-full items-center justify-center px-4 py-3 rounded-xl text-sm font-bold font-sans text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-[#00E5FF] dark:bg-[#00E5FF]/10 uppercase tracking-wider">
              Studio Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
