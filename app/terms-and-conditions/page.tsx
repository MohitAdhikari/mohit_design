import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | PHONEOCEAN',
  description: 'Terms and Conditions for using PHONEOCEAN. Please read them carefully.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <header className="mb-12 border-b border-gray-800/50 pb-8">
        <h1 className="text-3xl md:text-5xl font-black font-space-grotesk tracking-tighter text-white mb-4">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-400 font-mono uppercase tracking-widest">
          Last Updated: April 28, 2026
        </p>
      </header>

      <div className="prose prose-invert prose-lg text-gray-300 font-sans leading-relaxed space-y-8">
        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">Introduction</h2>
          <p>
            Welcome to PHONEOCEAN. By accessing and using our website, you agree to comply with and be bound by the following simple terms and conditions. If you disagree with any part of these terms, please do not use our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">Content Usage</h2>
          <p>
            All content available on PHONEOCEAN, including text, graphics, logos, and images, is our property or the property of our content suppliers. You may read, share, and link to our content, but you may not copy, reproduce, or republish it for commercial purposes without our explicit, written permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">Accuracy of Information</h2>
          <p>
            We strive to provide accurate and up-to-date esports news, game guides, and updates. However, the gaming industry moves fast. Information, including leaks, tournament details, and game updates, may change without notice. We provide our content &quot;as is&quot; and make no guarantees regarding its absolute completeness or accuracy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">External Links</h2>
          <p>
            Our articles frequently include links to third-party websites, such as YouTube videos, Twitter embeds, or Instagram posts. These external sites are not under our control. We are not responsible for the content, privacy policies, or practices of any third-party sites or services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">User Responsibility</h2>
          <p>
            You agree to use PHONEOCEAN for lawful purposes only. You must not use our platform in any way that causes damage to the website or impairs its availability, nor engage in any unlawful, fraudulent, or harmful activities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">Limitation of Liability</h2>
          <p>
            Under no circumstances shall PHONEOCEAN or its team be liable for any direct, indirect, special, incidental, or consequential damages arising out of the use or the inability to use the materials on our website, even if we have been advised of the possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">Changes to These Terms</h2>
          <p>
            We may update these Terms & Conditions from time to time to reflect changes in our practices or legal obligations. We encourage you to review this page periodically. Your continued use of the website after any changes constitutes your acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-space-grotesk text-white mb-4">Contact Us</h2>
          <p>
            If you have any questions regarding these Terms & Conditions, please reach out to us at:
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
