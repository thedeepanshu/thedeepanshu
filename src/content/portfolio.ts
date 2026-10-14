export type Mission = {
  number: string
  type: string
  title: string
  summary: string
  technologies: string[]
  status: string
}

export const missions: Mission[] = [
  {
    number: '01',
    type: 'personal project / in progress',
    title: 'thedeepanshu portfolio',
    summary: 'A React portfolio project combining multi-page navigation, a Three.js hero scene, and animated Canvas experiments.',
    technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'React Three Fiber', 'Three.js', 'Canvas 2D'],
    status: 'in progress',
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

export type ExperimentCategory = 'all' | 'canvas-generative'

export type Experiment = {
  id: string
  number: string
  title: string
  category: Exclude<ExperimentCategory, 'all'>
  categoryLabel: string
  status: string
  description: string
  technologies: string[]
  preset: 'particle-field' | 'cyber-grid' | 'aurora-pulse'
}

export const experiments: Experiment[] = [
  {
    id: 'particle-field',
    number: '01',
    title: 'Particle field',
    category: 'canvas-generative',
    categoryLabel: 'Canvas 2D',
    status: 'animated preview',
    description: 'A Canvas 2D animation with moving points and lines drawn between nearby points.',
    technologies: ['Canvas 2D', 'React'],
    preset: 'particle-field',
  },
  {
    id: 'perspective-grid',
    number: '02',
    title: 'Perspective grid',
    category: 'canvas-generative',
    categoryLabel: 'Canvas 2D',
    status: 'animated preview',
    description: 'A Canvas 2D perspective grid with a moving horizon and scrolling lines.',
    technologies: ['Canvas 2D', 'React'],
    preset: 'cyber-grid',
  },
  {
    id: 'gradient-fields',
    number: '03',
    title: 'Gradient fields',
    category: 'canvas-generative',
    categoryLabel: 'Canvas 2D',
    status: 'animated preview',
    description: 'A Canvas 2D preview of layered radial gradients moving across the frame.',
    technologies: ['Canvas 2D', 'React'],
    preset: 'aurora-pulse',
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
}

export const memories: Memory[] = []

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
    summary: 'An ongoing personal project built with React and TypeScript.',
    narrative: 'The current version includes multi-page navigation, a React Three Fiber hero scene, and Canvas 2D previews.',
    achievements: ['Implemented the portfolio routes and shared navigation', 'Added a lazy-loaded 3D hero scene', 'Built animated Canvas 2D previews'],
    skillsUnlocked: ['React', 'TypeScript', 'React Router', 'Three.js', 'Canvas 2D'],
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
  { name: 'Direct Email', handle: 'hello@thedeepanshu.dev', url: 'mailto:hello@thedeepanshu.dev', platform: 'Primary Channel' },
  { name: 'WhatsApp', handle: '+91 70151 20411', url: 'https://wa.me/917015120411', platform: 'Instant Signal' },
  { name: 'GitHub', handle: '@thedeepanshu', url: 'https://github.com/thedeepanshu', platform: 'Code Repositories' },
  { name: 'LinkedIn', handle: '@thedeepanshu', url: 'https://www.linkedin.com/in/deepanshu-saini-a97229206/', platform: 'Professional Network' },
  { name: 'Instagram', handle: '@deep22.01', url: 'https://instagram.com/deep22.01', platform: 'Off-Duty Realm' },
]