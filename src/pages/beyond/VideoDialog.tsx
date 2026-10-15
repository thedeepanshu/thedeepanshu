import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useMusicDuck } from '../../hooks/useMusicDuck'

type VideoDialogProps = {
  /** YouTube video id. */
  videoId: string
  title: string
  caption: string
  onClose: () => void
}

/**
 * A YouTube video in a modal (privacy-enhanced embed, loaded only when opened).
 * The site's music fades out while it's open. Escape or a click outside closes it.
 */
export function VideoDialog({ videoId, title, caption, onClose }: VideoDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  useMusicDuck(true)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialog}
      className="trailer-dialog"
      aria-label={title}
      onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close() }}
    >
      <div className="trailer-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
      <div className="trailer-bar">
        <span>{caption}</span>
        <button type="button" onClick={() => dialog.current?.close()}><X size={16} aria-hidden="true" /> Close</button>
      </div>
    </dialog>
  )
}
