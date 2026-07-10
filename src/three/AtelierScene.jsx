import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import StrataParticles from './StrataParticles'
import { vialStore } from './vialStore'
import { coarsePointer } from '../lib/env'
import { radialTexture } from './textures'

const T_FIXED = 0.9
const DESKTOP_COUNTS = { backbone: 560, rungs: 26, perRung: 8, dust: 5000 } // ~5768
const MOBILE_COUNTS = { backbone: 200, rungs: 14, perRung: 6, dust: 850 } // ~1134
// Bloom rides a transparent canvas — flip off if the visual test shows artifacts.
const ENABLE_BLOOM = true

export default function AtelierScene({ reduced, mobile }) {
  const posRef = useRef(null)
  const swayRef = useRef(null)
  const keyRef = useRef(null)
  const rimRef = useRef(null)
  const fillRef = useRef(null)
  const glowRef = useRef(null)
  const shadowRef = useRef(null)
  const bloomRef = useRef(null)
  const ptr = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const look = useMemo(() => new THREE.Vector3(), [])

  const shadowTex = useMemo(() => radialTexture('20,23,26', 0.5), [])
  const glowTex = useMemo(() => radialTexture('120,140,170', 0.5), [])

  useEffect(() => {
    if (reduced || coarsePointer()) return
    const onMove = (e) => {
      ptr.current.tx = (e.clientX / window.innerWidth) * 2 - 1
      ptr.current.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduced])

  const apply = (state, t) => {
    if (!posRef.current || !swayRef.current) return
    const s = vialStore
    const vw = state.viewport.width
    const vh = state.viewport.height
    const p = ptr.current
    p.x += (p.tx - p.x) * 0.06
    p.y += (p.ty - p.y) * 0.06

    const sc = Math.max(vh * 0.15 * s.scale * s.intro, 0.0001)
    const px = s.x * vw
    const py = (s.y + s.dropY) * vh
    posRef.current.position.set(px, py, 0)
    posRef.current.scale.setScalar(sc)
    s._worldScale = sc
    swayRef.current.rotation.set(0.05 + p.y * 0.05 + s.pose * 0.4, s.pose * 0.6, 0)

    // --- scroll-driven camera: dolly + height + orbit, pointer parallax on
    // top. camFocus dials the anchor from the page axis (0 — protagonist sits
    // off-center, like v1's fixed camera) to the object itself (1 — the pin
    // circles the assembling helix). ---
    const cam = state.camera
    const orbit = s.camOrbit + p.x * 0.08
    const cz = s.camZ
    const ax = px * s.camFocus
    const ay = py * s.camFocus
    cam.position.set(
      ax + Math.sin(orbit) * cz,
      ay + s.camY + p.y * 0.35,
      Math.cos(orbit) * cz
    )
    look.set(ax, ay + s.lookY, 0)
    cam.lookAt(look)

    const sum = Math.max(s.wCloud + s.wMound + s.wHelix + s.wTorus, 0.0001)
    const wh = Math.max(s.wHelix, 0) / sum
    const wm = Math.max(s.wMound, 0) / sum

    if (keyRef.current) keyRef.current.intensity = 2.1 + s.spotlight * 1.4
    if (fillRef.current) fillRef.current.intensity = 0.6 - s.spotlight * 0.35
    if (rimRef.current) {
      rimRef.current.intensity = 0.8 + s.spotlight * 2.6 + wh * 0.6
      rimRef.current.color.copy(s.color)
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.09 + wh * 0.1 + s.spotlight * 0.12
      glowRef.current.material.color.copy(s.color)
      glowRef.current.scale.set(sc * 5.8, sc * 5.8, 1)
      glowRef.current.position.set(px, py, -1.6)
    }
    if (shadowRef.current) {
      shadowRef.current.material.opacity = (0.1 + wm * 0.2) * (1 - s.spotlight * 0.6) * s.intro
      shadowRef.current.scale.set(sc * 2.5, sc * 0.6, 1)
      shadowRef.current.position.set(px, py - sc * 1.5, -0.4)
    }
    if (bloomRef.current) bloomRef.current.intensity = 0.22 + s.spotlight * 0.45
  }

  useFrame((state) => {
    if (document.hidden && !window.__QA__) return
    apply(state, reduced ? T_FIXED : state.clock.elapsedTime)
  })

  const three = useThree()
  useEffect(() => {
    if (!reduced) return
    apply(three, T_FIXED)
    three.invalidate()
  })

  useEffect(() => {
    if (!reduced) return
    const onSnap = () => {
      apply(three, T_FIXED)
      three.invalidate()
    }
    window.addEventListener('vial-color-snap', onSnap)
    return () => window.removeEventListener('vial-color-snap', onSnap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  const usePost = ENABLE_BLOOM && !mobile && !reduced
  return (
    <>
      <ambientLight ref={fillRef} intensity={0.6} color="#e8ecf2" />
      <directionalLight ref={keyRef} position={[3, 4.5, 4]} intensity={2.1} color="#ffffff" />
      <directionalLight position={[-4, 1, 3]} intensity={0.5} color="#d8e2f0" />
      <directionalLight ref={rimRef} position={[-2, 1.5, -4]} intensity={0.8} color="#1F6FEB" />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={1.2} position={[0, 3, 4]} scale={[7, 3, 1]} color="#ffffff" />
        <Lightformer intensity={0.7} position={[-4, 0, 2]} rotation-y={Math.PI / 3} scale={[3, 5, 1]} color="#eef2f8" />
        <Lightformer intensity={0.5} position={[4, -1, -2]} rotation-y={-Math.PI / 3} scale={[3, 4, 1]} color="#c9d4e2" />
      </Environment>
      <sprite ref={glowRef} renderOrder={-2}>
        <spriteMaterial map={glowTex} transparent opacity={0} depthWrite={false} />
      </sprite>
      <sprite ref={shadowRef} renderOrder={-1}>
        <spriteMaterial map={shadowTex} transparent opacity={0} depthWrite={false} />
      </sprite>
      <group ref={posRef}>
        <group ref={swayRef}>
          <StrataParticles counts={mobile ? MOBILE_COUNTS : DESKTOP_COUNTS} reduced={reduced} />
        </group>
      </group>
      {usePost && (
        <EffectComposer multisampling={0}>
          <Bloom
            ref={bloomRef}
            mipmapBlur
            intensity={0.25}
            luminanceThreshold={0.75}
            luminanceSmoothing={0.25}
            radius={0.72}
          />
        </EffectComposer>
      )}
    </>
  )
}
