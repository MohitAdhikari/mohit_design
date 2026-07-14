import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Youtube, Instagram, Mail } from 'lucide-react';

interface SiteSettings {
  discordUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  contactEmail: string;
}

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

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function Footer({ settings }: { settings: SiteSettings }) {
  const socialLinks = [
    settings.twitterUrl && { icon: <Twitter className="w-4 h-4" />, href: settings.twitterUrl, label: 'Twitter' },
    settings.youtubeUrl && { icon: <Youtube className="w-4 h-4" />, href: settings.youtubeUrl, label: 'YouTube' },
    settings.instagramUrl && { icon: <Instagram className="w-4 h-4" />, href: settings.instagramUrl, label: 'Instagram' },
    settings.discordUrl && { icon: <DiscordIcon className="w-4 h-4" />, href: settings.discordUrl, label: 'Discord' },
    settings.contactEmail && { icon: <Mail className="w-4 h-4" />, href: `mailto:${settings.contactEmail}`, label: 'Email' },
  ].filter(Boolean) as { icon: React.ReactNode; href: string; label: string }[];

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
            {socialLinks.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map(({ icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-[#00E5FF] hover:border-blue-600 dark:hover:border-[#00E5FF] transition-colors"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            )}
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
