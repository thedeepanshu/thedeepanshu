export type Mission = {
  id: string
  number: string
  type: string
  title: string
  role: string
  period: string
  status: string
  summary: string
  /** What made the work hard. */
  challenge: string
  /** How it was tackled. */
  approach: string
  highlights: string[]
  technologies: string[]
  link?: { label: string; url: string }
  /** Shown when the product itself can't be named or linked. */
  note?: string
  visual: {
    src: string
    alt: string
    /** Address shown in the browser-frame bar. */
    frameLabel: string
    /** Set for illustrative mocks of internal products. */
    mock?: boolean
  }
}

export const missions: Mission[] = [
  {
    id: 'operations-dashboards',
    number: '01',
    type: 'Professional / ANRX Solutions',
    title: 'Operations dashboard platform',
    role: 'Sole frontend developer',
    period: 'Oct 2021 – Aug 2026',
    status: 'Live in production',
    summary: 'React dashboards that business teams used every day to run large-scale operations: dense data tables, live notifications and maps of thousands of locations.',
    challenge: 'Large operational datasets had to stay fast and readable in the browser, and the product had to keep evolving while people relied on it all day.',
    approach: 'Reusable React components, Redux-managed state and memoised data tables with server-side search, filtering, sorting and pagination, delivered in Agile sprints with backend, design and QA.',
    highlights: [
      'Data tables with nested rows, server-driven search, filtering, sorting and pagination, kept responsive with memoisation.',
      'Google Maps interfaces with marker clustering, feature layers, polygon and boundary rendering, and geocoding for thousands of locations.',
      'Real-time WebSocket notifications with leader election, so a dropped connection is reassigned without duplicate updates.',
      'Charts and GA4 event tracking for interactions, downloads and engagement, feeding product decisions.',
      'Figma designs translated into responsive, documented components.',
    ],
    technologies: ['React', 'JavaScript', 'Redux', 'Redux Toolkit', 'Context API', 'REST APIs', 'Google Maps API', 'WebSockets', 'Chart.js', 'GA4'],
    note: 'Internal business application: no public link, and the visual is an illustrative mock with made-up data.',
    visual: {
      src: '/images/missions/operations-dashboards.webp',
      alt: 'Illustrative mock of an operations dashboard: KPI cards, a locations table with nested rows and status pills, and a clustered live map.',
      frameLabel: 'operations dashboard · illustrative mock',
      mock: true,
    },
  },
  {
    id: 'platform-rebuild',
    number: '02',
    type: 'Professional / ANRX Solutions',
    title: 'Ground-up platform rebuild',
    role: 'Frontend developer, with senior engineers',
    period: 'Within the ANRX role',
    status: 'Built alongside the live product',
    summary: 'A rebuild of the operations platform on a modern, typed frontend stack, developed while the previous version stayed in daily use.',
    challenge: 'Two versions had to move forward at once: the legacy platform still needed fixes and features while the new one was being built.',
    approach: 'Worked with senior engineers on a TypeScript foundation with schema validation, typed server state and documented, tested components.',
    highlights: [
      'TypeScript across the new frontend, with Zod schemas validating data at the edges.',
      'TanStack Query for server state and Jotai for client state.',
      'Forms built with React Hook Form and Zod.',
      'Components documented in Storybook and tested with Jest.',
      'Kept delivering bug fixes and features on the legacy platform in parallel.',
    ],
    technologies: ['TypeScript', 'React', 'Jotai', 'Zod', 'TanStack Query', 'React Hook Form', 'Storybook', 'Jest'],
    note: 'Internal business application: no public link, and the visual is an illustrative mock with made-up data.',
    visual: {
      src: '/images/missions/platform-rebuild.webp',
      alt: 'Illustrative mock of a component workbench: a location form showing an inline validation error, its Zod schema, and passing tests.',
      frameLabel: 'component workbench · illustrative mock',
      mock: true,
    },
  },
  {
    id: 'alec-ev-hybrid',
    number: '03',
    type: 'Client / Independent project',
    title: 'Alec EV & Hybrid Battery Services',
    role: 'Solo developer, end to end',
    period: 'May 2026 – Jun 2026',
    status: 'Live',
    summary: 'A 0→1 business website for an EV and hybrid battery service company in Canada, from requirements to deployment and ongoing maintenance.',
    challenge: 'A small business needed a site that ranks, loads fast and turns visitors into calls and messages, with one developer owning everything.',
    approach: 'Next.js and Tailwind for a fast, responsive build, technical SEO from day one, and conversion paths wired straight into analytics.',
    highlights: [
      'Technical SEO: metadata, canonical URLs, structured data, sitemap and robots.txt, plus Core Web Vitals work and Search Console.',
      'Lead generation through WhatsApp, contact forms, click-to-call and interactive Google Maps.',
      'GA4 and Google Ads conversion tracking on every lead action.',
      'Domain set up on Namecheap, with production deploys automated through Vercel CI/CD.',
      'Worked directly with the client from requirements through launch and maintenance.',
    ],
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Google Maps', 'GA4', 'Google Ads', 'Search Console', 'Vercel'],
    link: { label: 'alecevhybrid.com', url: 'https://alecevhybrid.com' },
    visual: {
      src: '/images/missions/alec-ev.webp',
      alt: 'The Alec EV & Hybrid Battery Services home page: headline, call and booking buttons, and trust stats.',
      frameLabel: 'alecevhybrid.com',
    },
  },
  {
    id: 'the-vessel',
    number: '04',
    type: 'Personal / This website',
    title: 'The Vessel',
    role: 'Design and development',
    period: '2026',
    status: 'In progress',
    summary: 'This portfolio: one persistent WebGL world in which every page is a deck of a ship, connected by warp flights.',
    challenge: 'Make a portfolio feel like a cinematic, explorable place without sacrificing readability, performance on phones or accessibility.',
    approach: 'A single React Three Fiber canvas behind every route, custom GLSL shaders, quality tiers that adapt to the device, and a calm path for reduced motion.',
    highlights: [
      'Starfield and nebula shaders with camera flights and light-speed warp streaks between routes.',
      'A 42,000-particle core that morphs from static into a name, then bursts into the stars, all in the vertex shader.',
      'A welcome sequence that doubles as the real loader.',
      'Procedural ambient sound with the Web Audio API, with no audio files.',
      'Automatic quality downgrade, a reduced-motion version and keyboard-safe overlays.',
    ],
    technologies: ['React', 'TypeScript', 'React Three Fiber', 'Three.js', 'GLSL', 'Zustand', 'Web Audio API', 'Vite'],
    link: { label: 'You are here', url: '/' },
    visual: {
      src: '/images/missions/the-vessel.webp',
      alt: 'This portfolio’s home page: the pilot hologram with the reveal lens showing the developer’s face behind the visor.',
      frameLabel: 'thedeepanshu.vercel.app',
    },
  },
]

export type SkillCategory =
  | 'all'
  | 'core-frontend'
  | 'state-data'
  | 'ui-styling'
  | 'testing-forms'
  | 'performance-accessibility'
  | 'tools-analytics'
  | 'ai-coding'
  | 'technical-exposure'

export type Skill = {
  id: string
  name: string
  category: Exclude<SkillCategory, 'all'>
  categoryLabel: string
  description: string
  tags: string[]
}

export const skills: Skill[] = [
  {
    id: 'core-frontend',
    name: 'Core Frontend',
    category: 'core-frontend',
    categoryLabel: 'Core Frontend',
    description: 'Languages and frameworks for building web interfaces, from semantic markup and styling to React applications and localization.',
    tags: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript', 'React', 'Next.js', 'i18n / Localization'],
  },
  {
    id: 'state-data',
    name: 'State & Data',
    category: 'state-data',
    categoryLabel: 'State Management',
    description: 'React patterns and libraries for managing client-side state and data fetched from APIs.',
    tags: ['React Hooks', 'Redux', 'Redux Toolkit', 'Context API', 'TanStack Query', 'Jotai', 'Zustand'],
  },
  {
    id: 'ui-styling',
    name: 'UI & Styling',
    category: 'ui-styling',
    categoryLabel: 'UI & Styling',
    description: 'CSS frameworks, component libraries, and preprocessors for styling web interfaces.',
    tags: ['Bootstrap', 'Tailwind CSS', 'Material UI', 'Sass (SCSS)', 'LESS'],
  },
  {
    id: 'testing-forms',
    name: 'Testing, Forms & Validation',
    category: 'testing-forms',
    categoryLabel: 'Testing & Quality',
    description: 'Tools for component testing, form handling, schema validation, component documentation, and API testing.',
    tags: ['Jest', 'React Testing Library', 'React Hook Form', 'Zod', 'Storybook', 'Postman'],
  },
  {
    id: 'performance-accessibility',
    name: 'Performance & Accessibility',
    category: 'performance-accessibility',
    categoryLabel: 'Performance & Accessibility',
    description: 'Standards and tools for accessibility reviews, browser compatibility, and web performance checks.',
    tags: ['WCAG', 'Cross-Browser Compatibility', 'Lighthouse', 'Core Web Vitals', 'Accessibility Testing'],
  },
  {
    id: 'tools-analytics',
    name: 'Tools & Analytics',
    category: 'tools-analytics',
    categoryLabel: 'Tools & Analytics',
    description: 'Version control, local development and debugging tools, build tooling, and product analytics.',
    tags: ['Git & GitHub', 'npm', 'Vite', 'Chrome DevTools', 'VS Code', 'Google Analytics 4 (GA4)'],
  },
  {
    id: 'ai-coding',
    name: 'AI Coding Tools',
    category: 'ai-coding',
    categoryLabel: 'AI-Assisted Development',
    description: 'AI coding assistants used to support code authoring, problem-solving, and agent-assisted workflows.',
    tags: ['Claude', 'Claude Code', 'GitHub Copilot', 'ChatGPT', 'Gemini'],
  },
  {
    id: 'technical-exposure',
    name: 'Technical Exposure',
    category: 'technical-exposure',
    categoryLabel: 'Additional Technologies',
    description: 'Technologies beyond the core frontend toolkit, spanning Vue, server-side JavaScript, and databases.',
    tags: ['Vue.js', 'Next.js API Routes', 'Node.js', 'Express.js', 'MongoDB', 'Mongoose'],
  },
]

export type Experiment = {
  id: string
  number: string
  title: string
  categoryLabel: string
  status: string
  description: string
  technologies: string[]
  /** Every system runs in the site itself; the card links to where to see it. */
  liveOn: { label: string; path: string }
}

export const experiments: Experiment[] = [
  {
    id: 'warp-starfield',
    number: '01',
    title: 'Warp starfield',
    categoryLabel: 'WebGL / GLSL',
    status: 'running live',
    description: 'Seven thousand shader-driven stars wrapped around the camera, so the field never runs out. Streaks follow the camera’s real velocity during a warp jump, and chromatic aberration peaks mid-flight.',
    technologies: ['Three.js', 'GLSL', 'React Three Fiber', 'Post-processing'],
    liveOn: { label: 'Jump to any deck to trigger a warp', path: '/journey' },
  },
  {
    id: 'particle-core',
    number: '02',
    title: 'Particle core',
    categoryLabel: 'WebGL / GLSL',
    status: 'running live',
    description: 'A 42,000-point swarm that morphs from static into a name and bursts into the stars on boarding, entirely in the vertex shader with staggered timing. The cursor pushes particles away in screen space.',
    technologies: ['Three.js', 'GLSL', 'Canvas text sampling', 'Additive blending'],
    liveOn: { label: 'Reload to see it on the welcome screen', path: '/' },
  },
  {
    id: 'procedural-ambience',
    number: '03',
    title: 'Procedural ambience',
    categoryLabel: 'Web Audio',
    status: 'running live',
    description: 'The ship’s sound is synthesised in the browser: a warm pad gliding through four chords, a soft sub, sparse bell tones and a generated hall reverb, plus a whoosh on every warp and quiet UI ticks. There are no audio files.',
    technologies: ['Web Audio API', 'TypeScript'],
    liveOn: { label: 'Turn on sound, bottom right', path: '/' },
  },
  {
    id: 'pilot-reveal',
    number: '04',
    title: 'Pilot reveal lens',
    categoryLabel: 'WebGL / GLSL',
    status: 'running live',
    description: 'The pilot on the home page is two images on one shader plane: the helmeted pilot on top and my photo underneath. A soft lens follows the cursor and dissolves the suit inside it, with a wobbling edge, a glowing ring and fine scan lines. On touch screens you drag to reveal, and an occasional automatic scan hints that it’s there.',
    technologies: ['Three.js', 'GLSL', 'React Three Fiber', 'Texture masking'],
    liveOn: { label: 'Hover over the pilot on the home page', path: '/' },
  },
]

export type MemoryCategory = 'all' | 'life' | 'anime-art' | 'inspirations'

export type Memory = {
  id: string
  number: string
  title: string
  category: Exclude<MemoryCategory, 'all'>
  categoryLabel: string
  type: 'image-frame' | 'quote-card' | 'media-clip'
  quoteOrCaption: string
  subtitle?: string
  details?: string
  tags: string[]
  trackUrl?: string
  gradientStyle?: string
  /** Placeholder content to replace with real memories before launch. */
  demo?: boolean
}

// DEMO CONTENT: every entry below is a placeholder written to show how the
// archive looks when it's full. Replace them with real memories (or delete them)
// before publishing. Search the codebase for "demo: true" to find them all.
export const memories: Memory[] = [
  {
    id: 'demo-neon-rain',
    number: '01',
    title: 'Neon & rain',
    category: 'anime-art',
    categoryLabel: 'Anime & Art',
    type: 'image-frame',
    subtitle: 'Moodboard',
    quoteOrCaption: 'Night-city palettes: wet streets, cyan signage, violet haze. The reason this site glows the way it does.',
    tags: ['cyberpunk', 'color', 'moodboard'],
    gradientStyle: 'radial-gradient(circle at 70% 20%, rgba(126, 244, 219, .22), transparent 40%), radial-gradient(circle at 20% 80%, rgba(161, 126, 255, .22), transparent 45%), linear-gradient(150deg, #13232b, #0a1015)',
    demo: true,
  },
  {
    id: 'demo-clarke',
    number: '02',
    title: 'On magic',
    category: 'inspirations',
    categoryLabel: 'Inspirations',
    type: 'quote-card',
    subtitle: 'Arthur C. Clarke',
    quoteOrCaption: 'Any sufficiently advanced technology is indistinguishable from magic.',
    details: 'Good interfaces hide the machinery. That’s the bar.',
    tags: ['sci-fi', 'craft'],
    gradientStyle: 'linear-gradient(140deg, #2a2552, #121327)',
    demo: true,
  },
  {
    id: 'demo-late-shift',
    number: '03',
    title: 'Late-shift builds',
    category: 'life',
    categoryLabel: 'Life & Frames',
    type: 'image-frame',
    subtitle: 'Desk, 2 a.m.',
    quoteOrCaption: 'Headphones on, one lamp, one more commit before calling it a night.',
    tags: ['workflow', 'night'],
    gradientStyle: 'radial-gradient(circle at 30% 30%, rgba(255, 196, 140, .14), transparent 40%), linear-gradient(150deg, #1b1f24, #0b0f12)',
    demo: true,
  },
  {
    id: 'demo-victor',
    number: '04',
    title: 'Immediate connection',
    category: 'inspirations',
    categoryLabel: 'Inspirations',
    type: 'quote-card',
    subtitle: 'Bret Victor, “Inventing on Principle”',
    quoteOrCaption: 'Creators need an immediate connection to what they’re creating.',
    details: 'Why I build with hot reload, live previews and a browser always open.',
    tags: ['talks', 'tools'],
    gradientStyle: 'linear-gradient(140deg, #123238, #0b1418)',
    demo: true,
  },
  {
    id: 'demo-mecha-studies',
    number: '05',
    title: 'Mecha studies',
    category: 'anime-art',
    categoryLabel: 'Anime & Art',
    type: 'image-frame',
    subtitle: 'Sketchbook',
    quoteOrCaption: 'Panel lines, thrusters, hard angles: the ship this site imagines started as doodles like these.',
    tags: ['sketching', 'mecha', '3d'],
    gradientStyle: 'radial-gradient(circle at 80% 70%, rgba(131, 183, 255, .2), transparent 45%), linear-gradient(150deg, #151d2c, #0a0f16)',
    demo: true,
  },
  {
    id: 'demo-focus-soundtrack',
    number: '06',
    title: 'Focus soundtrack',
    category: 'life',
    categoryLabel: 'Life & Frames',
    type: 'media-clip',
    subtitle: 'On repeat',
    quoteOrCaption: 'Synthwave and ambient: long tracks, no lyrics, the kind that make four hours feel like one.',
    tags: ['music', 'focus'],
    gradientStyle: 'linear-gradient(140deg, #2b1f45, #0f0d1c)',
    demo: true,
  },
  {
    id: 'demo-rams',
    number: '07',
    title: 'Less, but better',
    category: 'inspirations',
    categoryLabel: 'Inspirations',
    type: 'quote-card',
    subtitle: 'Dieter Rams',
    quoteOrCaption: 'Good design is as little design as possible.',
    details: 'A good check for every glow, particle and animation on this site.',
    tags: ['design', 'restraint'],
    gradientStyle: 'linear-gradient(140deg, #1d2a2c, #0c1213)',
    demo: true,
  },
  {
    id: 'demo-home-sky',
    number: '08',
    title: 'Home sky',
    category: 'life',
    categoryLabel: 'Life & Frames',
    type: 'image-frame',
    subtitle: 'Haryana, at dusk',
    quoteOrCaption: 'Wide fields and a long horizon. Some of the calm on the Observation deck comes from here.',
    tags: ['home', 'sky'],
    gradientStyle: 'radial-gradient(circle at 50% 110%, rgba(255, 170, 120, .18), transparent 50%), linear-gradient(180deg, #1a2238, #0c1220)',
    demo: true,
  },
]

export type MilestoneCategory = 'professional-experience' | 'client-projects' | 'personal-projects' | 'education'

export type Milestone = {
  id: string
  period: string
  periodNote?: string
  title: string
  category: MilestoneCategory
  categoryLabel: string
  summary: string
  narrative: string
  achievements: string[]
  skillsUnlocked: string[]
  status: string
  websiteUrl?: string
  platformEvolution?: {
    legacy: string
    modernization: string
  }
}

export const milestones: Milestone[] = [
  {
    id: 'anrx-solutions-frontend-developer',
    period: '4Y 11M',
    periodNote: 'EXPERIENCE',
    title: 'Frontend Developer — ANRX Solutions',
    category: 'professional-experience',
    categoryLabel: 'Professional experience',
    summary: 'Developed React features for operational dashboards and data-heavy business applications.',
    narrative: 'Worked as the sole frontend developer, collaborating with backend engineers, designers, QA, and senior engineers.',
    platformEvolution: {
      legacy: 'Maintained the large, live application by resolving bugs, delivering new features, and enhancing existing functionality while users continued working in it.',
      modernization: 'Collaborated with senior engineers on a ground-up rebuild while the previous version remained in operation. The new frontend used TypeScript, Jotai, Zod, TanStack Query, React Hook Form, Storybook, and Jest.',
    },
    achievements: [
      'Built reusable React components and responsive features for operational dashboards.',
      'Developed data tables with nested rows, server-side search, filtering, sorting, and pagination; used memoization to improve responsiveness.',
      'Managed application state with Redux, Redux Toolkit, and Context API.',
      'Integrated REST APIs and resolved frontend issues through debugging and refactoring.',
      'Built Google Maps interfaces with marker clustering, feature layers, polygon and boundary rendering, and geocoding for thousands of locations.',
      'Implemented WebSocket notifications with leader-election logic to restore the active connection after disconnects and avoid duplicate updates.',
      'Implemented charts and Google Analytics 4 (GA4) tracking in React components for user interactions, custom events, downloads, and engagement metrics to support data-informed product decisions.',
      'Translated Figma designs into pixel-accurate, responsive components and documented implementation details.',
      'Collaborated with backend engineers, designers, and QA in an Agile/Scrum workflow, contributing to sprint planning, code reviews, and bug fixing.',
      'Adopted an AI-augmented development approach, using AI-assisted tools and agentic workflows to accelerate feature delivery.',
    ],
    skillsUnlocked: ['HTML', 'CSS / LESS', 'JavaScript', 'TypeScript', 'React', 'Redux', 'Redux Toolkit', 'Context API', 'Jotai', 'Zod', 'TanStack Query', 
      'React Hook Form', 'REST APIs', 'Google Maps API', 'Chart.js', 'WebSockets', 'Google Analytics 4', 'Git & Github', 'React / Redux Developer Tools', 
      'Storybook', 'Jest', 'Agile/Scrum Workflow', 'AI-assisted development',],
    status: 'Oct 2021 – Aug 2026',
  },
  {
    id: 'canadian-business-website',
    period: 'CLIENT',
    periodNote: 'CANADA',
    title: 'Alec EV & Hybrid Battery Services',
    category: 'client-projects',
    categoryLabel: 'Client project',
    summary: 'Built and launched a responsive website for an EV and hybrid battery service business in Canada.',
    narrative: 'Worked directly with the client across requirements, development, deployment, and post-launch maintenance.',
    achievements: [
      'Built the website with Next.js, TypeScript, and Tailwind CSS.',
      'Translated business requirements into responsive website features in direct collaboration with the client.',
      'Implemented technical SEO with metadata, canonical URLs, structured data, sitemap, and robots.txt.',
      'Improved Core Web Vitals and connected Google Search Console.',
      'Built contact forms and WhatsApp lead-generation flows.',
      'Added click-to-call actions and interactive Google Maps.',
      'Integrated GA4 and Google Ads conversion tracking for site engagement and lead actions.',
      'Configured the domain through Namecheap and automated production deployments with Vercel CI/CD.',
      'Maintained the website after launch.',
      'Used Claude, ChatGPT, Gemini, and agentic workflows to support implementation and iteration, reviewing generated output during development.',
    ],
    skillsUnlocked: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Google Maps', 'Google Analytics 4', 'Google Search Console', 'Google Ads', 'Lighthouse', 'Fast & Performant', 'SEO optimization', 'Vercel'],
    status: 'Live',
    websiteUrl: 'https://alecevhybrid.com',
  },
  {
    id: 'portfolio-in-progress',
    period: '2026',
    periodNote: 'IN PROGRESS',
    title: 'Building this portfolio',
    category: 'personal-projects',
    categoryLabel: 'Personal project',
    summary: 'The Vessel: a portfolio built as one persistent 3D world, where every page is a deck of a ship.',
    narrative: 'An ongoing personal project in React, TypeScript and React Three Fiber that explores how far cinematic 3D, motion and sound can go on the web while staying readable and accessible.',
    achievements: [
      'Built one WebGL world that persists across every route, with camera flights and warp transitions',
      'Wrote GLSL shaders for the starfield, nebula and a 42,000-particle morphing core',
      'Designed a welcome sequence that doubles as the real loader',
      'Synthesised ambient sound in the browser with the Web Audio API',
      'Added quality tiers for weaker devices and a reduced-motion version',
    ],
    skillsUnlocked: ['React', 'TypeScript', 'React Three Fiber', 'Three.js', 'GLSL', 'Zustand', 'Web Audio API'],
    status: 'in progress',
  },
  {
    id: 'btech-cse-pkg',
    period: 'B.TECH',
    periodNote: 'ON-GOING',
    title: 'B.Tech in Computer Science & Engineering',
    category: 'education',
    categoryLabel: 'Education',
    summary: 'Pursuing a Bachelor of Technology in Computer Science & Engineering.',
    narrative: 'Currently enrolled at PKG Group of Institutions, Panipat, Haryana.',
    achievements: [],
    skillsUnlocked: [],
    status: 'on-going',
  },
  {
    id: 'diploma-cse-gp-sonepat',
    period: '2019',
    periodNote: 'DIPLOMA',
    title: 'Diploma in Computer Science & Engineering',
    category: 'education',
    categoryLabel: 'Education',
    summary: 'Completed a Diploma in Computer Science & Engineering from Government Polytechnic, Sonepat.',
    narrative: 'Studied at Government Polytechnic, Sonepat, Haryana — building an early foundation in computer science fundamentals.',
    achievements: [],
    skillsUnlocked: [],
    status: '2019',
  },
  {
    id: 'secondary-school-ibl',
    period: '2016',
    periodNote: 'CBSE',
    title: 'Secondary School (10th) — CBSE',
    category: 'education',
    categoryLabel: 'Education',
    summary: 'Completed secondary education under the CBSE board.',
    narrative: 'Studied at I.B.(L) Public School, Panipat, Haryana.',
    achievements: [],
    skillsUnlocked: [],
    status: '2016',
  },
]

export type SocialLink = {
  name: string
  handle: string
  url: string
  platform: string
}

export const socialLinks: SocialLink[] = [
  { name: 'Direct Email', handle: 'deepanshusaini971@gmail.com', url: 'mailto:deepanshusaini971@gmail.com', platform: 'Primary Channel' },
  { name: 'WhatsApp', handle: '+91 70151 20411', url: 'https://wa.me/917015120411', platform: 'Instant Signal' },
  { name: 'GitHub', handle: '@thedeepanshu', url: 'https://github.com/thedeepanshu', platform: 'Code Repositories' },
  { name: 'LinkedIn', handle: '@thedeepanshu', url: 'https://www.linkedin.com/in/deepanshu-saini-a97229206/', platform: 'Professional Network' },
  { name: 'Instagram', handle: '@deep22.01', url: 'https://instagram.com/deep22.01', platform: 'Off-Duty Realm' },
]
export type DossierStat = { value: string; label: string }

/** Origin page ("pilot dossier"). Values, languages and traits come from resumeData. */
export const dossier = {
  callsign: 'thedeepanshu',
  name: 'Deepanshu Saini',
  role: 'Frontend Developer',
  specialty: 'React · TypeScript · 3D on the web',
  /** Served from public/images; shown in the dossier ID card and the Signal terminal. */
  portrait: '/images/deepanshu-saini.jpeg',
  stats: [
    { value: '~5 yrs', label: 'shipping production React' },
    { value: '1000s', label: 'of locations on a single map view' },
    { value: '0→1', label: 'client website, built and run solo' },
    { value: '42k', label: 'particles in this site’s welcome' },
  ] satisfies DossierStat[],
  story: [
    'For almost five years I was the sole frontend developer on operations dashboards that business teams relied on every day: dense data tables, maps with thousands of locations and live notifications.',
    'I like the part of a product people actually touch. That means layouts that make complex data readable, interactions that feel immediate and details that give an interface character. I work closely with backend engineers, designers and QA, and I own features from design through testing.',
    'Outside of that, I build to learn. In 2026 I took a client website from zero to launch on my own, and this portfolio is where I push 3D, shaders, motion and sound on the web. I also work AI-augmented every day, and I review everything that ships.',
  ],
  process: [
    { title: 'Understand', description: 'Start from the people using it: the requirements, the edge cases and the real shape of the data.' },
    { title: 'Build in components', description: 'Reusable, typed components, documented where it matters, so features compose instead of piling up.' },
    { title: 'Prove it', description: 'Tests, debugging and performance checks in Lighthouse and DevTools before anything ships.' },
    { title: 'Measure', description: 'Analytics events and real usage show what to improve next.' },
  ],
  focus: [
    'Interactive 3D on the web with Three.js, React Three Fiber and GLSL',
    'AI-augmented development and agentic workflows',
    'B.Tech in Computer Science & Engineering (ongoing)',
  ],
}

export type RouteStop = {
  /** Matches an entry in `milestones`. */
  id: string
  when: string
  title: string
  kind: 'education' | 'work' | 'project'
  ongoing?: boolean
}

/** Career stops in chronological order: the Journey flight path and the Origin teaser. */
export const journeyRoute: RouteStop[] = [
  { id: 'secondary-school-ibl', when: '2016', title: 'Secondary school', kind: 'education' },
  { id: 'diploma-cse-gp-sonepat', when: '2019', title: 'Diploma, CSE', kind: 'education' },
  { id: 'anrx-solutions-frontend-developer', when: '2021 – 2026', title: 'ANRX Solutions', kind: 'work' },
  { id: 'canadian-business-website', when: '2026', title: 'Alec EV & Hybrid', kind: 'project' },
  { id: 'portfolio-in-progress', when: '2026', title: 'The Vessel', kind: 'project', ongoing: true },
  { id: 'btech-cse-pkg', when: 'Ongoing', title: 'B.Tech, CSE', kind: 'education', ongoing: true },
]

/** Signal page: what a recruiter or client most needs to know before writing. */
export const availability = [
  { label: 'Status', value: 'Open to frontend roles', live: true },
  { label: 'Work style', value: 'Remote · Hybrid · Onsite' },
  { label: 'Response', value: 'Replies within 24h' },
]

/** Contact form topics: the email subject starts with the chosen one. */
export const contactTopics = ['A full-time role', 'A freelance project', 'A collaboration', 'Just saying hi']
