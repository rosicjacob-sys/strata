import gsap from 'gsap'
import { useReveal } from '../lib/reveal'

/** The brand motif: stacked strata layers that draw in on scroll — one carries
 * the live accent. Pure decoration, so it lives outside the reveal-failsafe
 * contract (never hides content). */
export default function StrataLines() {
  const scope = useReveal((el) =>
    gsap.from(el.querySelectorAll('span'), {
      scaleX: 0,
      transformOrigin: 'left',
      duration: 0.9,
      ease: 'power4.out',
      stagger: 0.07,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  )
  return (
    <div className="strata-lines container" ref={scope} aria-hidden="true">
      <span />
      <span />
      <span className="strata-accent" />
      <span />
      <span />
    </div>
  )
}
