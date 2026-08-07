'use client';

import { useState } from 'react';

interface TabsProps {
  tabs: string[];
  children: React.ReactNode[];
  defaultTab?: number;
}

export default function Tabs({ tabs, children, defaultTab = 0 }: TabsProps) {
  const [active, setActive] = useState(defaultTab);

  if (!tabs.length) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800/60">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className={`relative px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors ${
              active === i
                ? 'text-blue-600 dark:text-[#00E5FF]'
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            {tab}
            {active === i && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 dark:bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            )}
          </button>
        ))}
      </div>
      <div>{children[active]}</div>
    </div>
  );
}
