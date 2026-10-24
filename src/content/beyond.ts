/**
 * Beyond (off-duty) content: what Deepanshu is watching, listening to and
 * learning right now, plus life stories (coming soon). Edit this file to update
 * the page; images live in public/images/beyond.
 *
 * Facts here (cast, platforms, dates, tracks) were checked against official
 * listings when added. Personal takes go in `note`, written by Deepanshu.
 */

/** `finished` is recent ("Just finished"); `watched` is a little longer ago. */
export type WatchStatus = 'started' | 'following' | 'finished' | 'watched'

export type WatchItem = {
  id: string
  title: string
  kind: 'Movie' | 'Web series'
  /** e.g. "Season 2" for a series. */
  season?: string
  year: number
  platform: string
  genre: string
  starring: string[]
  logline: string
  status: WatchStatus
  poster: string
  /** YouTube video id of the official trailer. */
  trailer: string
  trailerSource: string
  /** Optional personal take, in Deepanshu's words. */
  note?: string
}

/** A song on the shelf: plays in Spotify's player, or from an official YouTube upload when it isn't on Spotify. */
export type Track = {
  title: string
  /** Spotify track id. */
  spotify?: string
  /** YouTube video id of the official upload (artist or label channel). */
  youtube?: string
}

export type Artist = {
  id: string
  name: string
  scene: string
  /** Shown on the record label: an artist photo, or a release cover. */
  art: string
  artCaption: string
  /** Popular tracks, from the artist's streaming profile, plus picks. */
  tracks: Track[]
  spotifyId: string
  note?: string
}

export type Learning = {
  title: string
  by: string
  where: string
  url: string
  avatar: string
  summary: string
  /** Optional short "today I learned" notes, newest first. */
  notes: string[]
}

export type LifeStory = {
  id: string
  date: string
  title: string
  place?: string
  photos: string[]
  story: string
}

/** When the "now" lists were last refreshed (shown on the page). */
export const nowUpdated = '2026-10-24'

/** Shelf order: what I'm in the middle of first, then what's done. */
const STATUS_ORDER: WatchStatus[] = ['started', 'following', 'finished', 'watched']

/** Add titles in any order: `watching` sorts them by status (keeping this order within a status). */
const watchList: WatchItem[] = [
  {
    id: 'raakh',
    title: 'Raakh',
    kind: 'Web series',
    season: 'Season 1',
    year: 2026,
    platform: 'Prime Video',
    genre: 'Crime thriller',
    starring: ['Ali Fazal', 'Sonali Bendre', 'Aamir Bashir'],
    logline: 'Late-1970s Delhi: Sub-Inspector Jayprakash hunts two killers, in a story inspired by a real case that shook the city.',
    status: 'started',
    poster: '/images/beyond/raakh.webp',
    trailer: 'RdB_TgwLPqs',
    trailerSource: 'Prime Video India',
  },
  {
    id: 'awarapan-2',
    title: 'Awarapan 2',
    kind: 'Movie',
    year: 2026,
    platform: 'Prime Video',
    genre: 'Action romance',
    starring: ['Emraan Hashmi', 'Disha Patani', 'Shabana Azmi'],
    logline: 'Emraan Hashmi returns as Shivam Pandit, nineteen years after the original Awarapan.',
    status: 'finished',
    poster: '/images/beyond/awarapan-2.webp',
    trailer: '1ya87ENCRj0',
    trailerSource: 'Vishesh Films',
  },
  {
    id: 'ali-baba-aur-40-bhoot',
    title: 'Ali Baba aur 40 Bhoot',
    kind: 'Web series',
    season: 'Season 1',
    year: 2026,
    platform: 'JioHotstar',
    genre: 'Horror comedy',
    starring: ['Asha Negi', 'Vishal Vashishtha'],
    logline: 'The Ali Baba tale with a supernatural twist: forty ghosts instead of forty thieves.',
    status: 'following',
    poster: '/images/beyond/ali-baba-aur-40-bhoot.webp',
    trailer: 'JgAzXJo-q6g',
    trailerSource: 'JioHotstar',
  },
  {
    id: 'dupahiya-s2',
    title: 'Dupahiya',
    kind: 'Web series',
    season: 'Season 2',
    year: 2026,
    platform: 'Prime Video',
    genre: 'Comedy drama',
    starring: ['Gajraj Rao', 'Renuka Shahane', 'Sparsh Shrivastava', 'Bhuvan Arora'],
    logline: 'Back to Dhadakpur, with bigger stakes and more chaos than the first season.',
    status: 'watched',
    poster: '/images/beyond/dupahiya-s2.webp',
    trailer: 'xjR518LxjZE',
    trailerSource: 'Prime Video India',
  },
  {
    id: 'house-of-the-dragon-s3',
    title: 'House of the Dragon',
    kind: 'Web series',
    season: 'Season 3',
    year: 2026,
    platform: 'JioHotstar',
    genre: 'Fantasy drama',
    starring: ['Emma D’Arcy', 'Matt Smith', 'Olivia Cooke'],
    logline: 'The Targaryen civil war, the Dance of the Dragons, turns into all-out war for the Iron Throne.',
    status: 'watched',
    poster: '/images/beyond/house-of-the-dragon-s3.webp',
    trailer: '0JlMjgqduVw',
    trailerSource: 'HBO Max',
  },
]

export const watching: WatchItem[] = [...watchList].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))

export const listening: Artist[] = [
  {
    id: 'cheema-y',
    name: 'Cheema Y',
    scene: 'Punjabi',
    art: '/images/beyond/cheema-y.webp',
    artCaption: 'Cheema Y',
    tracks: [
      { title: 'Jackpot', spotify: '0JOAMHwHFGKbPOwfM26fL7' },
      { title: 'Snap', youtube: 'GlotkxiPtog' },
      { title: 'Takde Gharde', youtube: 'wJq0S4QUBAg' },
      { title: 'Young G.O.A.T', spotify: '6xHPBEvcG0RQDfyTq7jc8P' },
    ],
    spotifyId: '0uOUeC51AxGnP6hB8gurwt',
  },
  {
    id: 'vikram-sarkar',
    name: 'Vikram Sarkar',
    scene: 'Haryanvi',
    art: '/images/beyond/vikram-sarkar.webp',
    artCaption: 'Cover of “Scene”',
    tracks: [
      { title: 'Champ', spotify: '7rrNWWMx4rOgiJBOPaSGgA' },
      { title: 'Gaadi 150', spotify: '0qNMptHdkQuZsWKxZ8rmW2' },
      { title: 'Falani', spotify: '1KdTSJm0SxliAg24quxw5i' },
      { title: 'Scene', spotify: '6qLDRFfqvBJDgA2NMZRUEy' },
    ],
    spotifyId: '4naSOUBsPQeISuibs56w6Y',
  },
  {
    id: 'dhanda-nyoliwala',
    name: 'Dhanda Nyoliwala',
    scene: 'Haryanvi',
    art: '/images/beyond/dhanda-nyoliwala.webp',
    artCaption: 'Dhanda Nyoliwala',
    tracks: [
      { title: 'Maruti', spotify: '4EellE2v4gDuZaHVIMiZKO' },
      { title: 'Kath Lagda', spotify: '3zoM4v1qTX94ZqfPYRReJh' },
      { title: 'Boom Shaka', spotify: '1g6nQTE5x7eLJX7tXCTiSz' },
      { title: 'Russian Bandana', spotify: '1dFrZr9eMUsFqeag04ClqD' },
    ],
    spotifyId: '2rN8LHqK4TBI7y3d9POvJb',
  },
  {
    id: 'gaamdi-aala',
    name: 'Gaamdi Aala',
    scene: 'Haryanvi',
    art: '/images/beyond/gaamdi-aala.webp',
    artCaption: 'Gaamdi Aala',
    // Writes and composes his own songs. Nache Se Bholanath (2026) plays from his own YouTube channel.
    tracks: [
      { title: 'Vanvaasi', spotify: '5GQeeraYS11eSvkFBNnOpu' },
      { title: 'Bhaang Ragad Ke Piya Karu', spotify: '4pHbKACNY8Pdn2h2U66Z5m' },
      { title: 'Nache Se Bholanath', youtube: 'jQugd9DsYyw' },
      { title: 'Saans', spotify: '0C52eF65FFDeXdc9CxdWJz' },
    ],
    spotifyId: '4wasuLT30nGYqYF0SVA6kf',
  },
]

export const learning: Learning = {
  title: 'JavaScript Mastery',
  by: 'Adrian Hajdin',
  where: 'YouTube',
  url: 'https://www.youtube.com/@javascriptmastery',
  avatar: '/images/beyond/javascript-mastery.webp',
  summary: 'Project-based builds of real, modern web apps, from the first commit to deployment.',
  notes: [],
}

/**
 * Our family vlog. Numbers are a snapshot (checked 16 Oct 2026); refresh them
 * now and then. No photos or videos here on purpose: just the channel.
 */
export const familyChannel = {
  name: 'Doli & Deepanshu',
  handle: '@doliwithdeep',
  tagline: 'Love, Laugh, Repeat',
  about: 'Our couple and family vlog: mini vlogs, little celebrations and everyday moments with my wife Doli, our family and, since this year, our son.',
  /** Shown while the channel is quiet. Set to '' when we're posting again. */
  pause: 'On a little break while we raise our little one. More soon.',
  avatar: '/images/beyond/vlog/channel.webp',
  youtube: { url: 'https://www.youtube.com/@DoliwithDeep', handle: '@DoliwithDeep' },
  instagram: { url: 'https://www.instagram.com/doliwithdeep/', handle: '@doliwithdeep' },
  /** Big numbers on the banner; `value` counts up (to `decimals` places), `suffix` follows it. */
  stats: [
    { value: 4.3, decimals: 1, suffix: 'M+', label: 'YouTube views' },
    { value: 3, suffix: 'K', label: 'YouTube subscribers' },
    { value: 41, suffix: '', label: 'Shorts posted' },
    { value: 780, suffix: '+', label: 'Instagram followers' },
    { value: 8, suffix: '', label: 'Instagram posts' },
  ],
  /** Our story so far, from what we've shared publicly. */
  story: [
    { when: 'Jan 2020', what: 'Where it started', detail: 'Delhi to Panipat: it began with the distance' },
    { when: 'Apr 2025', what: 'Married', detail: '“Forever” stopped being just a word' },
    { when: 'Feb 2026', what: 'DoliwithDeep begins', detail: 'Our first mini vlogs go up' },
    { when: '2026', what: 'Our son arrives', detail: 'Our little one joins the vlogs' },
    { when: 'Now', what: 'A little break', detail: 'Busy with the baby. Back soon' },
  ],
}

/** Life stories: empty for now, so the page shows them as "developing". */
export const lifeStories: LifeStory[] = []
