import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | PHONEOCEAN',
  description: 'PHONEOCEAN is an esports-focused media platform delivering the latest updates from the competitive gaming ecosystem.',
};

export default function AboutPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <header className="mb-12 md:mb-16 border-b border-gray-300 dark:border-gray-800/50 pb-8">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-space-grotesk tracking-tighter text-gray-900 dark:text-white mb-6">
          ABOUT PHONE<span className="text-blue-600 dark:text-[#00E5FF]">OCEAN</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-3xl">
          An esports-focused media platform delivering the latest updates from the competitive gaming ecosystem.
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
                PHONEOCEAN aims to become a reliable source for esports news, insights, and community-driven content through consistent reporting and real-time updates.
              </p>
              <p>
                Our primary focus is on the evolving esports scene, with strong coverage of mobile esports titles and competitive gaming communities.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#9D00FF] shadow-[0_0_8px_rgba(157,0,255,0.8)]"></span>
              What We Cover
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <li className="bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/60 p-5 rounded-xl shadow-sm">
                <span className="block text-blue-600 dark:text-[#00E5FF] text-xl mb-3">&bull;</span>
                <span className="text-gray-900 dark:text-gray-200 font-medium">Esports news, roster changes, and tournament updates</span>
              </li>
              <li className="bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/60 p-5 rounded-xl shadow-sm">
                <span className="block text-blue-600 dark:text-[#00E5FF] text-xl mb-3">&bull;</span>
                <span className="text-gray-900 dark:text-gray-200 font-medium">On-ground coverage from LAN events</span>
              </li>
              <li className="bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/60 p-5 rounded-xl shadow-sm">
                <span className="block text-blue-600 dark:text-[#00E5FF] text-xl mb-3">&bull;</span>
                <span className="text-gray-900 dark:text-gray-200 font-medium">Exclusive interviews with players, creators, and professionals</span>
              </li>
              <li className="bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/60 p-5 rounded-xl shadow-sm">
                <span className="block text-blue-600 dark:text-[#00E5FF] text-xl mb-3">&bull;</span>
                <span className="text-gray-900 dark:text-gray-200 font-medium">Game guides, updates, and trending gaming content</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_rgba(0,255,102,0.8)]"></span>
              Original Content
            </h2>
            <div className="text-gray-800 dark:text-gray-300 font-sans text-lg leading-relaxed">
              <p>
                We also create original content across multiple platforms, bringing fans closer to the action both online and at live events.
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
              href="mailto:contact@phoneocean.com" 
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
