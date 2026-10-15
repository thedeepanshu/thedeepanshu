import { useEffect } from 'react'
import { holdMusicDuck } from '../audio/soundEngine'

/** While `active`, the site's music fades out so the visitor's own audio is clear. */
export function useMusicDuck(active: boolean) {
  useEffect(() => (active ? holdMusicDuck() : undefined), [active])
}
