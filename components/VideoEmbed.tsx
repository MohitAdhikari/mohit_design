'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

function getYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&]+)/,
    /youtu\.be\/([^?&/]+)/,
    /\/embed\/([^?&/]+)/,
    /\/shorts\/([^?&/]+)/,
    /\/live\/([^?&/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function normalizeInstagramUrl(url: string): string {
  return url.replace(/\/embed\/?$/, '').replace(/\?.*$/, '').replace(/\/$/, '');
}

export default function VideoEmbed({ youtubeUrl, instagramUrl, title }: { youtubeUrl?: string, instagramUrl?: string, title: string }) {
  const [ytLoaded, setYtLoaded] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!instagramUrl) return;

    const process = () => {
      (window as any).instgrm?.Widgets?.load?.();
    };

    if ((window as any).instgrm?.Widgets) {
      process();
    } else {
      if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.instagram.com/embed.js';
        s.async = true;
        s.onload = process;
        document.body.appendChild(s);
      }
    }
  }, [instagramUrl]);

  if (youtubeUrl) {
    const videoId = getYouTubeId(youtubeUrl);

    if (!videoId) {
      return (
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full aspect-video rounded-xl border border-gray-200 dark:border-gray-800/60 bg-gray-100 dark:bg-[#0B0B0F] text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-mono text-xs uppercase tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          Watch on YouTube
        </a>
      );
    }

    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-800/60 bg-gray-100 dark:bg-[#0B0B0F]">
        {!ytLoaded ? (
          <button 
            onClick={() => setYtLoaded(true)}
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
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        )}
      </div>
    );
  }

  if (instagramUrl) {
    const postUrl = normalizeInstagramUrl(instagramUrl);

    return (
      <div className="instagram-embed-wrapper flex justify-center my-4">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={`${postUrl}/?utm_source=ig_embed&utm_campaign=loading`}
          data-instgrm-version="14"
          style={{
            background: isDark ? '#1A1A22' : '#FFF',
            border: 0,
            borderRadius: '3px',
            boxShadow: isDark
              ? '0 0 1px 0 rgba(255,255,255,0.1), 0 1px 10px 0 rgba(0,0,0,0.5)'
              : '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
            margin: '1px',
            maxWidth: '540px',
            minWidth: '326px',
            padding: 0,
            width: 'calc(100% - 2px)',
          }}
        >
          <div style={{ padding: '16px' }}>
            <a
              href={`${postUrl}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: isDark ? '#E0E0E0' : '#000', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: 550, lineHeight: '18px' }}
            >
              View this post on Instagram
            </a>
          </div>
        </blockquote>
      </div>
    );
  }

  return null;
}
