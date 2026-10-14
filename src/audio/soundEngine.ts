/**
 * Procedural ship ambience built on the Web Audio API: no audio files, a few KB
 * of code, and it never loops audibly. Nothing is created until the visitor
 * opts in, which is also the user gesture browsers require before playing sound.
 */

let context: AudioContext | null = null
let master: GainNode | null = null
let ambienceStarted = false
let enabled = false

function getContext() {
  if (!context) {
    context = new AudioContext()
    master = context.createGain()
    master.gain.value = 0
    master.connect(context.destination)
  }
  return { context, master: master as GainNode }
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

function startAmbience(ctx: AudioContext, out: AudioNode) {
  // Engine drone: two detuned saws through a slowly breathing low-pass.
  const droneFilter = ctx.createBiquadFilter()
  droneFilter.type = 'lowpass'
  droneFilter.frequency.value = 300
  droneFilter.Q.value = 0.8
  lfo(ctx, 0.06, 110, droneFilter.frequency)
  const droneGain = ctx.createGain()
  droneGain.gain.value = 0.05
  droneFilter.connect(droneGain).connect(out)
  for (const frequency of [55, 55.35, 27.5]) {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = frequency
    osc.connect(droneFilter)
    osc.start()
  }

  // Pad: a quiet open fifth with slow tremolo.
  const padGain = ctx.createGain()
  padGain.gain.value = 0.018
  lfo(ctx, 0.11, 0.008, padGain.gain)
  padGain.connect(out)
  for (const frequency of [110, 164.81, 220.4]) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = frequency
    osc.connect(padGain)
    osc.start()
  }

  // Air: filtered noise, like the hull's ventilation.
  const air = ctx.createBufferSource()
  air.buffer = noiseBuffer(ctx, 4)
  air.loop = true
  const airFilter = ctx.createBiquadFilter()
  airFilter.type = 'bandpass'
  airFilter.frequency.value = 900
  airFilter.Q.value = 0.5
  lfo(ctx, 0.04, 350, airFilter.frequency)
  const airGain = ctx.createGain()
  airGain.gain.value = 0.012
  air.connect(airFilter).connect(airGain).connect(out)
  air.start()
}

export function setSoundEnabled(on: boolean) {
  enabled = on
  if (!on && !context) return
  const { context: ctx, master: out } = getContext()
  if (ctx.state === 'suspended') void ctx.resume()
  if (on && !ambienceStarted) {
    startAmbience(ctx, out)
    ambienceStarted = true
  }
  out.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.35)
}

/** Light-speed whoosh: a swept noise band over a falling sub rumble. */
export function playWarp(seconds = 1.6) {
  if (!enabled || !context || !master) return
  const ctx = context
  const now = ctx.currentTime

  const whoosh = ctx.createBufferSource()
  whoosh.buffer = noiseBuffer(ctx, seconds)
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 1.2
  band.frequency.setValueAtTime(260, now)
  band.frequency.exponentialRampToValueAtTime(2600, now + seconds * 0.5)
  band.frequency.exponentialRampToValueAtTime(320, now + seconds)
  const whooshGain = ctx.createGain()
  whooshGain.gain.setValueAtTime(0.0001, now)
  whooshGain.gain.exponentialRampToValueAtTime(0.22, now + seconds * 0.45)
  whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + seconds)
  whoosh.connect(band).connect(whooshGain).connect(master)
  whoosh.start(now)

  const sub = ctx.createOscillator()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(90, now)
  sub.frequency.exponentialRampToValueAtTime(34, now + seconds)
  const subGain = ctx.createGain()
  subGain.gain.setValueAtTime(0.0001, now)
  subGain.gain.exponentialRampToValueAtTime(0.18, now + seconds * 0.3)
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + seconds)
  sub.connect(subGain).connect(master)
  sub.start(now)
  sub.stop(now + seconds + 0.05)
}
