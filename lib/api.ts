import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../sanity/env'

const client = createClient({
  projectId: projectId || 'demo1234',
  dataset: dataset || 'production',
  apiVersion: apiVersion || '2024-04-28',
  useCdn: process.env.NODE_ENV === 'production',
})

// Mock Data
export const mockData = {
  newsPosts: [
    {
      _id: '1',
      title: 'BGIS 2026 Grand Finals: Everything You Need to Know',
      slug: { current: 'bgis-2026-grand-finals' },
      thumbnail: 'https://picsum.photos/seed/bgis1/800/400',
      category: 'Tournament',
      publishDate: new Date().toISOString(),
      authorName: 'Admin',
      content: [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'The biggest BGMI tournament of the year is here. Learn about the qualified teams, prize pool, and schedule.' }] }
      ]
    },
    {
      _id: '2',
      title: 'Jonathan signs with Team Soul: The Biggest Esports Roster Change of 2026',
      slug: { current: 'jonathan-signs-team-soul' },
      thumbnail: 'https://picsum.photos/seed/jonathan2/800/400',
      category: 'Roster Changes',
      publishDate: new Date(Date.now() - 86400000).toISOString(),
      authorName: 'Admin',
      content: [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'In an unprecedented move, legendary player Jonathan has officially joined Team Soul.' }] }
      ]
    },
    {
      _id: '3',
      title: 'Valorant Mobile Alpha Test Announced for Southeast Asia',
      slug: { current: 'valorant-mobile-alpha-sea' },
      thumbnail: 'https://picsum.photos/seed/valmobile/800/400',
      category: 'Mobile Gaming',
      publishDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      authorName: 'Admin',
      content: [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Riot Games finally confirms the first alpha test for Valorant Mobile in the SEA region.' }] }
      ]
    },
    {
      _id: '4',
      title: 'Global Esports CEO Rushindra Sinha talks 2026 vision',
      slug: { current: 'global-esports-ceo-2026' },
      thumbnail: 'https://picsum.photos/seed/ge-ceo/800/400',
      category: 'Interview',
      publishDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      authorName: 'Admin',
      content: [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'GE CEO discusses team expansion, VCT Pacific, and new creators.' }] }
      ]
    },
    {
      _id: '5',
      title: 'Free Fire World Series 2026 Breaks Viewership Records',
      slug: { current: 'ffws-2026-viewership' },
      thumbnail: 'https://picsum.photos/seed/ffws/800/400',
      category: 'Tournament',
      publishDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      authorName: 'Admin',
      content: [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'FFWS 2026 has officially shattered the concurrent viewership records for mobile esports.' }] }
      ]
    },
    {
      _id: '6',
      title: 'GodLike Esports Unveils Stunning New Bootcamp',
      slug: { current: 'godlike-new-bootcamp' },
      thumbnail: 'https://picsum.photos/seed/godlike/800/400',
      category: 'Org Updates',
      publishDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      authorName: 'Admin',
      content: [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Take a tour of the brand new 25,000 sq ft GodLike Esports facility in Mumbai.' }] }
      ]
    },
    {
      _id: '7',
      title: 'Clash of Clans ESPORTS: 2026 Championship Roadmap',
      slug: { current: 'coc-esports-2026' },
      thumbnail: 'https://picsum.photos/seed/coc/800/400',
      category: 'Tournament',
      publishDate: new Date(Date.now() - 6 * 86400000).toISOString(),
      authorName: 'Admin',
      content: [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Supercell reveals massive prize pool and new format for the CoC World Championship.' }] }
      ]
    }
  ],
  interviews: [
    {
      _id: '1',
      playerOrCeoName: 'Mavi',
      eventName: 'BGIS LAN',
      thumbnail: 'https://picsum.photos/seed/mavi1/800/400',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      publishDate: new Date().toISOString(),
    },
    {
      _id: '2',
      playerOrCeoName: 'Snax',
      eventName: 'Creator Showdown',
      thumbnail: 'https://picsum.photos/seed/snax/800/400',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      publishDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      _id: '3',
      playerOrCeoName: 'Mortal',
      eventName: 'Post-BGIS Analysis',
      thumbnail: 'https://picsum.photos/seed/mortal/800/400',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      publishDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      _id: '4',
      playerOrCeoName: 'S8UL Sid',
      eventName: 'Esports Business',
      thumbnail: 'https://picsum.photos/seed/sid/800/400',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      publishDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    }
  ],
  guides: [
    {
      _id: '1',
      title: 'Blox Fruits Codes - Double XP & Money (Updated)',
      slug: { current: 'blox-fruits-codes' },
      gameName: 'Roblox',
      thumbnail: 'https://picsum.photos/seed/roblox/800/400',
      codesList: ['Sub2Fer999', 'Enyu_is_Pro', 'Magicbus'],
      lastUpdated: new Date().toISOString(),
      content: [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Here are the latest working codes for Blox Fruits to get Double XP and Beli.' }] }
      ]
    },
    {
      _id: '2',
      title: 'BGMI 3.1 Update: Best Sensitivity Settings for Headshots',
      slug: { current: 'bgmi-zero-recoil-sensitivity' },
      gameName: 'BGMI',
      thumbnail: 'https://picsum.photos/seed/bgmi/800/400',
      lastUpdated: new Date(Date.now() - 86400000).toISOString(),
      content: [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Get zero recoil with these pro sensitivity settings for gyro and non-gyro players.' }] }
      ]
    },
    {
      _id: '3',
      title: 'Free Fire: Top 5 Character Combinations for CS Ranked',
      slug: { current: 'ff-cs-character-combos' },
      gameName: 'Free Fire',
      thumbnail: 'https://picsum.photos/seed/freefire/800/400',
      lastUpdated: new Date(Date.now() - 172800000).toISOString(),
      content: [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Dominating Clash Squad is easy when you use these OP character skill combinations.' }] }
      ]
    }
  ]
}

export async function getNewsPosts() {
  if (projectId === 'demo1234' || !projectId) {
    return mockData.newsPosts;
  }
  const query = `*[_type == "newsPost"] | order(publishDate desc) {
    _id, title, slug, "thumbnail": thumbnail.asset->url, category, publishDate, authorName, youtubeUrl, instagramUrl
  }`;
  return client.fetch(query);
}

export async function getNewsPostBySlug(slug: string) {
  if (projectId === 'demo1234' || !projectId) {
    return mockData.newsPosts.find(p => p.slug.current === slug);
  }
  const query = `*[_type == "newsPost" && slug.current == $slug][0] {
    _id, title, slug, "thumbnail": thumbnail.asset->url, category, publishDate, authorName, content, youtubeUrl, instagramUrl
  }`;
  return client.fetch(query, { slug });
}

export async function getInterviews() {
  if (projectId === 'demo1234' || !projectId) {
    return mockData.interviews;
  }
  const query = `*[_type == "interview"] | order(publishDate desc) {
    _id, playerOrCeoName, eventName, "thumbnail": thumbnail.asset->url, youtubeUrl, instagramUrl, publishDate, keyHighlights
  }`;
  return client.fetch(query);
}

export async function getGuides() {
  if (projectId === 'demo1234' || !projectId) {
    return mockData.guides;
  }
  const query = `*[_type == "guide"] | order(lastUpdated desc) {
    _id, title, slug, gameName, "thumbnail": thumbnail.asset->url, lastUpdated, youtubeUrl, instagramUrl
  }`;
  return client.fetch(query);
}

export async function getGuideBySlug(slug: string) {
  if (projectId === 'demo1234' || !projectId) {
    return mockData.guides.find(g => g.slug.current === slug);
  }
  const query = `*[_type == "guide" && slug.current == $slug][0] {
    _id, title, slug, gameName, "thumbnail": thumbnail.asset->url, codesList, lastUpdated, content, youtubeUrl, instagramUrl
  }`;
  return client.fetch(query, { slug });
}

export async function getAllVideos() {
  if (projectId === 'demo1234' || !projectId) {
    const videoPosts = mockData.newsPosts.filter((p: any) => p.youtubeUrl || p.instagramUrl).map((p: any) => ({...p, _type: 'newsPost', date: p.publishDate}));
    const videoInterviews = mockData.interviews.filter((i: any) => i.youtubeUrl || i.instagramUrl).map((i: any) => ({...i, _type: 'interview', date: i.publishDate, title: i.playerOrCeoName}));
    const videoGuides = mockData.guides.filter((g: any) => g.youtubeUrl || g.instagramUrl).map((g: any) => ({...g, _type: 'guide', date: g.lastUpdated}));
    
    return [...videoPosts, ...videoInterviews, ...videoGuides].sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }
  
  const query = `*[(_type == "newsPost" || _type == "interview" || _type == "guide") && (defined(youtubeUrl) || defined(instagramUrl))] | order(coalesce(publishDate, lastUpdated) desc) {
    _id,
    _type,
    "title": coalesce(title, playerOrCeoName),
    slug,
    "thumbnail": thumbnail.asset->url,
    "date": coalesce(publishDate, lastUpdated),
    youtubeUrl,
    instagramUrl,
    category
  }`;
  return client.fetch(query);
}

