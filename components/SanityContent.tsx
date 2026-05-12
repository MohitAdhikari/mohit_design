import { PortableText } from '@portabletext/react'
import Image from 'next/image'

const components = {
  types: {
    image: ({ value }: any) => {
      // Very basic image handling for the mock/sanity setup
      const imageUrl = value?.asset?.url || value?.url || 'https://picsum.photos/800/400';
      return (
        <div className="relative w-full aspect-video my-8">
          <Image src={imageUrl} alt={value.alt || 'Article Image'} fill className="object-cover rounded-sm" referrerPolicy="no-referrer" />
        </div>
      )
    },
  },
  block: {
    normal: ({ children }: any) => <p className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300 font-sans text-lg">{children}</p>,
    h1: ({ children }: any) => <h1 className="text-4xl font-black font-space-grotesk mt-12 mb-6 text-gray-900 dark:text-white">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-3xl font-bold font-space-grotesk mt-10 mb-5 text-gray-900 dark:text-white">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-2xl font-bold font-space-grotesk mt-8 mb-4 text-gray-900 dark:text-white">{children}</h3>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 dark:border-[#00E5FF] pl-6 my-8 italic text-xl text-gray-600 dark:text-gray-400 font-serif">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
    link: ({ children, value }: any) => (
      <a href={value.href} className="text-blue-600 dark:text-[#00E5FF] hover:text-blue-700 dark:hover:text-cyan-300 underline underline-offset-4" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2">{children}</ol>,
  },
}

export default function SanityContent({ content }: { content: any }) {
  if (!content) return null;
  return (
    <div className="max-w-3xl mx-auto">
      <PortableText value={content} components={components} />
    </div>
  )
}
