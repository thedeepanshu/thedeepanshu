export type ArchitectureItem = {
  label: string
  detail: string
}

export type Mission = {
  slug: string
  number: string
  type: string
  title: string
  tagline: string
  summary: string
  overview: string
  challenge: string
  solution: string
  outcome: string
  technologies: string[]
  status: string
  year: string
  role: string
  clientOrContext: string
  liveUrl?: string
  sourceUrl?: string
  highlights: string[]
  architecture: ArchitectureItem[]
}

export const missions: Mission[] = [
  {
    slug: 'portfolio-system',
    number: '01',
    type: 'immersive interface / featured',
    title: 'The portfolio system',
    tagline: 'An anime-inspired 3D digital world built with React, WebGL, and motion design.',
    summary: 'A cinematic personal world built around motion, 3D scenes, and a living archive of ideas.',
    overview:
      'The portfolio system is a personal digital world engineered to showcase projects, experiments, and creative vision. Rather than presenting a static resume, it creates an atmospheric anime-sci-fi studio with interactive 3D hero scenes, responsive HUD elements, and seamless page routing.',
    challenge:
      'Balancing high-end WebGL graphics, 3D scene rendering, and rich CSS animations with lightning-fast initial page loads and 60fps performance across mobile and desktop devices.',
    solution:
      'Built with React 19, TypeScript, and Vite. Employed code-splitting and dynamic Suspense imports for heavy React Three Fiber and Three.js 3D bundles, combined with hardware-accelerated CSS keyframe animations for background layers.',
    outcome:
      'Achieved instantaneous first-paint initial load (< 250kB initial JS bundle) while rendering an immersive, interactive 3D builder and vehicle scene on demand.',
    technologies: ['React 19', 'TypeScript', 'Vite', 'React Three Fiber', 'Three.js', 'Framer Motion', 'React Router'],
    status: 'building now',
    year: '2026',
    role: 'Lead Architect & Creator',
    clientOrContext: 'Personal Digital Identity',
    liveUrl: 'https://thedeepanshu.dev',
    sourceUrl: 'https://github.com/thedeepanshu/pp-portfolio',
    highlights: [
      'Interactive 3D WebGL hero scene with dynamic orbital mechanics & camera controls',
      'Lazy-loaded scene architecture keeping main JavaScript bundle under 250kB',
      'Responsive anime-sci-fi visual language with custom CSS variable design tokens',
      'Unified multi-page chapter routing system covering work, skills, life archive, and contact',
    ],
    architecture: [
      { label: 'Frontend Engine', detail: 'React 19 + TypeScript + Vite' },
      { label: '3D Layer', detail: 'Three.js + React Three Fiber + Drei' },
      { label: 'Router & State', detail: 'React Router v7 + React Hooks' },
      { label: 'Styling System', detail: 'Custom HSL CSS tokens + Glassmorphism HUD' },
    ],
  },
  {
    slug: 'signal-intelligence',
    number: '02',
    type: 'AI experience / concept',
    title: 'Signal intelligence',
    tagline: 'Human-centric spatial AI interfaces designed for expressive visual exploration.',
    summary: 'An early direction for making AI tools feel more human, visual, and expressive.',
    overview:
      'Signal Intelligence is an experimental interface exploring how generative AI systems can communicate visual intent, workspace state, and prompt progression through expressive UI patterns rather than plain text streams.',
    challenge:
      'Most AI chat interfaces feel sterile and monolithic. The challenge was designing a fluid, multi-modal interface that reveals real-time AI reasoning and multi-threaded agent tasks clearly.',
    solution:
      'Created a node-based spatial canvas interface with custom visual pulse indicators, real-time reactive task cards, and context-aware theme shifts.',
    outcome:
      'Prototyped a highly responsive user experience that reduces cognitive load when managing complex multi-step AI workflows.',
    technologies: ['React', 'TypeScript', 'AI APIs', 'Framer Motion', 'Tailwind CSS', 'Canvas API'],
    status: 'in the lab',
    year: '2026',
    role: 'Product Designer & Frontend Engineer',
    clientOrContext: 'Experimental AI Lab',
    liveUrl: 'https://signal.thedeepanshu.dev',
    sourceUrl: 'https://github.com/thedeepanshu/signal-intelligence',
    highlights: [
      'Spatial canvas navigation for managing concurrent multi-agent thought streams',
      'Real-time status indicators with zero-latency visual feedback',
      'Custom theme engine reacting dynamically to agent confidence scores',
    ],
    architecture: [
      { label: 'UI Framework', detail: 'React + TypeScript' },
      { label: 'Canvas Rendering', detail: 'HTML5 Canvas API + Framer Motion' },
      { label: 'State Pipeline', detail: 'RxJS Streams + WebSocket' },
    ],
  },
  {
    slug: 'unknown-territory',
    number: '03',
    type: 'creative system / upcoming',
    title: 'Unknown territory',
    tagline: 'Generative shader art and spatial web experiments pushing browser boundaries.',
    summary: 'The next experiment has not been named yet. That is part of the fun.',
    overview:
      'Unknown Territory is an ongoing research initiative dedicated to procedural Shader visualizer loops, Web Audio API reactivity, and GPU-driven particle simulations in web browsers.',
    challenge:
      'Executing millions of particles and complex raymarching shaders directly on standard web clients without causing frame drops or high memory overhead.',
    solution:
      'Custom WebGL fragment shaders paired with GPGPU particle physics calculations inside React Three Fiber frame loops.',
    outcome:
      'Demonstrated 60fps fluid visualizer simulations running directly inside standard mobile web views.',
    technologies: ['GLSL Shaders', 'Three.js', 'Web Audio API', 'React', 'WebGL 2.0'],
    status: 'signal pending',
    year: '2026',
    role: 'Creative Technologist',
    clientOrContext: 'R&D Exploration',
    liveUrl: 'https://lab.thedeepanshu.dev',
    highlights: [
      'GPGPU particle simulation handling 100,000+ interactive elements',
      'Web Audio API frequency analysis driving procedural shader uniforms',
      'Lightweight web GLSL shaders optimized for mobile GPU architectures',
    ],
    architecture: [
      { label: 'Shader Language', detail: 'GLSL ES 3.0' },
      { label: 'Audio Engine', detail: 'Web Audio API FFT Analyzer' },
      { label: '3D Pipeline', detail: 'WebGL 2.0 + Three.js Custom Shaders' },
    ],
  },
]

export type SkillCategory = 'all' | 'frontend' | 'spatial-3d' | 'ai-systems' | 'motion-ux' | 'tooling'

export type Skill = {
  id: string
  name: string
  category: Exclude<SkillCategory, 'all'>
  categoryLabel: string
  level: string
  experience: string
  description: string
  tags: string[]
  status: string
}

export const skills: Skill[] = [
  {
    id: 'react-ts',
    name: 'React 19 & TypeScript',
    category: 'frontend',
    categoryLabel: 'Core Frontend',
    level: 'Mastery',
    experience: 'Core Engine',
    description: 'Type-safe component architectures, custom hooks pipelines, state orchestration, and performance tuning.',
    tags: ['React 19', 'TypeScript 5', 'JSX/TSX', 'Custom Hooks'],
    status: 'active core',
  },
  {
    id: 'three-webgl',
    name: 'Three.js & WebGL',
    category: 'spatial-3d',
    categoryLabel: '3D & Spatial',
    level: 'Advanced',
    experience: '3D Scenes',
    description: 'Real-time 3D graphics rendering, dynamic lighting, camera path animators, particle arrays, and custom mesh primitives.',
    tags: ['Three.js', 'React Three Fiber', 'Drei', 'Postprocessing'],
    status: 'active core',
  },
  {
    id: 'ai-workflows',
    name: 'AI Agent Architectures',
    category: 'ai-systems',
    categoryLabel: 'AI & Intelligence',
    level: 'Active R&D',
    experience: 'Intelligent UI',
    description: 'Integrating LLM thought streams, spatial node graphs, prompt pipelines, and multi-agent workflow visualizations.',
    tags: ['AI Agents', 'Spatial UI', 'LLM Integration', 'Prompt Engineering'],
    status: 'r&d focus',
  },
  {
    id: 'framer-gsap',
    name: 'Framer Motion & GSAP',
    category: 'motion-ux',
    categoryLabel: 'Motion & UX',
    level: 'Mastery',
    experience: 'Cinematic Motion',
    description: 'Complex scroll-triggered sequences, morphing layouts, micro-animations, physics-based springs, and Lenis smooth scroll.',
    tags: ['Framer Motion', 'GSAP ScrollTrigger', 'Lenis', 'Cinematic Transitions'],
    status: 'active core',
  },
  {
    id: 'vite-tooling',
    name: 'Vite & Build Pipelines',
    category: 'tooling',
    categoryLabel: 'Build & Tooling',
    level: 'Production',
    experience: 'Build System',
    description: 'Code-splitting optimization, dynamic bundle chunking, ESLint rulesets, and zero-config HMR environments.',
    tags: ['Vite', 'Rollup', 'ESLint', 'Prettier'],
    status: 'production ready',
  },
  {
    id: 'glsl-shaders',
    name: 'GLSL Fragment Shaders',
    category: 'spatial-3d',
    categoryLabel: '3D & Spatial',
    level: 'Intermediate',
    experience: 'Shader Physics',
    description: 'Writing custom GPU fragment and vertex shaders for procedural noise, cyber grids, volumetric lighting, and glowing aura effects.',
    tags: ['GLSL', 'Fragment Shaders', 'Vertex Physics', 'Uniforms'],
    status: 'r&d focus',
  },
  {
    id: 'design-systems',
    name: 'CSS Tokens & Glassmorphism',
    category: 'motion-ux',
    categoryLabel: 'Motion & UX',
    level: 'Mastery',
    experience: 'Styling Engine',
    description: 'Architecting design system tokens with raw HSL CSS variables, glass backdrop blurs, neon accents, and responsive layouts.',
    tags: ['Vanilla CSS', 'HSL Tokens', 'Glassmorphism', 'Responsive UX'],
    status: 'active core',
  },
  {
    id: 'nextjs-ssr',
    name: 'Next.js & Server Systems',
    category: 'frontend',
    categoryLabel: 'Core Frontend',
    level: 'Production',
    experience: 'Full Stack',
    description: 'Server components, route handlers, SSG/ISR caching strategies, SEO metadata generators, and edge middleware.',
    tags: ['Next.js', 'React Server Components', 'Edge API', 'SEO'],
    status: 'production ready',
  },
  {
    id: 'perf-optimization',
    name: 'Performance & Lighthouse',
    category: 'tooling',
    categoryLabel: 'Build & Tooling',
    level: 'Advanced',
    experience: 'Optimization',
    description: '60fps frame budgeting, memory leak audit, asset compression (WebP/AVIF/Draco), memoization strategies, and Core Web Vitals.',
    tags: ['Core Web Vitals', 'Code-Splitting', 'Lazy Loading', 'Lighthouse 100'],
    status: 'active core',
  },
  {
    id: 'creative-code',
    name: 'Generative & Canvas API',
    category: 'spatial-3d',
    categoryLabel: '3D & Spatial',
    level: 'Advanced',
    experience: 'Generative Code',
    description: 'Procedural particle systems, mathematical trigonometry motion curves, interactive canvas spotlight, and audio-reactive visuals.',
    tags: ['Canvas 2D API', 'Trigonometry', 'Audio-Reactive', 'Generative Art'],
    status: 'experimental',
  },
]

export type ExperimentCategory = 'all' | 'shaders' | 'canvas-generative' | 'spatial-ui' | 'ai-prototypes'

export type Experiment = {
  id: string
  number: string
  title: string
  category: Exclude<ExperimentCategory, 'all'>
  categoryLabel: string
  status: string
  description: string
  technologies: string[]
  date: string
  preset: 'particle-field' | 'cyber-grid' | 'aurora-pulse'
  codeSnippet?: string
  demoUrl?: string
  sourceUrl?: string
}

export const experiments: Experiment[] = [
  {
    id: 'particle-field-exp',
    number: '01',
    title: 'Reactive Particle Constellation',
    category: 'canvas-generative',
    categoryLabel: 'Generative Canvas',
    status: 'live interactive',
    description: 'An interactive HTML5 Canvas particle physics system that reacts to cursor movement, calculating distance vectors and drawing glowing energy connections.',
    technologies: ['Canvas 2D API', 'Vector Physics', 'Trigonometry', 'React'],
    date: '2026',
    preset: 'particle-field',
    codeSnippet: `// Distance vector physics snippet\nconst dx = p1.x - p2.x;\nconst dy = p1.y - p2.y;\nconst dist = Math.sqrt(dx * dx + dy * dy);\nif (dist < 120) {\n  ctx.strokeStyle = \`rgba(40, 215, 255, \${1 - dist / 120})\`;\n  ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();\n}`,
    demoUrl: 'https://lab.thedeepanshu.dev/particles',
    sourceUrl: 'https://github.com/thedeepanshu/particle-constellation',
  },
  {
    id: 'cyber-grid-exp',
    number: '02',
    title: 'Procedural Synthwave Cyber Grid',
    category: 'shaders',
    categoryLabel: 'Shader Art',
    status: 'prototype v2',
    description: 'A 3D perspective grid calculation rendering neon scanlines and animated horizon pulse waves using procedural math loops.',
    technologies: ['WebGL 2.0', 'GLSL Shaders', 'Perspective Math', 'Three.js'],
    date: '2026',
    preset: 'cyber-grid',
    codeSnippet: `// Perspective grid scanline transform\nconst offset = (time * 60) % 40;\nfor (let y = 0; y < height; y += 40) {\n  const perspectiveY = (y + offset) * (y / height);\n  ctx.strokeRect(0, perspectiveY, width, 1);\n}`,
    demoUrl: 'https://lab.thedeepanshu.dev/cybergrid',
    sourceUrl: 'https://github.com/thedeepanshu/cyber-grid-shader',
  },
  {
    id: 'aurora-pulse-exp',
    number: '03',
    title: 'Volumetric Aurora Plasma Aura',
    category: 'spatial-ui',
    categoryLabel: 'Spatial UI',
    status: 'r&d alpha',
    description: 'Multi-layer radial plasma noise gradients oscillating with dynamic color shifts to create organic glowing aura backdrops.',
    technologies: ['CSS Variables', 'Canvas API', 'Perlin Noise', 'Framer Motion'],
    date: '2026',
    preset: 'aurora-pulse',
    codeSnippet: `// Plasma color oscillation\nconst r = Math.sin(time * 0.002) * 127 + 128;\nconst g = Math.cos(time * 0.003) * 127 + 128;\nconst b = Math.sin(time * 0.001) * 127 + 128;\ngradient.addColorStop(0, \`rgba(\${r}, \${g}, 255, 0.6)\`);`,
    demoUrl: 'https://lab.thedeepanshu.dev/aurora',
    sourceUrl: 'https://github.com/thedeepanshu/aurora-plasma',
  },
  {
    id: 'spatial-ai-node-exp',
    number: '04',
    title: 'Spatial AI Node Thought Graph',
    category: 'ai-prototypes',
    categoryLabel: 'AI Prototypes',
    status: 'concept active',
    description: 'A node-graph layout visualizer rendering real-time agent execution chains, confidence states, and dynamic data links.',
    technologies: ['React 19', 'TypeScript', 'Spatial Graph', 'RxJS'],
    date: '2026',
    preset: 'particle-field',
    codeSnippet: `// Agent execution node state link\ninterface AgentNode {\n  id: string;\n  status: 'thinking' | 'resolved' | 'error';\n  confidence: number;\n  connections: string[];\n}`,
    demoUrl: 'https://lab.thedeepanshu.dev/ai-graph',
    sourceUrl: 'https://github.com/thedeepanshu/spatial-ai-graph',
  },
]

export type MemoryCategory = 'all' | 'life' | 'anime-art' | 'music' | 'inspirations'

export type Memory = {
  id: string
  number: string
  title: string
  category: Exclude<MemoryCategory, 'all'>
  categoryLabel: string
  type: 'image-frame' | 'quote-card' | 'music-player' | 'media-clip'
  quoteOrCaption: string
  subtitle?: string
  details?: string
  tags: string[]
  trackUrl?: string
  gradientStyle?: string
}

export const memories: Memory[] = [
  {
    id: 'cyberpunk-neon-art',
    number: '01',
    title: 'Neon Skyline & Sci-Fi Realism',
    category: 'anime-art',
    categoryLabel: 'Anime & Art',
    type: 'image-frame',
    quoteOrCaption: 'Atmosphere is not an afterthought; it is the soul of spatial design.',
    subtitle: 'Cyberpunk Edgerunners & Akira World Building',
    details: 'Visual inspiration drawn from high-contrast Japanese animation, volumetric neon fog, and industrial futuristic architecture.',
    tags: ['Anime Aesthetics', 'Cyberpunk', 'Volumetric Light', 'World Building'],
    gradientStyle: 'linear-gradient(135deg, rgba(40, 215, 255, 0.25), rgba(139, 92, 255, 0.25))',
  },
  {
    id: 'night-city-code',
    number: '02',
    title: 'Midnight Coding Sessions',
    category: 'life',
    categoryLabel: 'Life & Frames',
    type: 'image-frame',
    quoteOrCaption: 'The quiet hours between 1 AM and 4 AM are where complex architectures become clear.',
    subtitle: 'Workspace Atmosphere',
    details: 'Dark room, mechanical keyboard clacks, ambient synthwave loops, and terminal logs scrolling by.',
    tags: ['Night Owl', 'Flow State', 'Setup', 'Deep Work'],
    gradientStyle: 'linear-gradient(135deg, rgba(16, 32, 40, 0.9), rgba(8, 14, 18, 0.95))',
  },
  {
    id: 'synthwave-soundtrack',
    number: '03',
    title: 'Pulse Wave Resonance',
    category: 'music',
    categoryLabel: 'Music & Playlists',
    type: 'music-player',
    quoteOrCaption: 'BPM 110 • Synthwave / Darksynth / Lofi Beats',
    subtitle: 'Track: Midnight Signal (Extended Loop)',
    details: 'Continuous ambient beats driving focus during 3D WebGL shader programming.',
    tags: ['Synthwave', 'Darksynth', 'Lofi Focus', '110 BPM'],
    trackUrl: 'https://open.spotify.com',
    gradientStyle: 'linear-gradient(135deg, rgba(139, 92, 255, 0.3), rgba(240, 77, 255, 0.2))',
  },
  {
    id: 'dieter-rams-ethos',
    number: '04',
    title: 'Good Design is as Little Design as Possible',
    category: 'inspirations',
    categoryLabel: 'Inspirations',
    type: 'quote-card',
    quoteOrCaption: 'Minimalism is not the absence of density; it is the presence of intent.',
    subtitle: 'Dieter Rams & Functional Futurism',
    details: 'Striving for interfaces that feel powerful without being cluttered, balancing sci-fi density with usability.',
    tags: ['Design Philosophy', 'Minimalism', 'Functionalism', 'Intentionality'],
    gradientStyle: 'linear-gradient(135deg, rgba(40, 215, 255, 0.15), rgba(16, 26, 31, 0.9))',
  },
  {
    id: 'ghost-in-the-shell-ui',
    number: '05',
    title: 'Tactical HUD & Interface Density',
    category: 'anime-art',
    categoryLabel: 'Anime & Art',
    type: 'image-frame',
    quoteOrCaption: 'The Net is vast and infinite.',
    subtitle: 'Ghost in the Shell (1995)',
    details: 'Studying futuristic military HUD overlays, telemetry data feeds, and wireframe mesh renders.',
    tags: ['Ghost in the Shell', 'Tactical UI', 'HUD Design', 'Telemetry'],
    gradientStyle: 'linear-gradient(135deg, rgba(114, 242, 184, 0.2), rgba(16, 32, 40, 0.9))',
  },
  {
    id: 'ambient-lofi-beats',
    number: '06',
    title: 'Rainy Tokyo Night Ambience',
    category: 'music',
    categoryLabel: 'Music & Playlists',
    type: 'music-player',
    quoteOrCaption: 'BPM 85 • Chillhop & Ambient Rain',
    subtitle: 'Track: Electric Horizon',
    details: 'Relaxing soundscapes for late-night refactoring and documentation writing.',
    tags: ['Ambient', 'Chillhop', 'Rain Soundscape', '85 BPM'],
    trackUrl: 'https://open.spotify.com',
    gradientStyle: 'linear-gradient(135deg, rgba(40, 215, 255, 0.2), rgba(139, 92, 255, 0.15))',
  },
]

export type MilestoneCategory = 'all' | 'engineering' | 'spatial-3d' | 'ai-systems' | 'creative-growth'

export type Milestone = {
  id: string
  year: string
  quarter?: string
  title: string
  category: Exclude<MilestoneCategory, 'all'>
  categoryLabel: string
  summary: string
  narrative: string
  achievements: string[]
  skillsUnlocked: string[]
  status: string
}

export const milestones: Milestone[] = [
  {
    id: 'm1-genesis',
    year: '2023',
    quarter: 'Q1',
    title: 'The First Spark & System Architecture',
    category: 'engineering',
    categoryLabel: 'Engineering',
    summary: 'Discovered the joy of software craftsmanship, transitioning from simple scripts to full-stack application development.',
    narrative: 'Began building complex web applications with React and TypeScript, focusing on strict type safety, modular design systems, and state management.',
    achievements: [
      'Built first complete React + TypeScript web app from scratch',
      'Mastered component lifecycle optimization and custom hooks',
      'Established disciplined Git & open-source workflow',
    ],
    skillsUnlocked: ['React', 'TypeScript', 'CSS Modules', 'Git'],
    status: 'completed',
  },
  {
    id: 'm2-spatial-webgl',
    year: '2024',
    quarter: 'Q3',
    title: 'Entering the 3D & WebGL Dimension',
    category: 'spatial-3d',
    categoryLabel: '3D & Spatial',
    summary: 'Shifted focus from flat 2D interfaces to real-time 3D spatial web environments.',
    narrative: 'Deep-dived into Three.js, React Three Fiber, GLSL shaders, and Blender modeling. Learned how to create immersive 60fps WebGL scenes without sacrificing browser performance.',
    achievements: [
      'Rendered procedural GLSL fragment shaders in React Three Fiber',
      'Created custom 3D low-poly character & vehicle models in Blender',
      'Optimized 3D asset pipelines using Draco and Meshopt compression',
    ],
    skillsUnlocked: ['Three.js', 'React Three Fiber', 'GLSL', 'Blender'],
    status: 'completed',
  },
  {
    id: 'm3-ai-intelligence',
    year: '2025',
    quarter: 'Q2',
    title: 'AI Workflows & Intelligent Systems',
    category: 'ai-systems',
    categoryLabel: 'AI & Systems',
    summary: 'Merged spatial UI design with multi-agent AI execution pipelines.',
    narrative: 'Explored how generative AI and LLMs could be integrated into spatial web apps. Designed node-graph visualizers that render real-time agent reasoning, prompt chains, and confidence streams.',
    achievements: [
      'Architected multi-agent thought visualizer canvas',
      'Integrated real-time streaming AI APIs into React UI state',
      'Designed human-centric AI control surfaces',
    ],
    skillsUnlocked: ['AI Agent Pipelines', 'LLM API Integration', 'Node Graphs', 'Spatial AI'],
    status: 'completed',
  },
  {
    id: 'm4-thedeepanshu-v3',
    year: '2026',
    quarter: 'Q1',
    title: 'The Portfolio World (thedeepanshu v3)',
    category: 'creative-growth',
    categoryLabel: 'Creative Growth',
    summary: 'Synthesized engineering, 3D WebGL, anime sci-fi aesthetics, and AI touch into a unified digital portfolio universe.',
    narrative: 'Built this exact portfolio system—a multi-chapter digital experience featuring an interactive 3D hero workshop, case studies, capabilities matrix, live shader sandbox, and personal archive.',
    achievements: [
      'Shipped code-split lazy 3D scene architecture under 250kB main JS',
      'Built 8 multi-page chapter routes with shared PageFrame shell',
      'Designed custom HSL CSS glassmorphism & HUD overlay system',
    ],
    skillsUnlocked: ['Full System Architecture', 'Performance Budgeting', 'UI Atmosphere', 'Brand Identity'],
    status: 'current milestone',
  },
  {
    id: 'm5-horizon',
    year: '2026+',
    quarter: 'Q3',
    title: 'The Next Horizon: Spatial AI & WebGL Products',
    category: 'creative-growth',
    categoryLabel: 'Creative Growth',
    summary: 'Looking ahead to founding next-generation spatial AI tools and immersive product experiences.',
    narrative: 'Continuing R&D in WebGPU, procedural shader art, agentic automation frameworks, and collaborative web platforms.',
    achievements: [
      'R&D in WebGPU & Compute Shaders',
      'Building public spatial web tools and open-source libraries',
    ],
    skillsUnlocked: ['WebGPU', 'Compute Shaders', 'Product Leadership'],
    status: 'loading horizon',
  },
]

export type JournalCategory = 'all' | 'systems-thinking' | 'ui-atmosphere' | 'engineering' | 'ai-design'

export type JournalArticle = {
  slug: string
  title: string
  category: Exclude<JournalCategory, 'all'>
  categoryLabel: string
  date: string
  readTime: string
  excerpt: string
  content: string[]
  takeaways: string[]
  featured?: boolean
}

export const articles: JournalArticle[] = [
  {
    slug: 'why-interfaces-should-have-atmosphere',
    title: 'Why Interfaces Should Have Atmosphere',
    category: 'ui-atmosphere',
    categoryLabel: 'UI Atmosphere',
    date: 'Jan 2026',
    readTime: '4 min read',
    featured: true,
    excerpt: 'Most modern web applications look clean, but feel sterile. Adding depth, motion, lighting, and visual weight turns a utility into an experience.',
    content: [
      'In the rush toward extreme flat minimalism, digital products lost their sense of space. Buttons became borderless rectangles; backgrounds flattened into plain white or grey; interfaces stopped feeling like physical or digital objects.',
      'Atmosphere does not mean visual noise. It means intent. It means using volumetric gradients, subtle scanlines, glass backdrop blurs, and responsive lighting to give an interface a pulse.',
      'When an interactive surface responds to mouse hover with lighting rather than just color flips, the user subconsciously perceives physical presence. That emotional connection transforms software from a tool into a destination.',
    ],
    takeaways: [
      'Visual atmosphere increases engagement and perceived software quality.',
      'Use lighting & spatial depth rather than flat color swaps.',
      'Performance budgeting ensures atmospheric graphics run at 60fps.',
    ],
  },
  {
    slug: 'learning-to-think-in-systems',
    title: 'Learning to Think in Systems',
    category: 'systems-thinking',
    categoryLabel: 'Systems Thinking',
    date: 'Dec 2025',
    readTime: '6 min read',
    featured: false,
    excerpt: 'Writing code is easy; architecting systems that scale gracefully across state, UI components, and team collaboration is where real engineering happens.',
    content: [
      'When you start coding, you focus on functions and syntax. As you build larger applications, you realize that software is a graph of interconnected dependencies.',
      'Thinking in systems means designing data flows where state mutation is predictable, UI components are decoupled from raw API shapes, and CSS design tokens ensure global visual consistency.',
      'By treating your codebase as a living machine with clear boundaries, you eliminate entire classes of visual regressions and runtime crashes before they happen.',
    ],
    takeaways: [
      'Decouple component rendering logic from raw API models.',
      'Centralize styling tokens to guarantee architectural consistency.',
      'Prioritize predictable single-direction data flow.',
    ],
  },
  {
    slug: 'building-for-the-feeling',
    title: 'Building for the Feeling: Emotion in Software',
    category: 'ai-design',
    categoryLabel: 'AI & Design',
    date: 'Nov 2025',
    readTime: '5 min read',
    featured: false,
    excerpt: 'As AI models commoditize code generation, the defining differentiator for software will be craftsmanship, personality, and emotional resonance.',
    content: [
      'AI tools can write boilerplate and pass unit tests in seconds. What they cannot do is feel. They do not know what it feels like to land on a page that surprises you with cinematic energy.',
      'Craftsmanship is the deliberate choice to polish the 1% micro-interactions: the way an avatar drifts, the sound of a keypress, the timing of a spring animation, the exact HSL glow of a button.',
      'The future of software belongs to builders who combine technical rigor with creative direction—engineers who build experiences that leave a lasting mark.',
    ],
    takeaways: [
      'AI automates syntax; human craftsmanship defines delight.',
      'Micro-animations create high-perceived value and brand identity.',
      'Build products with a strong, opinionated personality.',
    ],
  },
]






