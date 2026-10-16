/** Tells screen-reader users that a link opens in a new tab (WCAG 3.2.5 courtesy). */
export function NewTabHint() {
  return <span className="visually-hidden"> (opens in a new tab)</span>
}
