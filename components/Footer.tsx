import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Youtube, Instagram, Mail } from 'lucide-react';

const navLinks = [
  { href: '/news', label: 'News' },
  { href: '/interviews', label: 'Interviews' },
  { href: '/guides', label: 'Guides' },
  { href: '/videos', label: 'Videos' },
];
const companyLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
];

export default function Footer() {
  return (
    <footer className="relative bg-gray-50 dark:bg-[#0B0B0F] border-t border-gray-200 dark:border-gray-800/40">
      {/* accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent" />

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Image
                src="/logo.svg"
                alt="PHONEOCEAN Logo"
                width={48}
                height={48}
                className="w-11 h-11 md:w-12 md:h-12 object-contain"
              />
              <span className="font-sans font-bold text-xl md:text-[1.35rem] tracking-[0.02em] text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-cyan-400 uppercase">
                PHONEOCEAN
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-sans leading-relaxed max-w-md">
              Independent gaming news, esports updates and exclusive interviews. Built for the next generation of fans.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                { Icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
                { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                { Icon: Github, href: 'https://github.com', label: 'GitHub' },
                { Icon: Mail, href: 'mailto:contact@phoneocean.com', label: 'Email' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-[#00E5FF] hover:border-blue-600 dark:hover:border-[#00E5FF] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-4">Explore</h4>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-[#00E5FF] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-[#00E5FF] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800/50 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 dark:text-gray-500 text-[11px] md:text-xs font-mono text-center md:text-left">
            &copy; {new Date().getFullYear()} PHONEOCEAN. All rights reserved.
          </p>
          <Link
            href="/studio"
            className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 text-[11px] md:text-xs font-mono uppercase tracking-wider underline underline-offset-4"
          >
            Owner CMS Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
