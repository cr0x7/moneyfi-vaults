'use client'

import { useEffect, useRef } from 'react'

/**
 * Custom cursor:
 *  • Small green dot — snaps to exact mouse position
 *  • Larger ring   — lerps (lags) behind the dot each RAF frame
 *  • Hover over interactive elements → ring expands
 *  • Click → ring pulse-shrinks then bounces back
 */
export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run on devices that have a fine pointer (desktop mouse)
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot  = dotRef.current!
    const ring = ringRef.current!

    // Hide native cursor globally
    document.documentElement.style.cursor = 'none'

    // Current real mouse position
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    // Ring's interpolated position
    const pos   = { x: mouse.x, y: mouse.y }

    let raf = 0
    let isHovering = false
    let isClicking = false

    // ── Mouse move ──────────────────────────────────────────
    function onMove(e: MouseEvent) {
      mouse.x = e.clientX
      mouse.y = e.clientY

      // Dot is instant
      dot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`
    }

    // ── Hover detection ─────────────────────────────────────
    const SELECTORS = 'a, button, [role="button"], input, select, textarea, label, [data-hover]'

    function onEnter() {
      isHovering = true
      ring.style.width  = '52px'
      ring.style.height = '52px'
      ring.style.borderColor = '#00e676'
      ring.style.opacity = '0.6'
      dot.style.transform  // dot shrinks handled in RAF loop
      dot.style.width  = '4px'
      dot.style.height = '4px'
    }

    function onLeave() {
      isHovering = false
      ring.style.width  = '36px'
      ring.style.height = '36px'
      ring.style.opacity = '1'
      dot.style.width  = '8px'
      dot.style.height = '8px'
    }

    // ── Click pulse ─────────────────────────────────────────
    function onDown() {
      isClicking = true
      ring.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) scale(0.7)`
      ring.style.transition = 'width 0.2s, height 0.2s, opacity 0.2s, transform 0.08s'
    }

    function onUp() {
      isClicking = false
      ring.style.transition = 'width 0.2s, height 0.2s, opacity 0.2s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'
    }

    // ── RAF loop: lerp ring toward dot ───────────────────────
    const LERP = 0.11  // 0 = never moves, 1 = instant — 0.11 ≈ 9 frames lag

    function tick() {
      pos.x += (mouse.x - pos.x) * LERP
      pos.y += (mouse.y - pos.y) * LERP

      if (!isClicking) {
        ring.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
      }

      raf = requestAnimationFrame(tick)
    }

    // ── Attach everything ────────────────────────────────────
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)

    // Use event delegation on document for hover
    function onDelegateEnter(e: MouseEvent) {
      if ((e.target as Element).closest(SELECTORS)) onEnter()
    }
    function onDelegateLeave(e: MouseEvent) {
      if ((e.target as Element).closest(SELECTORS)) onLeave()
    }
    document.addEventListener('mouseover',  onDelegateEnter)
    document.addEventListener('mouseout',   onDelegateLeave)

    // Start
    dot.style.opacity  = '1'
    ring.style.opacity = '1'
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
      document.removeEventListener('mouseover',  onDelegateEnter)
      document.removeEventListener('mouseout',   onDelegateLeave)
      document.documentElement.style.cursor = ''
    }
  }, [])

  return (
    <>
      {/* Inner dot — exact position */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#00e676',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: 0,
          boxShadow: '0 0 6px 1px #00e67699',
          transition: 'width 0.2s, height 0.2s',
          willChange: 'transform',
        }}
      />

      {/* Outer ring — lagging */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1.5px solid #00e676',
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: 0,
          transition: 'width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          willChange: 'transform',
        }}
      />
    </>
  )
}
