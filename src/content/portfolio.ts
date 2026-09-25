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

