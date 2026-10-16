import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { NewTabHint } from './NewTabHint'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> & { href: string; children: ReactNode }

/** A link to another site: opens in a new tab, safely, and says so to screen readers. */
export function ExternalLink({ children, ...rest }: Props) {
  return (
    <a {...rest} target="_blank" rel="noopener noreferrer">
      {children}
      <NewTabHint />
    </a>
  )
}
