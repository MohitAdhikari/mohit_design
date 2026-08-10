import Image from 'next/image';
import { heroImageUrl } from '@/lib/sanityImage';

interface ArticleHeroProps {
  image?: any;
  fallbackUrl?: string | null;
  alt: string;
  caption?: string | null;
  credit?: string | null;
}

/**
 * Standard news-site hero: the H1 and meta sit above this component
 * (see ArticleHeader), so the image is always a plain, contained photo
 * — never a crop-and-caption gamble. Uses Sanity hotspot data (when
 * available) so the subject of the photo is preserved on every screen
 * size instead of being center-cropped.
 */
export default function ArticleHero({ image, fallbackUrl, alt, caption, credit }: ArticleHeroProps) {
  const source = image || fallbackUrl;
  if (!source) return null;

  // A single 16:9 crop works cleanly at every viewport (the standard
  // treatment on professional news sites) and — critically — means
  // mobile only ever downloads one hero image, not two.
  const heroSrc = heroImageUrl(source, 1600, 900);

  return (
    <figure className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0 mb-8">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900">
        <Image
          src={heroSrc}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 900px"
          className="object-cover"
          priority
          fetchPriority="high"
          referrerPolicy="no-referrer"
        />
      </div>
      {(caption || credit) && (
        <figcaption className="mt-2.5 text-xs text-gray-500 dark:text-gray-500 text-center">
          {caption}
          {credit && <span className="italic"> — {credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}
