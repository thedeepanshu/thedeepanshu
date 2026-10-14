import { useState, useRef, useEffect, type PointerEvent } from 'react'
import { FileText, Sparkles, ChevronDown, Download } from 'lucide-react'

type ResumeDropdownProps = {
  variant?: 'nav' | 'button'
  align?: 'left' | 'right'
}

export function ResumeDropdown({ variant = 'nav', align = 'right' }: ResumeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const openedByHover = useRef(false)

  // Hover behaviour is for mouse users only; touch/pen rely on tap so a
  // synthetic hover-open isn't immediately undone by the tap's click toggle.
  const handlePointerEnter = (event: PointerEvent) => {
    if (variant !== 'nav' || event.pointerType !== 'mouse') return
    openedByHover.current = true
    setIsOpen(true)
  }

  const handlePointerLeave = (event: PointerEvent) => {
    if (variant !== 'nav' || event.pointerType !== 'mouse') return
    setIsOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    } else {
      openedByHover.current = false
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div
      ref={dropdownRef}
      className={`resume-dropdown-wrapper variant-${variant} align-${align} ${isOpen ? 'is-open' : ''}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <button
        type="button"
        className="resume-trigger-btn"
        onClick={() => {
          // A click on a menu the mouse just opened should keep it open, not toggle it shut.
          if (openedByHover.current && isOpen) {
            openedByHover.current = false
            return
          }
          setIsOpen((prev) => !prev)
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Download Resume Options"
      >
        <span className="resume-btn-icon"><Download size={13} /></span>
        <span className="resume-btn-label">Resume</span>
        <ChevronDown size={13} className="resume-chevron" />
      </button>

      {isOpen && (
        <div className="resume-dropdown-menu" role="menu">
          <div className="resume-dropdown-header">
            <span className="dropdown-kicker">/ Select format</span>
          </div>

          <a
            href="/Deepanshu_Saini_V1.pdf"
            download="Deepanshu_Saini_V1.pdf"
            className="resume-option-item"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <div className="option-icon-box">
              <FileText size={16} />
            </div>
            <div className="option-info">
              <div className="option-title-row">
                <span className="option-title">Simple Resume</span>
                <span className="option-badge">ATS</span>
              </div>
              <span className="option-desc">Clean, ATS-friendly format (PDF)</span>
            </div>
            <span className="option-arrow">↓</span>
          </a>

          <a
            href="/Deepanshu_Saini_V2.pdf"
            download="Deepanshu_Saini_V2.pdf"
            className="resume-option-item fancy-item"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <div className="option-icon-box fancy-icon">
              <Sparkles size={16} />
            </div>
            <div className="option-info">
              <div className="option-title-row">
                <span className="option-title">Fancy Resume</span>
                <span className="option-badge fancy-badge">Visual</span>
              </div>
              <span className="option-desc">Stylized & creative portfolio PDF</span>
            </div>
            <span className="option-arrow">↓</span>
          </a>
        </div>
      )}
    </div>
  )
}
