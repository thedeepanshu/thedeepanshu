/**
 * Procedural ship ambience built on the Web Audio API: no audio files, a few KB
 * of code, and it never loops audibly. Nothing is created until the visitor
 * opts in, which is also the user gesture browsers require before playing sound.
 *
 * The bed is deliberately soft: a warm pad that glides slowly between four
 * chords, a low sub, and occasional bell tones, all through a long reverb.
 *
 * Three presets: `ambient` (the bed plus warp and UI sounds), `minimal` (only
 * warp and UI sounds, no music) and `off`.
 */

export type SoundMode = 'ambient' | 'minimal' | 'off'

export const SOUND_PRESETS: { mode: SoundMode; label: string; description: string }[] = [
  { mode: 'ambient', label: 'Ambient', description: 'Ship music, warps and UI sounds' },
  { mode: 'minimal', label: 'Minimal', description: 'Warps and UI sounds, no music' },
  { mode: 'off', label: 'Off', description: 'Silent' },
]

let context: AudioContext | null = null
let master: GainNode | null = null
let reverb: ConvolverNode | null = null
/** The music bed (pad, sub, air) runs through this so presets can fade it alone. */
let bed: GainNode | null = null
let bedSend: GainNode | null = null
let ambienceStarted = false
let enabled = false
let mode: SoundMode = 'off'
let bellTimer = 0
let lastUiSound = 0

function getContext() {
  if (!context) {
    context = new AudioContext()
    master = context.createGain()
    master.gain.value = 0
    master.connect(context.destination)
    // Shared hall reverb: a generated impulse response (decaying stereo noise).
    reverb = context.createConvolver()
    reverb.buffer = impulseResponse(context, 4.5, 2.6)
    const wet = context.createGain()
    wet.gain.value = 0.9
    reverb.connect(wet).connect(master)
  }
  return { context, master: master as GainNode, reverb: reverb as ConvolverNode }
}

function impulseResponse(ctx: AudioContext, seconds: number, decay: number) {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
  }
  return buffer
}

function noiseBuffer(ctx: AudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function lfo(ctx: AudioContext, frequency: number, depth: number, target: AudioParam) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = frequency
  gain.gain.value = depth
  osc.connect(gain).connect(target)
  osc.start()
}

const note = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

// D major, gentle and open: Dadd9 → Bm7 → Gmaj7 → Asus2 (MIDI note numbers).
const CHORDS = [
  [50, 57, 64, 66],
  [47, 54, 62, 69],
  [43, 50, 59, 66],
  [45, 52, 59, 64],
]
const CHORD_SECONDS = 14
// Bells pick from a D major pentatonic an octave or two up.
const BELL_NOTES = [74, 76, 78, 81, 83, 86]

function startAmbience(ctx: AudioContext, out: AudioNode, room: AudioNode) {
  // Pad: each voice is a sine plus a slightly detuned triangle, through a
  // low-pass that slowly opens and closes. Mostly sent to the reverb.
  const padFilter = ctx.createBiquadFilter()
  padFilter.type = 'lowpass'
  padFilter.frequency.value = 900
  padFilter.Q.value = 0.4
  lfo(ctx, 0.045, 320, padFilter.frequency)
  const padGain = ctx.createGain()
  padGain.gain.value = 0.026
  lfo(ctx, 0.07, 0.006, padGain.gain)
  padFilter.connect(padGain)
  padGain.connect(out)
  const padSend = ctx.createGain()
  padSend.gain.value = 0.7
  padGain.connect(padSend).connect(room)

  const voices = CHORDS[0].map((midi, index) => {
    const sine = ctx.createOscillator()
    sine.type = 'sine'
    sine.frequency.value = note(midi)
    const triangle = ctx.createOscillator()
    triangle.type = 'triangle'
    triangle.frequency.value = note(midi)
    triangle.detune.value = index % 2 ? 6 : -6
    const triangleGain = ctx.createGain()
    triangleGain.gain.value = 0.35
    sine.connect(padFilter)
    triangle.connect(triangleGain).connect(padFilter)
    sine.start()
    triangle.start()
    return [sine, triangle]
  })

  // Sub: a quiet sine an octave under the chord root.
  const sub = ctx.createOscillator()
  sub.type = 'sine'
  sub.frequency.value = note(CHORDS[0][0] - 12)
  const subGain = ctx.createGain()
  subGain.gain.value = 0.018
  sub.connect(subGain).connect(out)
  sub.start()

  // Glide to the next chord every few bars; the long time constant makes it a morph.
  let chord = 0
  const advance = () => {
    chord = (chord + 1) % CHORDS.length
    const now = ctx.currentTime
    CHORDS[chord].forEach((midi, index) => {
      for (const osc of voices[index]) osc.frequency.setTargetAtTime(note(midi), now, 1.6)
    })
    sub.frequency.setTargetAtTime(note(CHORDS[chord][0] - 12), now, 1.6)
  }
  window.setInterval(advance, CHORD_SECONDS * 1000)

  // Space: very faint filtered noise, more texture than hiss.
  const air = ctx.createBufferSource()
  air.buffer = noiseBuffer(ctx, 4)
  air.loop = true
  const airFilter = ctx.createBiquadFilter()
  airFilter.type = 'lowpass'
  airFilter.frequency.value = 420
  const airGain = ctx.createGain()
  airGain.gain.value = 0.006
  air.connect(airFilter).connect(airGain).connect(room)
  air.start()
}

function playBell() {
  if (mode !== 'ambient' || !context || !reverb || !master) return
  const ctx = context
  const now = ctx.currentTime
  const pitch = note(BELL_NOTES[Math.floor(Math.random() * BELL_NOTES.length)])
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.022, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2)
  // Fundamental plus a soft inharmonic partial for a glassy tone.
  for (const [ratio, level] of [[1, 1], [2.76, 0.18]] as const) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = pitch * ratio
    const partial = ctx.createGain()
    partial.gain.value = level
    osc.connect(partial).connect(gain)
    osc.start(now)
    osc.stop(now + 3.3)
  }
  const dry = ctx.createGain()
  dry.gain.value = 0.35
  gain.connect(dry).connect(master)
  gain.connect(reverb)
}

function scheduleBells() {
  window.clearTimeout(bellTimer)
  if (mode !== 'ambient') return
  bellTimer = window.setTimeout(() => {
    playBell()
    scheduleBells()
  }, 5000 + Math.random() * 7000)
}

export function setSoundMode(next: SoundMode) {
  mode = next
  enabled = next !== 'off'
  if (!enabled && !context) return
  const { context: ctx, master: out, reverb: room } = getContext()
  if (ctx.state === 'suspended') void ctx.resume()
  // The bed's oscillators only start when the music is first wanted.
  if (next === 'ambient' && !ambienceStarted) {
    bed = ctx.createGain()
    bed.gain.value = 0
    bed.connect(out)
    startAmbience(ctx, bed, gatedRoom(ctx, room))
    ambienceStarted = true
  }
  bed?.gain.setTargetAtTime(next === 'ambient' ? 1 : 0, ctx.currentTime, 0.6)
  bedSend?.gain.setTargetAtTime(next === 'ambient' ? 1 : 0, ctx.currentTime, 0.6)
  out.gain.setTargetAtTime(enabled ? 0.85 : 0, ctx.currentTime, 0.6)
  scheduleBells()
}

/** The bed's own reverb send, so `minimal` silences the music's tail as well. */
function gatedRoom(ctx: AudioContext, room: AudioNode) {
  bedSend = ctx.createGain()
  bedSend.gain.value = 0
  bedSend.connect(room)
  return bedSend
}

/** Light-speed whoosh: a swept noise band over a falling sub rumble. */
export function playWarp(seconds = 1.6) {
  if (!enabled || !context || !master || !reverb) return
  const ctx = context
  const now = ctx.currentTime

  const whoosh = ctx.createBufferSource()
  whoosh.buffer = noiseBuffer(ctx, seconds)
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 0.9
  band.frequency.setValueAtTime(220, now)
  band.frequency.exponentialRampToValueAtTime(1800, now + seconds * 0.5)
  band.frequency.exponentialRampToValueAtTime(260, now + seconds)
  const whooshGain = ctx.createGain()
  whooshGain.gain.setValueAtTime(0.0001, now)
  whooshGain.gain.exponentialRampToValueAtTime(0.32, now + seconds * 0.45)
  whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + seconds)
  whoosh.connect(band).connect(whooshGain)
  whooshGain.connect(master)
  whooshGain.connect(reverb)
  whoosh.start(now)

  const sub = ctx.createOscillator()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(80, now)
  sub.frequency.exponentialRampToValueAtTime(36, now + seconds)
  const subGain = ctx.createGain()
  subGain.gain.setValueAtTime(0.0001, now)
  subGain.gain.exponentialRampToValueAtTime(0.2, now + seconds * 0.3)
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + seconds)
  sub.connect(subGain).connect(master)
  sub.start(now)
  sub.stop(now + seconds + 0.05)
}

/** A short, soft blip: `hover` is a quiet high tick, `click` a two-note confirm. */
export function playUi(kind: 'hover' | 'click') {
  if (!enabled || !context || !master || !reverb) return
  const ctx = context
  const now = ctx.currentTime
  // Throttle so sweeping across a menu doesn't machine-gun.
  if (kind === 'hover' && now - lastUiSound < 0.06) return
  lastUiSound = now
  const tones = kind === 'hover' ? [[note(88), 0, 0.06, 0.03]] : [[note(76), 0, 0.12, 0.09], [note(83), 0.06, 0.18, 0.07]]
  for (const [frequency, offset, length, level] of tones) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, now + offset)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now + offset)
    gain.gain.exponentialRampToValueAtTime(level, now + offset + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + length)
    osc.connect(gain)
    gain.connect(master)
    if (kind === 'click') gain.connect(reverb)
    osc.start(now + offset)
    osc.stop(now + offset + length + 0.02)
  }
}
