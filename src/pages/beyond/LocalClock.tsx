import { useEffect, useState } from 'react'

const ZONE = 'Asia/Kolkata'

/** What I'm probably up to, by my local hour. Playful, not a schedule. */
function activityFor(hour: number) {
  if (hour < 5) return 'should be asleep. Probably one more episode'
  if (hour < 9) return 'starting the day slowly'
  if (hour < 13) return 'probably deep in code'
  if (hour < 18) return 'probably shipping something'
  if (hour < 21) return 'probably learning something new'
  return 'probably mid-episode'
}

function readClock() {
  const now = new Date()
  const time = new Intl.DateTimeFormat('en-IN', { timeZone: ZONE, hour: 'numeric', minute: '2-digit', hour12: true }).format(now)
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hour: '2-digit', hourCycle: 'h23' }).format(now))
  return { time: time.replace(/\s?([ap])\.?m\.?/i, (_, m: string) => ` ${m.toLowerCase()}m`), hour }
}

/** "It's 11:40 pm for me in India: probably mid-episode." Ticks every 30 s. */
export function LocalClock() {
  const [clock, setClock] = useState(readClock)

  useEffect(() => {
    const timer = window.setInterval(() => setClock(readClock()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <p className="beyond-clock">
      <span className="beyond-clock-dot" aria-hidden="true" />
      It’s <time>{clock.time}</time> for me in India: {activityFor(clock.hour)}.
    </p>
  )
}
