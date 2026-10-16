import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from './ErrorBoundary'

function Broken(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders its children when nothing fails', () => {
    render(
      <ErrorBoundary name="test" fallback={<p>fallback</p>}>
        <p>content</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('shows the fallback instead of a blank screen when a child throws', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary name="test" fallback={<p>fallback</p>}>
        <Broken />
      </ErrorBoundary>,
    )
    expect(screen.getByText('fallback')).toBeInTheDocument()
    quiet.mockRestore()
  })
})
