import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  /** What to render instead when something below throws. */
  fallback: ReactNode
  /** Short name for the console, e.g. "3D world". */
  name: string
  children: ReactNode
}

type State = { failed: boolean }

/**
 * Keeps one failing part from taking the whole site down: the 3D world can
 * fail (no WebGL, lost GPU context) and the pages still work, and a page that
 * throws shows a recovery screen instead of a blank one.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.name}]`, error, info.componentStack)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
