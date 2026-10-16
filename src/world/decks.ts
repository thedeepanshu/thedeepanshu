export type DeckId = 'bridge' | 'origin' | 'missions' | 'arsenal' | 'journey' | 'lab' | 'beyond' | 'signal' | 'void'

type Vec3 = [number, number, number]

export type Deck = {
  id: DeckId
  path: string
  number: string
  label: string
  /** Where the camera parks for this deck, and the point it looks at. */
  camera: Vec3
  target: Vec3
}

// Decks are spread far apart in world space so every route change is a real
// flight. Later phases build each deck's set piece around its `target`.
export const decks: Deck[] = [
  { id: 'bridge', path: '/', number: '00', label: 'Bridge', camera: [0, 0, 12], target: [0, 0, 0] },
  { id: 'origin', path: '/about', number: '01', label: 'Pilot dossier', camera: [-46, 8, -18], target: [-52, 6, -30] },
  { id: 'missions', path: '/missions', number: '02', label: 'Hangar', camera: [38, -6, -26], target: [46, -8, -38] },
  { id: 'arsenal', path: '/arsenal', number: '03', label: 'Star map', camera: [-10, 34, -60], target: [-10, 40, -80] },
  { id: 'journey', path: '/journey', number: '04', label: 'Flight path', camera: [64, 14, -84], target: [76, 14, -100] },
  { id: 'lab', path: '/lab', number: '05', label: 'Reactor core', camera: [-62, -22, -96], target: [-70, -24, -110] },
  { id: 'beyond', path: '/beyond', number: '06', label: 'Observation deck', camera: [8, -40, -128], target: [8, -44, -150] },
  { id: 'signal', path: '/signal', number: '07', label: 'Comms array', camera: [52, 30, -150], target: [60, 36, -166] },
  { id: 'void', path: '*', number: '??', label: 'Deep space', camera: [-120, 60, -220], target: [-130, 58, -240] },
]

const voidDeck = decks[decks.length - 1]

export function deckForPath(pathname: string): Deck {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return decks.find((deck) => deck.path === normalized) ?? voidDeck
}

export function deckById(id: DeckId): Deck {
  return decks.find((deck) => deck.id === id) ?? voidDeck
}
