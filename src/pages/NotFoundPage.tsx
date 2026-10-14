import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useVessel } from '../world/store'

export function NotFoundPage() {
  const [countdown, setCountdown] = useState(5)
  const navigate = useNavigate()
  const location = useLocation()

  // Don't start the return countdown until the visitor has boarded.
  const boarded = useVessel((state) => state.bootPhase === 'done')

  useEffect(() => {
    if (!boarded) return
    if (countdown <= 0) {
      navigate('/')
      return
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [boarded, countdown, navigate])

  return (
    <main className="portfolio-shell inner-page">
      <section className="not-found-container">
        <div className="not-found-content">
          {/* Glitch 404 display */}
          <div className="not-found-code" aria-hidden="true">
            <span className="glitch-text" data-text="404">404</span>
          </div>

          <p className="not-found-kicker">/ signal lost</p>
          <h1 className="not-found-title">
            Route not <em>found.</em>
          </h1>
          <p className="not-found-desc">
            The path <code>{location.pathname}</code> doesn't exist in this system. You may have followed a broken link or typed the URL incorrectly.
          </p>

          {/* Countdown + Action */}
          <div className="not-found-actions">
            <Link to="/" className="primary-action not-found-btn">
              Go back to home <span>↗</span>
            </Link>
            <div className="not-found-countdown">
              <div className="countdown-bar">
                <div
                  className="countdown-fill"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                />
              </div>
              <span className="countdown-label">
                Auto-redirecting in <strong>{countdown}s</strong>
              </span>
            </div>
          </div>

          {/* Terminal-style log */}
          <div className="not-found-terminal">
            <span className="terminal-title">&gt; SYSTEM LOG</span>
            <pre className="terminal-log">{`> Requested: ${location.pathname}\n> Status: 404 — NOT FOUND\n> Action: Redirecting to home in ${countdown}s`}</pre>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>thedeepanshu</p>
        <Link to="/signal">Let&apos;s build something alive <span>↗</span></Link>
      </footer>
    </main>
  )
}
