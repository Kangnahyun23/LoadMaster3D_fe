import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import { Group, Vector3 } from 'three'
import type { Vec3 } from './units'

/** A bounded screen-size label; its leader always ends at the actual world anchor. */
export function SceneCallout({ position, offset = [0, -64], width = 160, children }: {
  position?: Vec3; offset?: [number, number]; width?: number; children: ReactNode
}) {
  const anchor = useRef<Group>(null), label = useRef<HTMLDivElement>(null), leader = useRef<SVGPathElement>(null)
  const projected = useRef(new Vector3()), previous = useRef('')
  useFrame(({ camera, size }) => {
    if (!anchor.current || !label.current || !leader.current) return
    let visible = true
    for (let node = anchor.current.parent; node; node = node.parent) if (!node.visible) visible = false
    label.current.style.display = visible ? '' : 'none'
    leader.current.style.display = visible ? '' : 'none'
    if (!visible) return
    anchor.current.getWorldPosition(projected.current).project(camera)
    const x = (projected.current.x + 1) * size.width / 2, y = (1 - projected.current.y) * size.height / 2
    const halfWidth = Math.min(width, size.width - 24) / 2, halfHeight = label.current.offsetHeight / 2
    const dx = Math.max(halfWidth + 12, Math.min(size.width - halfWidth - 12, x + offset[0])) - x
    const dy = Math.max(halfHeight + 12, Math.min(size.height - halfHeight - 12, y + offset[1])) - y
    const key = `${dx.toFixed(1)},${dy.toFixed(1)},${halfHeight}`
    if (key === previous.current) return
    previous.current = key
    label.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
    leader.current.setAttribute('d', `M 0 0 L ${dx} ${dy + (dy < 0 ? halfHeight : -halfHeight)}`)
  })
  return <group ref={anchor} position={position}>
    <Html zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <svg className="absolute overflow-visible text-bg/70" width="1" height="1" aria-hidden><path ref={leader} fill="none" stroke="currentColor" strokeWidth="1" /></svg>
      <div ref={label} data-scene-callout className="absolute text-center" style={{ width }}>{children}</div>
    </Html>
  </group>
}
