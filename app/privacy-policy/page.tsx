import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | PHONEOCEAN',
  description: 'Privacy Policy for PHONEOCEAN. Learn how we handle your data and respect your privacy.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <header className="mb-12 border-b border-gray-800/50 pb-8">
        <h1 className="text-3xl md:text-5xl font-black font-space-grotesk tracking-tighter text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 font-mono uppercase tracking-widest">
          Last Updated: April 28, 2026
        </p>
      </header>

      <div className="prose prose-invert prose-lg text-gray-300 font-sans leading-relaxed space-y-8">
        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">Information We Collect</h2>
          <p>
            At PHONEOCEAN, we believe in keeping your data safe and your experience simple. We do not require you to create an account to read our content. 
          </p>
          <p>
            We only collect personal information (such as your name and email address) when you voluntarily provide it to us, for example, by filling out our contact form or emailing us directly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">Analytics & Cookies</h2>
          <p>
            To help us improve the website and understand what content our readers enjoy, we use basic analytics tools. These tools may collect anonymous usage data, such as the pages you visit, your general location, and your device type.
          </p>
          <p>
            We also use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings, though some parts of the site may not function optimally.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">Data Sharing</h2>
          <p>
            We respect your privacy. <strong>We do not sell, rent, or trade your personal information to any third parties.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">External Links</h2>
          <p>
            Our articles often include embedded content or links to external websites, such as YouTube videos or Instagram posts. Please be aware that we do not control these external sites, and they have their own privacy policies. We encourage you to review them if you interact with their content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">Contact Us</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy or how we handle your data, please feel free to reach out to us at:
          </p>
          <p>
            <a href="mailto:contact@phoneocean.com" className="text-[#00E5FF] hover:underline underline-offset-4 font-semibold">
              contact@phoneocean.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
