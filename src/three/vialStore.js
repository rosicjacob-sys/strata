import * as THREE from 'three'

// STRATA v2 store. GSAP + the cart write it; the R3F scene reads it every
// frame. x/y are viewport-fraction offsets from center; scale 1 = hero size.
// Shape is a weight vector (normalized in the shader feed). v2 adds a scroll-
// driven CAMERA rig: dolly (camZ), height (camY), orbit (camOrbit, radians
// around the protagonist) and look bias (lookY).
export const vialStore = {
  x: 0.26,
  y: 0.0,
  scale: 1,
  intro: 0,
  // shape weights
  wCloud: 1,
  wMound: 0,
  wHelix: 0,
  wTorus: 0,
  rungReveal: 0,
  spotlight: 0,
  pose: 0,
  dropY: 0,
  // camera rig
  camZ: 7.5,
  camY: 0.15,
  camOrbit: 0,
  camFocus: 0, // 0 = orbit the page axis, 1 = orbit the protagonist
  lookY: 0,
  // internals
  _worldScale: 1, // written by the scene, read by the point shader
  // powder color — lerped toward the active peptide
  color: new THREE.Color('#1F6FEB'),
  colorDeep: new THREE.Color('#0B3D91'),
  targetColor: new THREE.Color('#1F6FEB'),
  targetDeep: new THREE.Color('#0B3D91'),
}

export function setVialColor(hex, deepHex, snap = false) {
  vialStore.targetColor.set(hex)
  vialStore.targetDeep.set(deepHex)
  if (snap) {
    vialStore.color.set(hex)
    vialStore.colorDeep.set(deepHex)
    window.dispatchEvent(new CustomEvent('vial-color-snap'))
  }
}
