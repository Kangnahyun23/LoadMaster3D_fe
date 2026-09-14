import { useEffect, useMemo } from 'react'
import { BoxGeometry, EdgesGeometry } from 'three'
import type { Placement, VehicleSpec } from '@/types/load-plan'
import { readToken } from '@/lib/tokens'
import { MM } from '../scene/units'

/** Advisory volume only, with real depth testing; no claim of an executable path. */
export function ExtractionCorridor({ target, vehicle, blocked }: { target: Placement; vehicle: VehicleSpec; blocked: boolean }) {
  const edges = useMemo(() => {
    const box = new BoxGeometry(1, 1, 1), result = new EdgesGeometry(box)
    box.dispose(); return result
  }, [])
  useEffect(() => () => edges.dispose(), [edges])
  const start = target.position.x + target.lengthMm, length = Math.max(0, vehicle.innerLengthMm - start)
  if (!length) return null
  return <lineSegments name="extraction-corridor" geometry={edges} raycast={() => null}
    position={[(start + length / 2) * MM, (target.position.z + target.heightMm / 2) * MM, (target.position.y + target.widthMm / 2) * MM]}
    scale={[length * MM, target.heightMm * MM, target.widthMm * MM]}>
    <lineBasicMaterial color={readToken(blocked ? '--warning' : '--info')} transparent opacity={0.7} />
  </lineSegments>
}
