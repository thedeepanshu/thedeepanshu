import { useEffect, useState, type FormEvent } from 'react'
import { dossier, socialLinks } from '../content/portfolio'
import { PageFrame } from '../components/PageFrame'
import { useVessel } from '../world/store'

export function SignalPage() {
  const [formData, setFormData] = useState({ name: '', email: '', projectType: 'Frontend opportunity', message: '' })
  const [draftOpened, setDraftOpened] = useState(false)
  const setSignalCharge = useVessel((state) => state.setSignalCharge)
  const fireSignal = useVessel((state) => state.fireSignal)

  // The comms dish charges as the form fills in: name, a valid-looking email and a message.
  useEffect(() => {
    const filled = [formData.name.trim() !== '', /.+@.+\..+/.test(formData.email), formData.message.trim().length > 0]
    setSignalCharge(draftOpened ? 0 : filled.filter(Boolean).length / filled.length)
  }, [formData, draftOpened, setSignalCharge])

  useEffect(() => () => setSignalCharge(0), [setSignalCharge])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const subject = encodeURIComponent(`${formData.projectType} - ${formData.name}`)
    const body = encodeURIComponent(`From: ${formData.name}\nReply to: ${formData.email}\n\n${formData.message}`)
    window.location.href = `mailto:deepanshusaini971@gmail.com?subject=${subject}&body=${body}`
    setDraftOpened(true)
    fireSignal()
  }

  return (
    <PageFrame eyebrow="008 / contact" title={<>Send a <em>signal.</em></>} intro="For frontend opportunities, project conversations, or a hello, reach out through one of the channels below.">
      <div className="signal-container">
        <div className="signal-stats-bar">
          <div className="stat-pill"><span>Role</span><strong>Frontend developer</strong></div>
          <div className="stat-pill"><span>Project focus</span><strong>Interactive web experiences</strong></div>
          <div className="stat-pill"><span>Contact</span><strong>Email and social channels</strong></div>
        </div>

        <div className="signal-layout">
          <div className="signal-terminal-panel">
            <div className="terminal-header">
              <span className="terminal-title">
                <img className="terminal-pilot" src={dossier.portrait} alt="" width={28} height={28} decoding="async" />
                TERMINAL DISPATCH // PILOT ONLINE
              </span>
              <span className="terminal-dot" />
            </div>

            {draftOpened ? (
              <div className="dispatch-success-box" role="status">
                <span className="success-tag">&gt; EMAIL DRAFT REQUESTED</span>
                <h3>Check your email app</h3>
                <p>A draft should open in your email app. It has not been sent; review it and send it there.</p>
                <button className="primary-action inline-action" type="button" onClick={() => setDraftOpened(false)}>
                  Compose another <span>↗</span>
                </button>
              </div>
            ) : (
              <form className="signal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name">Your name</label>
                  <input id="contact-name" name="name" type="text" autoComplete="name" required placeholder="Your name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Your email</label>
                  <input id="contact-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-type">What is this about?</label>
                  <select id="contact-type" name="projectType" value={formData.projectType} onChange={(event) => setFormData({ ...formData, projectType: event.target.value })}>
                    <option>Frontend opportunity</option>
                    <option>Website or web app</option>
                    <option>Interactive portfolio</option>
                    <option>General inquiry</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" name="message" rows={5} required placeholder="Tell me a little about it..." value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} />
                </div>
                <button type="submit" className="primary-action submit-btn">Open email draft <span>↗</span></button>
              </form>
            )}
          </div>

          <aside className="signal-sidebar">
            <div className="coordinates-panel">
              <p className="sidebar-label">/ DIRECT CHANNELS</p>
              <div className="social-grid">
                {socialLinks.map((link) => (
                  <a className="social-tile" href={link.url} target={link.url.startsWith('mailto:') ? undefined : '_blank'} rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'} key={link.name}>
                    <div><span className="tile-platform">{link.platform}</span><strong className="tile-name">{link.name}</strong><small className="tile-handle">{link.handle}</small></div>
                    <span className="tile-arrow">↗</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="telemetry-box">
              <span className="telemetry-title">&gt; FORM DELIVERY</span>
              <pre className="telemetry-log">{`> Opens your email app\n> Review the draft before sending\n> No message is sent automatically`}</pre>
            </div>
          </aside>
        </div>
      </div>
    </PageFrame>
  )
}
