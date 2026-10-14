import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { ResumeDropdown } from './ResumeDropdown'

const navigation = [
  ['Origin', '/about'],
  ['Missions', '/missions'],
  ['Arsenal', '/arsenal'],
  ['Journey', '/journey'],
  ['Lab', '/lab'],
  ['Beyond', '/beyond'],
  ['Signal', '/signal'],
] as const

/**
 * Shared header: full nav on desktop, hamburger + slide-in drawer on small screens.
 * Used by the home page and the inner PageFrame so navigation stays consistent.
 */
export function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the drawer whenever the route changes (covers link taps and
  // back/forward navigation) using the adjust-state-during-render pattern.
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setDrawerOpen(false)
  }

  // While the drawer is open: lock page scroll and close on Escape.
  useEffect(() => {
    if (!drawerOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [drawerOpen])

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="site-header-inner">
        <Link className="wordmark" to="/">thedeepanshu<span className="wordmark-dot">.</span></Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.map(([label, path]) => (
            <NavLink key={path} to={path}>{label}</NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <ResumeDropdown variant="nav" align="right" />
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setDrawerOpen((open) => !open)}
          >
            {drawerOpen ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="drawer-root" role="presentation" onClick={closeDrawer}>
          <nav
            id="mobile-drawer"
            className="mobile-drawer"
            aria-label="Mobile navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="drawer-kicker">/ navigation</p>
            {navigation.map(([label, path], index) => (
              <NavLink key={path} to={path} className="drawer-link">
                <span className="drawer-index">{String(index + 1).padStart(2, '0')}</span>
                {label}
                <span className="drawer-arrow">↗</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
