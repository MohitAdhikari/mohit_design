import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#0B0B0F] border-t border-gray-800/40 py-12 mt-12 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity">
               <Image 
                  src="/logo.png" 
                  alt="PHONEOCEAN Logo" 
                  width={190} 
                  height={68} 
                  className="w-auto h-[62px] lg:h-[68px] object-contain"
               />
               <span className="font-sans font-bold text-xl md:text-[1.35rem] tracking-[0.02em] text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-cyan-400 uppercase">
                  PHONEOCEAN
               </span>
            </Link>
            <p className="mt-2 text-xs md:text-sm text-gray-500 font-mono tracking-tight text-center md:text-left">Gaming News, Esports Updates & Exclusive Interviews</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
             <Link href="/about" className="text-gray-500 hover:text-white uppercase text-[10px] md:text-xs font-semibold tracking-wider min-h-[44px] flex items-center">About</Link>
             <Link href="/news" className="text-gray-500 hover:text-white uppercase text-[10px] md:text-xs font-semibold tracking-wider min-h-[44px] flex items-center">News</Link>
             <Link href="/interviews" className="text-gray-500 hover:text-white uppercase text-[10px] md:text-xs font-semibold tracking-wider min-h-[44px] flex items-center">Interviews</Link>
             <Link href="/guides" className="text-gray-500 hover:text-white uppercase text-[10px] md:text-xs font-semibold tracking-wider min-h-[44px] flex items-center">Guides</Link>
             <Link href="/contact" className="text-gray-500 hover:text-white uppercase text-[10px] md:text-xs font-semibold tracking-wider min-h-[44px] flex items-center">Contact</Link>
             <Link href="/privacy-policy" className="text-gray-500 hover:text-white uppercase text-[10px] md:text-xs font-semibold tracking-wider min-h-[44px] flex items-center">Privacy Policy</Link>
             <Link href="/terms-and-conditions" className="text-gray-500 hover:text-white uppercase text-[10px] md:text-xs font-semibold tracking-wider min-h-[44px] flex items-center">Terms & Conditions</Link>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800/40 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-600 text-[10px] md:text-xs font-mono text-center md:text-left">
            &copy; {new Date().getFullYear()} PHONEOCEAN. All rights reserved.
          </p>
          <Link href="/studio" className="text-gray-600 hover:text-gray-300 text-[10px] md:text-xs font-mono uppercase underline underline-offset-4 min-h-[44px] flex items-center justify-center">Owner CMS Login</Link>
        </div>
      </div>
    </footer>
  );
}
