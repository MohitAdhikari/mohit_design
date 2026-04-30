import { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | PHONEOCEAN',
  description: 'For business inquiries, collaborations, media coverage, or general questions, feel free to reach out to PHONEOCEAN.',
};

export default function ContactPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <header className="mb-12 md:mb-16 border-b border-gray-300 dark:border-gray-800/50 pb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-space-grotesk tracking-tighter text-gray-900 dark:text-white mb-6">
          CONTACT PHONE<span className="text-blue-600 dark:text-[#00E5FF]">OCEAN</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-3xl">
          For business inquiries, collaborations, media coverage, or general questions, feel free to reach out to us.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* LEFT COLUMN: Info */}
        <div className="space-y-12">
          
          {/* Email */}
          <section>
             <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#00E5FF]/10 flex items-center justify-center text-blue-600 dark:text-[#00E5FF]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </span>
              Email
            </h2>
            <div className="pl-11">
              <a href="mailto:contact@phoneocean.com" className="text-lg text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-[#00E5FF] transition-colors font-sans underline underline-offset-4">
                contact@phoneocean.com
              </a>
            </div>
          </section>

          {/* Business & Partnerships */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#9D00FF]/10 flex items-center justify-center text-purple-600 dark:text-[#9D00FF]">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </span>
              Business & Partnerships
            </h2>
            <div className="pl-11 prose prose-invert text-gray-800 dark:text-gray-300 font-sans leading-relaxed">
              <p className="mb-4 text-gray-600 dark:text-gray-400">We are open to:</p>
              <ul className="space-y-3 list-none p-0">
                <li className="flex items-center gap-3 bg-white dark:bg-[#111116] p-4 rounded-xl border border-gray-200 dark:border-gray-800/60 shadow-sm dark:shadow-none">
                   <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-[#00E5FF]"></span>
                   <span className="text-gray-900 dark:text-gray-200">Esports collaborations</span>
                </li>
                <li className="flex items-center gap-3 bg-white dark:bg-[#111116] p-4 rounded-xl border border-gray-200 dark:border-gray-800/60 shadow-sm dark:shadow-none">
                   <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-[#00E5FF]"></span>
                   <span className="text-gray-900 dark:text-gray-200">Brand partnerships</span>
                </li>
                <li className="flex items-center gap-3 bg-white dark:bg-[#111116] p-4 rounded-xl border border-gray-200 dark:border-gray-800/60 shadow-sm dark:shadow-none">
                   <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-[#00E5FF]"></span>
                   <span className="text-gray-900 dark:text-gray-200">Event coverage opportunities</span>
                </li>
                <li className="flex items-center gap-3 bg-white dark:bg-[#111116] p-4 rounded-xl border border-gray-200 dark:border-gray-800/60 shadow-sm dark:shadow-none">
                   <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-[#00E5FF]"></span>
                   <span className="text-gray-900 dark:text-gray-200">Sponsored content</span>
                </li>
              </ul>
              <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 border-l-2 border-[#9D00FF] pl-4 italic">
                For all business-related queries, please mention <strong className="text-gray-900 dark:text-white">“Business Inquiry”</strong> in the subject line.
              </p>
            </div>
          </section>

          <section>
             <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#00FF66]/10 flex items-center justify-center text-green-600 dark:text-[#00FF66]">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </span>
              Response Time
            </h2>
            <div className="pl-11">
              <p className="text-gray-800 dark:text-gray-300 font-sans leading-relaxed">
                We typically respond within <strong className="text-gray-900 dark:text-white">24–48 hours</strong>.
              </p>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/60 p-6 md:p-8 rounded-2xl shadow-sm">
             <h3 className="text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-4">Send a Message</h3>
             <p className="text-sm text-gray-600 dark:text-gray-400 font-sans mb-8 leading-relaxed">
               You can also use our contact form to send us a message. Please include your name, email, and a clear message so we can respond quickly.
             </p>
             <ContactForm />
          </div>

          <div className="p-6 bg-[#00E5FF]/5 border py-6 border-[#00E5FF]/20 rounded-2xl text-center">
             <h4 className="text-xs font-mono uppercase tracking-widest text-[#00E5FF] mb-2 font-bold flex items-center justify-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               Note
             </h4>
             <p className="text-sm text-gray-400 leading-relaxed font-sans mt-3">
               PHONEOCEAN is an independent esports media platform. We aim to respond to all genuine inquiries as quickly as possible. Thank you for reaching out.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
