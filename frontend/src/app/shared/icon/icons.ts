export type Shape =
  | { t: 'path'; d: string }
  | { t: 'circle'; cx: number; cy: number; r: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx: number };

const path = (d: string): Shape => ({ t: 'path', d });

/**
 * Outline icons (24x24, Lucide style). Content data refers to icons by these names,
 * so adding an icon never touches a page component. Shapes are bound in the template
 * (not injected as HTML) so they also render on the server.
 */
export const ICONS = {
  'chevron-down': [path('m6 9 6 6 6-6')],
  'chevron-up': [path('m18 15-6-6-6 6')],
  'chevron-right': [path('m9 18 6-6-6-6')],
  menu: [path('M4 6h16M4 12h16M4 18h16')],
  close: [path('M18 6 6 18M6 6l12 12')],
  'arrow-right': [path('M5 12h14m-7-7 7 7-7 7')],
  'arrow-up': [path('M12 19V5m-7 7 7-7 7 7')],
  'external-link': [path('M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6')],
  'arrow-left': [path('m12 19-7-7 7-7m7 7H5')],
  calendar: [{ t: 'rect', x: 3, y: 4, w: 18, h: 18, rx: 2 }, path('M16 2v4M8 2v4M3 10h18')],
  'map-pin': [path('M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z'), { t: 'circle', cx: 12, cy: 10, r: 3 }],
  mail: [{ t: 'rect', x: 2, y: 4, w: 20, h: 16, rx: 2 }, path('m22 7-10 6L2 7')],
  phone: [
    path(
      'M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z',
    ),
  ],
  chat: [path('M7.9 20A9 9 0 1 0 4 16.1L2 22Z')],
  shield: [
    path(
      'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
    ),
  ],
  'shield-check': [
    path(
      'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
    ),
    path('m9 12 2 2 4-4'),
  ],
  'file-text': [
    path('M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'),
    path('M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8'),
  ],
  calculator: [
    { t: 'rect', x: 4, y: 2, w: 16, h: 20, rx: 2 },
    path('M8 6h8M16 14v.01M12 14v.01M8 14v.01M16 18v.01M12 18v.01M8 18v.01M12 10v.01M8 10v.01M16 10v.01'),
  ],
  building: [
    { t: 'rect', x: 4, y: 2, w: 16, h: 20, rx: 2 },
    path('M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01'),
  ],
  briefcase: [path('M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'), { t: 'rect', x: 2, y: 6, w: 20, h: 14, rx: 2 }],
  award: [{ t: 'circle', cx: 12, cy: 8, r: 6 }, path('M15.477 12.89 17 22l-5-3-5 3 1.523-9.11')],
  clock: [{ t: 'circle', cx: 12, cy: 12, r: 10 }, path('M12 6v6l4 2')],
  users: [
    path('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'),
    { t: 'circle', cx: 9, cy: 7, r: 4 },
    path('M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'),
  ],
  globe: [{ t: 'circle', cx: 12, cy: 12, r: 10 }, path('M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20')],
  cpu: [
    { t: 'rect', x: 4, y: 4, w: 16, h: 16, rx: 2 },
    { t: 'rect', x: 9, y: 9, w: 6, h: 6, rx: 1 },
    path('M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2'),
  ],
  layers: [
    path('M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z'),
    path('m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65'),
  ],
  headphones: [
    path(
      'M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3',
    ),
  ],
  target: [
    { t: 'circle', cx: 12, cy: 12, r: 10 },
    { t: 'circle', cx: 12, cy: 12, r: 6 },
    { t: 'circle', cx: 12, cy: 12, r: 2 },
  ],
  'trending-up': [path('M22 7 13.5 15.5l-5-5L2 17M16 7h6v6')],
  factory: [
    path('M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z'),
    path('M17 18h1M12 18h1M7 18h1'),
  ],
  'building-2': [
    path('M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z'),
    path('M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4'),
  ],
  'shopping-bag': [path('M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18'), path('M16 10a4 4 0 0 1-8 0')],
  monitor: [{ t: 'rect', x: 2, y: 3, w: 20, h: 14, rx: 2 }, path('M8 21h8M12 17v4')],
  heart: [
    path(
      'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
    ),
  ],
  rocket: [
    path('M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z'),
    path('m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z'),
    path('M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'),
  ],
  handshake: [
    path('m11 17 2 2a1 1 0 1 0 3-3'),
    path(
      'm14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4',
    ),
    path('m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8'),
  ],
  landmark: [
    path('M10 18v-7M14 18v-7M18 18v-7M6 18v-7M3 22h18'),
    path('M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z'),
  ],
  'graduation-cap': [
    path('M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z'),
    path('M22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5'),
  ],
  lightbulb: [
    path('M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5'),
    path('M9 18h6M10 22h4'),
  ],
  'help-circle': [
    { t: 'circle', cx: 12, cy: 12, r: 10 },
    path('M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01'),
  ],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;
