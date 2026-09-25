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
    type: 'immersive interface / featured',
    title: 'The portfolio system',
    summary: 'A cinematic personal world built around motion, 3D scenes, and a living archive of ideas.',
    technologies: ['React', 'TypeScript', 'React Three Fiber'],
    status: 'building now',
  },
  {
    number: '02',
    type: 'AI experience / concept',
    title: 'Signal intelligence',
    summary: 'An early direction for making AI tools feel more human, visual, and expressive.',
    technologies: ['AI', 'Product design', 'Motion'],
    status: 'in the lab',
  },
  {
    number: '03',
    type: 'creative system / upcoming',
    title: 'Unknown territory',
    summary: 'The next experiment has not been named yet. That is part of the fun.',
    technologies: ['Creative code', 'WebGL', 'Systems'],
    status: 'signal pending',
  },
]
