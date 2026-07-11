import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { vialStore } from './vialStore'
import { MQ_DESKTOP, MQ_MOBILE, MQ_REDUCED_DESKTOP, MQ_REDUCED_MOBILE } from '../lib/env'

gsap.registerPlugin(ScrollTrigger)

/**
 * STRATA v2 choreography: shape-weight profiles + a scroll-driven camera rig
 * (dolly/height/orbit/focus) scrubbed per section. The pinned process scene
 * owns weights, rungReveal, and the orbit sweep inside its gap (Process.jsx).
 */
export function useVialChoreography() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()

    const wp = (trigger, vars, start = 'top bottom', end = 'top 25%') =>
      gsap.to(vialStore, {
        ...vars,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger, start, end, scrub: 0.5, invalidateOnRefresh: true },
      })

    const intro = () =>
      gsap.to(vialStore, { intro: 1, duration: 1.7, ease: 'power3.out', delay: 0.15 })

    mm.add(MQ_DESKTOP, () => {
      gsap.set(vialStore, {
        x: 0.26, y: 0, scale: 1, spotlight: 0, pose: 0,
        wCloud: 1, wMound: 0, wHelix: 0, wTorus: 0, rungReveal: 0,
        camZ: 7.5, camY: 0.15, camOrbit: 0, camFocus: 0, lookY: 0,
      })
      intro()
      // cloud -> settled mound; camera sinks low and pushes in a touch
      wp('#catalog', {
        x: -0.405, y: -0.02, scale: 0.53, wCloud: 0, wMound: 1, wHelix: 0, wTorus: 0,
        camZ: 7.1, camY: -0.4, lookY: -0.08,
      })
      // approach the pin as a mound; camera returns to eye level
      wp('#process', {
        x: 0.24, y: 0, scale: 0.85, wMound: 1, wCloud: 0, wHelix: 0, wTorus: 0,
        camZ: 6.1, camY: 0.05, lookY: 0, camFocus: 0.5, camOrbit: -0.3,
      })
      // dark verification: low angle looking up at the sequenced helix
      wp('#verify', {
        x: 0.33, y: 0, scale: 1.0, spotlight: 1,
        wHelix: 1, wMound: 0, wCloud: 0, wTorus: 0, rungReveal: 1,
        camZ: 6.4, camY: -0.7, lookY: 0.35, camFocus: 0.3, camOrbit: 0.15,
      }, 'top 85%', 'top 30%')
      // relax beside the ledger
      wp('#reviews', {
        x: 0.32, y: 0.05, scale: 0.42, spotlight: 0,
        wCloud: 1, wHelix: 0, wMound: 0, wTorus: 0,
        camZ: 7.3, camY: 0.1, lookY: 0, camFocus: 0, camOrbit: 0,
      }, 'top 95%', 'top 45%')
      // dose ring beside the buy box; slight top-down
      wp('#order', {
        x: -0.3, y: 0.02, scale: 0.5, wTorus: 1, wCloud: 0, wHelix: 0, wMound: 0,
        camZ: 6.8, camY: 0.9, lookY: -0.1,
      })
      const arriveD = ScrollTrigger.create({
        trigger: '#order', start: 'top 55%', once: true,
        onEnter: () => window.dispatchEvent(new CustomEvent('vial-arrived')),
      })
      wp('#final-cta', {
        x: 0.26, y: -0.03, scale: 0.62, wCloud: 1, wTorus: 0, dropY: 0,
        camZ: 7.5, camY: 0.15, lookY: 0, camOrbit: 0, camFocus: 0,
      }, 'top bottom', 'top 45%')
      wp('#site-footer', { y: -0.95 }, 'top bottom', 'top 60%')
      return () => arriveD.kill()
    })

    mm.add(MQ_MOBILE, () => {
      gsap.set(vialStore, {
        x: 0.18, y: -0.42, scale: 0.5, spotlight: 0, pose: 0,
        wCloud: 1, wMound: 0, wHelix: 0, wTorus: 0, rungReveal: 0,
        camZ: 7.5, camY: 0.15, camOrbit: 0, camFocus: 0, lookY: 0,
      })
      intro()
      wp('#catalog', { x: 0.28, y: 0.32, scale: 0.26, wCloud: 0, wMound: 1, wHelix: 0, wTorus: 0 })
      wp('#process', {
        x: 0.02, y: 0.24, scale: 0.5, pose: 1,
        wHelix: 1, wMound: 0, wCloud: 0, wTorus: 0, rungReveal: 1, camOrbit: -0.25,
      }, 'top 80%', 'top 12%')
      wp('#verify', { x: 0, y: 0.26, scale: 0.56, spotlight: 1, pose: 0, camY: -0.4, lookY: 0.25 }, 'top 85%', 'top 28%')
      wp('#reviews', { x: 0.3, y: 0.32, scale: 0.26, spotlight: 0, wCloud: 1, wHelix: 0, rungReveal: 0, camY: 0.15, lookY: 0, camOrbit: 0 }, 'top 95%', 'top 45%')
      wp('#order', { x: 0.28, y: 0.3, scale: 0.3, wTorus: 1, wCloud: 0 })
      const arriveM = ScrollTrigger.create({
        trigger: '#order', start: 'top 55%', once: true,
        onEnter: () => window.dispatchEvent(new CustomEvent('vial-arrived')),
      })
      wp('#final-cta', { x: 0, y: -0.16, scale: 0.52, wCloud: 1, wTorus: 0, dropY: 0 }, 'top bottom', 'top 45%')
      wp('#site-footer', { y: -0.95 }, 'top bottom', 'top 60%')
      return () => arriveM.kill()
    })

    const staticPose = (mobile) => () =>
      gsap.set(vialStore, {
        x: mobile ? 0.18 : 0.26,
        y: mobile ? -0.42 : 0,
        scale: mobile ? 0.5 : 0.92,
        intro: 1,
        wCloud: 0, wMound: 0, wHelix: 1, wTorus: 0,
        rungReveal: 1,
        spotlight: 0,
        pose: 0,
        dropY: 0,
        camZ: 7.5, camY: 0.15, camOrbit: 0, camFocus: 0, lookY: 0,
      })
    mm.add(MQ_REDUCED_DESKTOP, staticPose(false))
    mm.add(MQ_REDUCED_MOBILE, staticPose(true))

    return () => mm.revert()
  }, [])
}
