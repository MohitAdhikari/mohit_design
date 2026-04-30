'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function VideoEmbed({ youtubeUrl, instagramUrl, title }: { youtubeUrl?: string, instagramUrl?: string, title: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (youtubeUrl) {
    const videoId = youtubeUrl.split('v=')[1]?.split('&')[0] || youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-800/60 bg-gray-100 dark:bg-[#0B0B0F]">
        {!isLoaded ? (
          <button 
            onClick={() => setIsLoaded(true)}
            className="w-full h-full relative group cursor-pointer"
            aria-label={`Play video: ${title}`}
          >
            <Image 
              src={thumbnailUrl}
              alt={`Thumbnail for ${title}`}
              fill
              className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.8)] group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        )}
      </div>
    );
  }

  if (instagramUrl) {
    let embedUrl = instagramUrl;
    if (!embedUrl.endsWith('/embed') && !embedUrl.endsWith('/embed/')) {
        embedUrl = embedUrl.replace(/\/?$/, '/embed');
    }
    return (
      <div className="relative w-full aspect-[4/5] max-w-[400px] mx-auto rounded-xl overflow-hidden shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-800/60 bg-gray-100 dark:bg-[#0B0B0F]">
        {!isLoaded ? (
           <button 
             onClick={() => setIsLoaded(true)}
             className="w-full h-full bg-gray-50 dark:bg-[#111116] flex flex-col items-center justify-center group cursor-pointer"
             aria-label="Load Instagram Post"
           >
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1 mb-4 group-hover:scale-110 transition-transform">
                <div className="w-full h-full bg-white dark:bg-[#111116] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                     <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                     <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
             </div>
             <span className="text-gray-600 dark:text-gray-400 font-mono text-xs uppercase tracking-widest group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Load Instagram Post</span>
           </button>
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            allowFullScreen
            loading="lazy"
            className="absolute top-0 left-0 w-full h-full bg-white"
          ></iframe>
        )}
      </div>
    );
  }

  return null;
}
