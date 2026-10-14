export interface ResumeData {
  personalInfo: {
    name: string
    title: string
    email: string
    phone: string
    location?: string
    linkedin: {
      label: string
      url: string
    }
    portfolio: {
      label: string
      url: string
    }
  }
  profile: string
  technicalSkills: {
    category: string
    skills: string
  }[]
  experience: {
    company: string
    role: string
    period: string
    highlights: string[]
  }[]
  projects: {
    title: string
    type: string
    period: string
    highlights: string[]
  }[]
  education: {
    degree: string
    institution: string
    period: string
  }[]
  coreCompetencies: {
    title: string
    description: string
  }[]
  languages: {
    language: string
    proficiency: string
  }[]
  strengths: string[]
}

export const resumeData: ResumeData = {
  personalInfo: {
    name: 'Deepanshu Saini',
    title: 'Frontend Developer',
    email: 'deepanshusaini971@gmail.com',
    phone: '+91 70151 20411',
    // location: 'Panipat, Haryana, India',
    linkedin: {
      label: 'linkedin.com/in/thedeepanshu-a97229206',
      url: 'https://linkedin.com/in/thedeepanshu-a97229206',
    },
    portfolio: {
      label: 'thedeepanshu.dev',
      url: 'https://thedeepanshu.dev',
    },
  },

  profile:
    'Frontend Developer with ~5 years of experience architecting, scaling, and testing high-performance enterprise web applications using React.js and modern JavaScript (ES6+). Builds clean, reusable component systems, optimizes rendering performance, and ships data-dense dashboards and interactive Google Maps experiences used across large-scale business operations. Comfortable across the stack with working exposure to Next.js API Routes and MongoDB. An AI-augmented developer who uses modern AI tools daily to accelerate delivery and raise code quality, partnering with backend developers, UI/UX designers, QA, and stakeholders across the full product lifecycle.',

  technicalSkills: [
    {
      category: 'Tech Stack',
      skills: 'HTML5, CSS3, JavaScript (ES6+), TypeScript, React.js, Next.js, i18n / Localization',
    },
    {
      category: 'State Management',
      skills: 'React Hooks, Redux, Redux Toolkit, Context API, TanStack React Query, Jotai, Zustand',
    },
    {
      category: 'UI & Styling',
      skills: 'Bootstrap, Tailwind CSS, Material UI, Sass (SCSS), LESS',
    },
    {
      category: 'Testing & TDD',
      skills: 'Jest, React Testing Library, React Hook Form, Zod, Storybook, Postman',
    },
    {
      category: 'Performance & A11y',
      skills: 'WCAG, Cross-Browser Compatibility, Lighthouse, Web Vitals, Accessibility Testing',
    },
    {
      category: 'Tools & Analytics',
      skills: 'Git & GitHub, NPM / Vite, Chrome DevTools, VS Code, Google Analytics (GA4)',
    },
    {
      category: 'AI Coding Tools',
      skills: 'Claude, Claude Code, GitHub Copilot, ChatGPT, Gemini',
    },
    {
      category: 'Tech Exposure',
      skills: 'Vue.js, Next.js API Routes, Node.js, Express.js, MongoDB, Mongoose',
    },
  ],

  experience: [
    {
      company: 'ANRX Solutions',
      role: 'Frontend Developer',
      period: 'Oct 2021 – Aug 2026',
      highlights: [
        'Developed and tested enterprise-grade **React.js** applications and business-critical dashboards handling large-scale operational datasets, creating reusable components and building new features end-to-end from design through QA.',
        'Developed scalable application state using **Redux**, **Redux Toolkit**, and the **Context API**, and integrated **REST APIs** to support dynamic, data-driven UI functionality — identifying and fixing bugs through debugging and refactoring.',
        'Built high-density, performance-optimized **React data tables** with nested rows, server-driven search, advanced filtering, custom sorting, and pagination — leveraging memoization to keep large datasets fast and responsive.',
        'Implemented charts and **Google Analytics 4 (GA4)** tracking within React components for user interactions, custom events, downloads, and engagement metrics, enabling data-driven product decisions.',
        'Built interactive, high-performance geospatial interfaces with the **Google Maps JavaScript API** — integrating marker clustering, feature layers, and polygon & boundary rendering with geocoding to visualize thousands of location points.',
        'Engineered a real-time notification component using **WebSockets**, implementing resilient leader-election to auto-reassign the active connection on disconnect, ensuring duplicate-free live updates.',
        'Converted **Figma** designs into pixel-perfect, responsive components with clear technical documentation.',
        'Collaborated cross-functionally with backend developers, designers, and QA within an **Agile/Scrum workflow** — participating in sprint planning, and Git-based version control to uphold engineering development standards.',
        'Adopted **AI-augmented development** approach, using AI-assisted tools and agentic workflows to accelerate feature delivery.',
      ],
    },
  ],

  projects: [
    {
      title: 'Alec EV & Hybrid Battery Services (0→1 Build)',
      type: 'Independent Project',
      period: 'May 2026 – Jun 2026',
      highlights: [
        'Built and deployed a production-ready business website using **Next.js**, **TypeScript**, and **Tailwind CSS**, delivering a responsive, modern, and SEO-optimized experience: **alecevhybrid.com**.',
        'Owned the end-to-end development lifecycle, collaborating directly with the client to transform business requirements into production-ready features.',
        'Implemented **technical SEO** (schema, sitemap, robots.txt, canonical URLs, metadata, Core Web Vitals) and integrated **Google Search Console**, **GA4**, **Google Ads Conversion Tracking**, and **Google Maps**.',
        'Developed conversion-focused features including **WhatsApp lead generation**, optimized contact forms, interactive maps, and click-to-call actions.',
        'Managed deployment, domain configuration (**Namecheap**), and automated **Vercel CI/CD**, ensuring reliable production releases and ongoing maintenance.',
        'Used AI-assisted development workflows and agentic tools (Claude, ChatGPT, Gemini) to accelerate delivery and iteration speed without compromising code quality — the kind of leverage-driven, AI-augmented workflow product teams increasingly expect.',
      ],
    },
  ],

  education: [
    {
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'PKG Group of Institutions, Panipat, Haryana',
      period: 'Ongoing',
    },
    {
      degree: 'Diploma in Computer Science & Engineering',
      institution: 'Government Polytechnic, Sonepat, Haryana',
      period: '2019',
    },
    {
      degree: 'Secondary School (10th), CBSE',
      institution: 'I.B.(L) Public School, Panipat, Haryana',
      period: '2016',
    },
  ],

  coreCompetencies: [
    {
      title: 'Ownership & Accountability',
      description: 'Owns features from design through testing — going beyond the assigned ticket to catch bugs and edge cases early.',
    },
    {
      title: 'Cross-Functional Collaboration',
      description: 'Works directly with Product, Design, Backend and QA to turn ambiguous requirements into shipped, reliable features.',
    },
    {
      title: 'Self-Driven Execution',
      description: 'Delivered an independent project solo, end-to-end — direction, development, and deployment infrastructure.',
    },
    {
      title: 'Usability & Craft',
      description: 'Brings a strong sense for usability and visual aesthetics, paired with hands-on use of AI agents and agentic workflows to ship faster without cutting corners.',
    },
  ],

  languages: [
    { language: 'Hindi', proficiency: 'Native / Full Professional' },
    { language: 'English', proficiency: 'Professional Working' },
  ],

  strengths: [
    'Ownership Mindset',
    'Strong Work Ethic',
    'Disciplined',
    'Active Listener',
    'Problem Solver',
    'Fast Learner',
  ],
}
