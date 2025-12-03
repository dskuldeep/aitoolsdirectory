'use client'

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create floating orbs
    const orbs: Array<{ element: HTMLDivElement; x: number; y: number; vx: number; vy: number }> = []

    for (let i = 0; i < 5; i++) {
      const orb = document.createElement('div')
      orb.className = 'absolute rounded-full blur-3xl opacity-20'
      orb.style.width = `${Math.random() * 300 + 200}px`
      orb.style.height = orb.style.width
      orb.style.background = `radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 100%)`
      
      const x = Math.random() * 100
      const y = Math.random() * 100
      const vx = (Math.random() - 0.5) * 0.02
      const vy = (Math.random() - 0.5) * 0.02

      orb.style.left = `${x}%`
      orb.style.top = `${y}%`

      container.appendChild(orb)
      orbs.push({ element: orb, x, y, vx, vy })
    }

    // Animate orbs
    const animate = () => {
      orbs.forEach((orb) => {
        orb.x += orb.vx
        orb.y += orb.vy

        // Bounce off edges
        if (orb.x < 0 || orb.x > 100) orb.vx *= -1
        if (orb.y < 0 || orb.y > 100) orb.vy *= -1

        orb.element.style.left = `${orb.x}%`
        orb.element.style.top = `${orb.y}%`
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      orbs.forEach((orb) => orb.element.remove())
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />
}

