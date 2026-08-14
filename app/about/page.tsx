import { Metadata } from 'next';
import { getSiteSettings } from '@/lib/api';

// ZERO-ISR MODE: this page calls getSiteSettings(), a shared cached fetch
// used site-wide. Without force-dynamic, Next.js pulls this page back into
// the ISR cache using that cache's revalidate window. See lib/sanityClient.ts.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About Us | PHONEOCEAN',
  description: 'PhoneOcean is a gaming and esports media platform delivering breaking news, tournament coverage, reviews, game updates, guides, interviews, and original content.',
};

export default async function AboutPage() {
  const { contactEmail } = await getSiteSettings();
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <header className="mb-12 md:mb-16 border-b border-gray-300 dark:border-gray-800/50 pb-8">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-space-grotesk tracking-tighter text-gray-900 dark:text-white mb-6">
          ABOUT PHONE<span className="text-blue-600 dark:text-[#00E5FF]">OCEAN</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-3xl">
          A gaming and esports media platform delivering breaking news, tournament coverage, reviews, game updates, guides, interviews, and original content.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-10">
          <section>
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]"></span>
              Our Mission
            </h2>
            <div className="text-gray-800 dark:text-gray-300 font-sans text-lg leading-relaxed">
              <p className="mb-6">
                PhoneOcean is committed to delivering accurate, timely, and community-focused gaming and esports coverage through original reporting, reviews, event coverage, and trusted journalism.
              </p>
              <p>
                We strive to keep gamers informed with reliable news, in-depth insights, and engaging content from across the gaming industry.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#9D00FF] shadow-[0_0_8px_rgba(157,0,255,0.8)]"></span>
              What We Cover
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Breaking gaming & esports news',
                'Tournament coverage & match results',
                'Roster changes & transfer updates',
                'Exclusive interviews',
                'Game reviews & hands-on impressions',
                'Gaming hardware reviews',
                'Game guides & tutorials',
                'Patch notes & game updates',
                'Industry news & announcements',
                'Gaming events & LAN coverage',
              ].map((item) => (
                <li key={item} className="bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/60 p-5 rounded-xl shadow-sm">
                  <span className="block text-blue-600 dark:text-[#00E5FF] text-xl mb-3">&bull;</span>
                  <span className="text-gray-900 dark:text-gray-200 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_rgba(0,255,102,0.8)]"></span>
              Editorial Standards
            </h2>
            <div className="text-gray-800 dark:text-gray-300 font-sans text-lg leading-relaxed">
              <p>
                At PhoneOcean, accuracy and credibility come first. Every article is carefully reviewed to ensure factual reporting, timely updates, and clear information. If an error is identified, we are committed to correcting it promptly and transparently.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]"></span>
              Why Trust PhoneOcean
            </h2>
            <div className="text-gray-800 dark:text-gray-300 font-sans text-lg leading-relaxed">
              <p>
                PhoneOcean focuses on delivering reliable gaming journalism backed by original reporting, tournament coverage, community insights, and timely updates. Our goal is to provide content that informs, educates, and keeps the gaming community connected.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#9D00FF] shadow-[0_0_8px_rgba(157,0,255,0.8)]"></span>
              Original Content
            </h2>
            <div className="text-gray-800 dark:text-gray-300 font-sans text-lg leading-relaxed">
              <p>
                Beyond written coverage, PhoneOcean creates original videos, event coverage, interviews, reviews, and exclusive features across multiple platforms, bringing the gaming community closer to the biggest stories in gaming and esports.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_rgba(0,255,102,0.8)]"></span>
              Work With Us
            </h2>
            <div className="text-gray-800 dark:text-gray-300 font-sans text-lg leading-relaxed">
              <p>
                PhoneOcean welcomes collaboration with game developers, publishers, esports organizations, technology brands, PR agencies, and event organizers. We are open to media partnerships, product reviews, review units, event invitations, interviews, sponsored campaigns, and advertising opportunities. For business or media inquiries, please contact our team.
              </p>
            </div>
          </section>
        </div>

        <aside className="md:col-span-1">
          <div className="bg-gray-50 dark:bg-[#111116] border border-gray-200 dark:border-gray-800/60 rounded-2xl p-8 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 font-space-grotesk uppercase tracking-wider">Connect With Us</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Have a tip or want to collaborate? Get in touch with our team.
            </p>
            <a 
              href={`mailto:${contactEmail}`}
              className="flex items-center justify-center w-full px-4 py-3 bg-[#00E5FF] hover:bg-[#00C4DD] text-[#0B0B0F] font-bold uppercase tracking-widest text-xs rounded-xl transition-colors cursor-pointer"
            >
              Contact Us
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
