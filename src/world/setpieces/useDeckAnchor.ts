import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import { deckById, type DeckId } from '../decks'

/**
 * A group placed at a deck's target and turned to face its camera, so local +X
 * is "right of screen" and +Z points at the viewer. Set pieces build inside it.
 */
export function useDeckAnchor(id: DeckId) {
  const anchor = useRef<THREE.Group>(null)
  useEffect(() => {
    const deck = deckById(id)
    anchor.current?.position.set(...deck.target)
    anchor.current?.lookAt(...deck.camera)
  }, [id])
  return anchor
}
