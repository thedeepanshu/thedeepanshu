import { Link, useLocation } from 'react-router-dom'
import { dossier } from '../content/portfolio'
import { useVessel } from '../world/store'
import './VesselFooter.css'

const YEAR = new Date().getFullYear()

/**
 * The one footer on every deck: the "Let's connect" call to action, with a slim
 * ship status bar underneath.
 */
export function VesselFooter() {
  const { pathname } = useLocation()
  // Already on the comms deck: point onward instead of back at this page.
  const cta = pathname === '/signal' ? { to: '/missions', label: 'Explore the missions' } : { to: '/signal', label: 'Let’s connect' }

  const toTop = () => {
    const smooth = !useVessel.getState().reducedMotion
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'instant' })
  }

  return (
    <footer className="vessel-footer">
      <div className="site-footer">
        <p><i className="vessel-footer-open" aria-hidden="true" />Comms open</p>
        <Link to={cta.to}>{cta.label} <span>↗</span></Link>
      </div>
      <div className="vessel-footer-inner">
        <p className="vessel-footer-copy">
          <span>© {YEAR} {dossier.name}</span>
          <span className="vessel-footer-status">All systems nominal</span>
        </p>

        <p className="vessel-footer-love">
          Crafted with
          <svg className="vessel-footer-heart" viewBox="0 0 24 22" role="img" aria-label="love">
            <defs>
              <linearGradient id="vessel-footer-heart" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#7ef4db" />
                <stop offset="1" stopColor="#a17eff" />
              </linearGradient>
            </defs>
            <path d="M12 21s-8.5-5.3-10.6-10.4C-.2 6.6 2.4 1.5 7 1.5c2.2 0 3.8 1.1 5 2.9 1.2-1.8 2.8-2.9 5-2.9 4.6 0 7.2 5.1 5.6 9.1C20.5 15.7 12 21 12 21Z" />
          </svg>
          aboard <b>The Vessel</b>
        </p>

        <div className="vessel-footer-meta">
          <span>Vessel OS v3.0</span>
          <button type="button" onClick={toTop}>
            Back to top <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
