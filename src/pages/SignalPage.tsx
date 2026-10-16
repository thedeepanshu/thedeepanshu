import { type FormEvent, useEffect, useRef, useState } from 'react'

import { PageFrame } from '@/components/PageFrame'
import { availability, contactTopics, dossier, socialLinks } from '@/content/portfolio'
import { useVessel } from '@/world/store'

const EMPTY_FORM = { name: '', topic: '', message: '' }

export function SignalPage() {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const nameInput = useRef<HTMLInputElement>(null)
  const [draftOpened, setDraftOpened] = useState(false)
  const setSignalCharge = useVessel((state) => state.setSignalCharge)
  const fireSignal = useVessel((state) => state.fireSignal)

  // The comms dish charges as the form fills in: name, topic and message.
  useEffect(() => {
    const filled = [formData.name.trim() !== '', formData.topic !== '', formData.message.trim().length > 0]
    setSignalCharge(draftOpened ? 0 : filled.filter(Boolean).length / filled.length)
  }, [formData, draftOpened, setSignalCharge])

  useEffect(() => () => setSignalCharge(0), [setSignalCharge])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // The draft is sent from the visitor's own email app, so their address comes with it.
    const subject = encodeURIComponent(`${formData.topic} — from ${formData.name.trim()}`)
    const body = encodeURIComponent(`Hi Deepanshu,\n\n${formData.message.trim()}\n\n— ${formData.name.trim()}`)
    window.location.href = `mailto:deepanshusaini971@gmail.com?subject=${subject}&body=${body}`
    // The words now live in the email draft, so the form starts fresh for the next one.
    setFormData(EMPTY_FORM)
    setDraftOpened(true)
    fireSignal()
  }

  const composeAnother = () => {
    setFormData(EMPTY_FORM)
    setDraftOpened(false)
    // Wait for the form to render again, then put the cursor in the first field.
    requestAnimationFrame(() => nameInput.current?.focus())
  }

  return (
    <PageFrame
      deck="signal"
      topic="contact"
      title={
        <>
          Send a <em>signal.</em>
        </>
      }
      intro="For frontend opportunities, project conversations, or a hello, reach out through one of the channels below."
    >
      <div className="signal-container">
        <dl className="signal-stats-bar signal-availability">
          {availability.map((item) => (
            <div className="stat-pill" key={item.label}>
              <dt>
                {item.live && <i className="availability-live" aria-hidden="true" />}
                {item.label}
              </dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

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
                <button className="primary-action inline-action" type="button" onClick={composeAnother}>
                  Compose another <span>↗</span>
                </button>
              </div>
            ) : (
              <form className="signal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name">Your name</label>
                  <input
                    ref={nameInput}
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  />
                </div>
                <fieldset className="form-group topic-group">
                  <legend>What’s on your mind?</legend>
                  <div className="topic-chips">
                    {contactTopics.map((topic) => (
                      <label key={topic} className={`topic-chip${formData.topic === topic ? ' is-selected' : ''}`}>
                        <input
                          type="radio"
                          name="topic"
                          value={topic}
                          required
                          checked={formData.topic === topic}
                          onChange={() => setFormData({ ...formData, topic })}
                        />
                        <span>{topic}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Tell me a little about it..."
                    value={formData.message}
                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                  />
                </div>
                <button type="submit" className="primary-action submit-btn">
                  Open email draft <span>↗</span>
                </button>
                <p className="signal-form-note">Opens a ready-to-send draft in your own email app, so I can reply straight to you.</p>
              </form>
            )}
          </div>

          <aside className="signal-sidebar">
            <div className="coordinates-panel">
              <p className="sidebar-label">/ DIRECT CHANNELS</p>
              <div className="social-grid">
                {socialLinks.map((link) => (
                  <a
                    className="social-tile"
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    key={link.name}
                  >
                    <div>
                      <span className="tile-platform">{link.platform}</span>
                      <strong className="tile-name">{link.name}</strong>
                      <small className="tile-handle">{link.handle}</small>
                    </div>
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
