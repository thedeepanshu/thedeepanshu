import { noiseBuffer, note } from './dsp'

/**
 * The Beyond theme: a warm, lo-fi loop for the crew quarters, synthesised like
 * the ship music. FM electric-piano chords on a slow ii–V-ish turn, a soft bass,
 * a lazy swung beat with brushed hats, and vinyl crackle, all through a low-pass
 * so nothing is bright. Notes are scheduled a little ahead on the audio clock
 * (the usual Web Audio lookahead pattern), and only while the theme is wanted.
 */

const BPM = 74
const BEAT = 60 / BPM
const EIGHTH = BEAT / 2
/** How late the off-beat eighths land: the swing that makes it lazy. */
const SWING = EIGHTH * 0.22
const LOOKAHEAD = 0.35

// Fmaj9 → Em7 → Dm9 → Cmaj7, voiced around middle C (MIDI note numbers).
const CHORDS = [
  [53, 57, 64, 67, 69],
  [52, 55, 59, 62, 67],
  [50, 57, 60, 64, 65],
  [48, 55, 59, 62, 64],
]
const BASS = [41, 40, 38, 36]
// Melody notes for the occasional fill: C major pentatonic, one octave up.
const MELODY = [72, 74, 76, 79, 81]

export type Lounge = { start: () => void; stop: () => void }

export function createLounge(ctx: AudioContext, out: AudioNode, room: AudioNode): Lounge {
  // Everything runs through a warm low-pass; a little goes to the hall reverb.
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 2600
  tone.Q.value = 0.5
  tone.connect(out)
  const send = ctx.createGain()
  send.gain.value = 0.22
  tone.connect(send).connect(room)

  const noise = noiseBuffer(ctx, 2)
  let crackle: AudioBufferSourceNode | null = null
  let timer = 0
  let step = 0
  let nextTime = 0

  /** Two-operator FM: a sine carrier with a decaying modulator, like a Rhodes tine. */
  function keys(time: number, midi: number, level: number, length: number) {
    const frequency = note(midi)
    const carrier = ctx.createOscillator()
    carrier.frequency.value = frequency
    const modulator = ctx.createOscillator()
    modulator.frequency.value = frequency
    const depth = ctx.createGain()
    depth.gain.setValueAtTime(frequency * 1.6, time)
    depth.gain.exponentialRampToValueAtTime(frequency * 0.08, time + 0.6)
    modulator.connect(depth).connect(carrier.frequency)
    const amp = ctx.createGain()
    amp.gain.setValueAtTime(0.0001, time)
    amp.gain.exponentialRampToValueAtTime(level, time + 0.008)
    amp.gain.exponentialRampToValueAtTime(0.0001, time + length)
    carrier.connect(amp).connect(tone)
    carrier.start(time)
    modulator.start(time)
    carrier.stop(time + length + 0.05)
    modulator.stop(time + length + 0.05)
  }

  function bass(time: number, midi: number) {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = note(midi)
    const amp = ctx.createGain()
    amp.gain.setValueAtTime(0.0001, time)
    amp.gain.exponentialRampToValueAtTime(0.11, time + 0.02)
    amp.gain.exponentialRampToValueAtTime(0.0001, time + BEAT * 1.6)
    osc.connect(amp).connect(tone)
    osc.start(time)
    osc.stop(time + BEAT * 1.7)
  }

  function kick(time: number, level = 0.32) {
    const osc = ctx.createOscillator()
    osc.frequency.setValueAtTime(110, time)
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.18)
    const amp = ctx.createGain()
    amp.gain.setValueAtTime(level, time)
    amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.32)
    osc.connect(amp).connect(tone)
    osc.start(time)
    osc.stop(time + 0.35)
  }

  /** Filtered noise: a soft brushed snare, or a short closed hat. */
  function brush(time: number, kind: 'snare' | 'hat', level: number) {
    const source = ctx.createBufferSource()
    source.buffer = noise
    const filter = ctx.createBiquadFilter()
    filter.type = kind === 'snare' ? 'bandpass' : 'highpass'
    filter.frequency.value = kind === 'snare' ? 1700 : 6500
    filter.Q.value = kind === 'snare' ? 0.8 : 0.7
    const length = kind === 'snare' ? 0.22 : 0.05
    const amp = ctx.createGain()
    amp.gain.setValueAtTime(level, time)
    amp.gain.exponentialRampToValueAtTime(0.0001, time + length)
    source.connect(filter).connect(amp)
    // Hats skip the low-pass so they keep a little air.
    amp.connect(kind === 'hat' ? out : tone)
    source.start(time, Math.random() * 1.5, length + 0.02)
  }

  /** Sparse pops on a faint hiss, looped: the record under the needle. */
  function startCrackle() {
    const seconds = 3
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.012
      if (Math.random() < 0.00018) data[i] = (Math.random() * 2 - 1) * (0.3 + Math.random() * 0.5)
    }
    crackle = ctx.createBufferSource()
    crackle.buffer = buffer
    crackle.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2400
    filter.Q.value = 0.4
    const amp = ctx.createGain()
    amp.gain.value = 0.16
    crackle.connect(filter).connect(amp).connect(out)
    crackle.start()
  }

  /** One eighth-note step: 8 per bar, one chord per bar. */
  function play(index: number, time: number) {
    const bar = Math.floor(index / 8) % CHORDS.length
    const eighth = index % 8
    const chord = CHORDS[bar]
    const humanise = () => (Math.random() - 0.5) * 0.012

    // Keys: a soft strummed chord on the downbeat, a lighter push before beat 3.
    if (eighth === 0) chord.forEach((midi, i) => keys(time + i * 0.018 + humanise(), midi, 0.05, BEAT * 3.4))
    if (eighth === 3 && Math.random() < 0.7) chord.slice(1, 4).forEach((midi, i) => keys(time + i * 0.014 + humanise(), midi, 0.03, BEAT * 1.4))
    // Now and then, a short melody note over the top.
    if ((eighth === 5 || eighth === 7) && Math.random() < 0.28) keys(time + humanise(), MELODY[Math.floor(Math.random() * MELODY.length)], 0.028, BEAT * 1.8)

    if (eighth === 0) bass(time, BASS[bar])
    if (eighth === 4 && Math.random() < 0.6) bass(time, BASS[bar] + 7)

    if (eighth === 0) kick(time)
    if (eighth === 5 && Math.random() < 0.45) kick(time, 0.2)
    if (eighth === 4 || (eighth === 6 && index % 16 === 14)) kick(time, 0.24)
    if (eighth === 2 || eighth === 6) brush(time, 'snare', 0.09)
    brush(time, 'hat', eighth % 2 ? 0.018 : 0.03)
  }

  function schedule() {
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      play(step, nextTime + (step % 2 ? SWING : 0))
      step += 1
      nextTime += EIGHTH
    }
  }

  return {
    start() {
      if (timer) return
      step = 0
      nextTime = ctx.currentTime + 0.1
      startCrackle()
      schedule()
      timer = window.setInterval(schedule, 100)
    },
    stop() {
      window.clearInterval(timer)
      timer = 0
      crackle?.stop()
      crackle = null
    },
  }
}
