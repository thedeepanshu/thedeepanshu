import './BrowserFrame.css'

type BrowserFrameProps = {
  src: string
  alt: string
  /** Address shown in the bar. */
  label: string
  className?: string
}

/** A screenshot or mock presented in a slim browser window frame. */
export function BrowserFrame({ src, alt, label, className = '' }: BrowserFrameProps) {
  return (
    <figure className={`browser-frame ${className}`.trim()}>
      <div className="browser-frame-bar" aria-hidden="true">
        <i /><i /><i />
        <span>{label}</span>
      </div>
      <img src={src} alt={alt} width={1600} height={1000} loading="lazy" decoding="async" />
    </figure>
  )
}
