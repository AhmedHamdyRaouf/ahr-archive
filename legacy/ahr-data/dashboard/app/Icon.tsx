// Small line-icon set (24x24, stroke) used by the sidebar and the home screen.
const P: Record<string, string> = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM20 16a3 3 0 11-6 0 3 3 0 016 0z',
  users: 'M16 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8zM22 20v-2a4 4 0 00-3-3.9M16 2.1a4 4 0 010 7.8',
  badge: 'M4 4h16v16H4zM9 10a2 2 0 104 0 2 2 0 00-4 0M7 17c0-2 2-3 3-3s3 1 3 3M15 9h3M15 12h3',
  link: 'M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  news: 'M4 4h13v16H6a2 2 0 01-2-2V4zM17 8h3v10a2 2 0 01-2 2M8 8h6M8 12h6M8 16h4',
  book: 'M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4V4zM20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7V4z',
  image: 'M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4M9 9.5a.5.5 0 100-1 .5.5 0 000 1',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  trophy: 'M7 4h10v5a5 5 0 01-10 0V4zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8 21h8M10 18h4',
  pencil: 'M4 20l1-4L16 5l3 3L8 19l-4 1zM14 7l3 3',
  history: 'M3 12a9 9 0 109-9 9 9 0 00-7 3.5M3 4v4h4M12 7v5l3 2',
  gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2-1.2L14 3h-4l-.6 2.6a7 7 0 00-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 002 1.2L10 21h4l.6-2.6a7 7 0 002-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  check: 'M5 12l5 5 9-10',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  video: 'M3 6h12v12H3zM15 10l6-3v10l-6-3',
  chat: 'M4 5h16v11H9l-5 4V5z',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
  globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 118 0v3',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  bot: 'M5 8h14v10H5zM12 4v4M9 13h.01M15 13h.01M3 12v3M21 12v3',
  heart: 'M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z',
  plus: 'M12 5v14M5 12h14',
  menu: 'M4 7h16M4 12h16M4 17h16',
  bell: 'M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zM10 21h4',
  warn: 'M12 3l10 18H2L12 3zM12 10v5M12 18h.01',
  scale: 'M12 4v16M6 20h12M5 7h14M5 7l-3 7a3 3 0 006 0L5 7zM19 7l-3 7a3 3 0 006 0l-3-7z',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  chevron: 'M9 6l6 6-6 6',
  arrow: 'M19 12H5M11 6l-6 6 6 6',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01',
  translate: 'M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M12 5c0 4-3 7-7 8M13 21l4-10 4 10M14.5 17h5',
}
export const TABLE_ICON: Record<string, string> = {
  works: 'music', credits: 'badge', person: 'users', events: 'calendar', awards: 'trophy', press: 'news',
  sources: 'book', media_assets: 'image', life_story: 'user', site_texts: 'pencil', training_choir: 'music',
  roles_education: 'badge', press_links: 'link', review_queue: 'check', audience_voices: 'chat', youtube_videos: 'video',
  project_items: 'layers', contact_channels: 'phone', work_relationship: 'link', ref_relationship_type: 'tag',
}
export default function Icon({ n, size = 20 }: { n: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}>
      <path d={P[n] || P.doc} />
    </svg>
  )
}
