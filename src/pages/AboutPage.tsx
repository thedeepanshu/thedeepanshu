import { PageFrame } from '../components/PageFrame'

export function AboutPage() {
  return <PageFrame eyebrow="001 / origin" title={<>Frontend, with <em>feeling.</em></>} intro="I'm a frontend developer creating an anime-inspired portfolio with cinematic 3D visuals and an AI-inspired interface aesthetic."><div className="split-copy"><p className="lead-copy">I enjoy shaping the part of a product people see and use: clear layouts, thoughtful interactions, and details that give an interface its own character.</p><div className="stat-grid"><span><b>01</b>Frontend development</span><span><b>02</b>Interactive web design</span><span><b>03</b>Cinematic portfolio visuals</span></div></div></PageFrame>
}
