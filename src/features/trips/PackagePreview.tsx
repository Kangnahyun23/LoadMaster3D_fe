import { useMemo } from 'react'
import { effectiveOrientations } from '@/domain/geometry'
import type { CargoPackage } from '@/domain/models'
import { useFormat, useT } from '@/lib/i18n'
import { boxFaces, createProjector, sortByDepth, tint } from '@/lib/isometric'
import { stopColor, stopForeground } from '@/lib/stops'
import type { StopRow } from './trip-summary'

/** Cạnh dài nhất của hình = 3 đơn vị, mỗi đơn vị 30 px: kiện nào cũng vừa khung, tỉ lệ ba cạnh giữ đúng. */
const SCALE = 30
const MAX_EDGE_UNITS = 3
const CUBIC_CM_PER_LITER = 1000

/**
 * Phần xem kiện ở đầu panel kiện (V2): hình đẳng cự theo đúng tỉ lệ kích thước (không phải vị trí xếp), điểm giao, số lượng, khối
 * lượng một kiện và cả dòng, thể tích một kiện, và yêu cầu xếp đọc được bằng lời. Mọi số từ chính kiện; người chỉ xem thấy phần
 * này thay cho form.
 */
export function PackagePreview({ pkg, stop }: { pkg: CargoPackage; stop: StopRow | undefined }) {
  const t = useT()
  const format = useFormat()
  const size = format.dimensions(pkg.lengthCm, pkg.widthCm, pkg.heightCm)
  const figure = useMemo(() => {
    const longest = Math.max(pkg.lengthCm, pkg.widthCm, pkg.heightCm, 1)
    const k = MAX_EDGE_UNITS / longest
    // Hộp lập phương 3 đơn vị chiếm từ y = 10 tới 190 — khung 200 cao chứa được mọi tỉ lệ
    const project = createProjector(SCALE, 130, 100)
    const faces = boxFaces(
      { x: 0, y: 0, z: 0, length: pkg.lengthCm * k, width: pkg.widthCm * k, height: pkg.heightCm * k, color: tint(stopColor(pkg.deliveryStop), 0.55) },
      project,
      { stroke: 'rgba(0,0,0,.2)', strokeWidth: 0.8, topTint: 0.3 },
    )
    return sortByDepth(faces)
  }, [pkg.lengthCm, pkg.widthCm, pkg.heightCm, pkg.deliveryStop])

  const stats = [
    { label: t('trips.packages.preview.quantity'), value: format.integer(pkg.quantity) },
    { label: t('trips.packages.preview.each'), value: format.weight(pkg.weightKg) },
    { label: t('trips.packages.preview.totalWeight'), value: format.weight(pkg.weightKg * pkg.quantity) },
    {
      label: t('trips.packages.preview.volumeEach'),
      value: t('trips.packages.preview.liters', { value: format.decimal((pkg.lengthCm * pkg.widthCm * pkg.heightCm) / CUBIC_CM_PER_LITER) }),
    },
  ]
  const requirements = [
    t('trips.packages.preview.fragility', { level: t(`trips.form.fragilityLevels.${pkg.fragilityLevel}`) }),
    ...(pkg.keepUpright ? [t('trips.packages.preview.upright')] : []),
    t('trips.packages.preview.orientations', { count: effectiveOrientations(pkg).length }),
    pkg.stackable
      ? t('trips.packages.preview.maxTopLoad', { weight: format.weight(pkg.maxTopLoadKg) })
      : t('trips.packages.preview.noStack'),
  ]

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-h3 font-semibold text-ink-strong">{pkg.name}</span>
        {stop ? (
          <span className="flex items-center gap-2 text-body text-ink-2">
            <span aria-hidden className="grid size-5 flex-none place-items-center rounded-sm font-mono text-micro font-semibold"
              style={{ background: stopColor(stop.number), color: stopForeground(stop.number) }}>
              {stop.number}
            </span>
            <span className="sr-only">{t('trips.packages.columns.stop')} {stop.number}: </span>
            {stop.name}
          </span>
        ) : null}
      </div>

      <figure className="m-0 flex flex-col items-center gap-1">
        <svg viewBox="0 0 260 200" className="h-36 w-full" role="img" aria-label={t('trips.packages.preview.label', { size })}>
          {figure.map((face, index) => (
            <polygon key={index} points={face.points} fill={face.fill} stroke={face.stroke} strokeWidth={face.strokeWidth} />
          ))}
        </svg>
        <figcaption className="font-mono text-caption text-ink-2">{size} · {t('trips.packages.preview.dims')}</figcaption>
      </figure>

      <dl className="m-0 grid grid-cols-2 gap-x-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5 border-b border-border py-2">
            <dt className="text-caption text-ink-2">{stat.label}</dt>
            <dd className="m-0 text-body font-semibold text-ink-strong tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-1.5">
        <span className="text-caption font-medium text-ink-2">{t('trips.packages.preview.requirements')}</span>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-body text-ink-1">
          {requirements.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </div>
    </div>
  )
}
