'use client';

import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  // Typically, this would trigger an API call to a Sanity search endpoint.
  // For this static/mock demo, we'll keep it as a UI demonstration.

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh]">
      <h1 className="text-4xl md:text-5xl font-black font-space-grotesk tracking-tighter uppercase mb-10 text-center">
        Search
      </h1>
      
      <div className="relative mb-12">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search news, interviews, guides..." 
          className="w-full bg-[#0a0a0a] border border-gray-800 text-white px-6 py-5 text-xl font-mono focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 uppercase font-mono tracking-wider font-bold hover:bg-blue-500 transition-colors">
          Go
        </button>
      </div>

      <div className="text-center">
        <p className="text-gray-500 font-mono tracking-widest uppercase text-sm">
          {query.length > 0 ? `Searching for "${query}"...` : 'Enter a keyword to start searching.'}
        </p>
      </div>
    </div>
  );
}
