import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { useMusicDuck } from '@/hooks/useMusicDuck'

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
    const element = dialog.current
    if (!element) return
    element.showModal()
    // A click on the backdrop (outside the frame) closes it; Escape works natively.
    const onClick = (event: MouseEvent) => {
      if (event.target === element) element.close()
    }
    element.addEventListener('click', onClick)
    return () => element.removeEventListener('click', onClick)
  }, [])

  return (
    <dialog ref={dialog} className="trailer-dialog" aria-label={title} onClose={onClose}>
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
        <button type="button" onClick={() => dialog.current?.close()}>
          <X size={16} aria-hidden="true" /> Close
        </button>
      </div>
    </dialog>
  )
}
