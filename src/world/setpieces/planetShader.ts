// Shared by the Flight path planets and the Observation deck's giant.

export const planetVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vObject;
  void main() {
    vObject = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Banded gas-giant surface lit from the upper left, with a fresnel rim in the
// planet's accent colour that brightens when the stop is active.
export const planetFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uActive;
  uniform float uTime;
  uniform float uRadius;
  varying vec3 vNormal;
  varying vec3 vObject;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    vec3 p = vObject / uRadius;
    float warp = noise(p * 3.0 + vec3(uTime * 0.05, 0.0, 0.0));
    float bands = 0.5 + 0.5 * sin(p.y * 9.0 + warp * 4.0);
    vec3 surface = mix(uColorB, uColorA * 0.55, bands * 0.6 + noise(p * 6.0) * 0.25);
    float light = clamp(dot(normalize(vNormal), normalize(vec3(-0.5, 0.6, 0.6))), 0.0, 1.0) * 0.75 + 0.25;
    float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 2.6);
    vec3 color = surface * light * mix(0.55, 1.0, uActive) + uColorA * fresnel * (0.6 + uActive * 1.4);
    gl_FragColor = vec4(color, 1.0);
  }
`
