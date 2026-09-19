import { Navigation, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useT } from '@/lib/i18n'
import type { StopDelivery } from './driver-plan'

/**
 * Điểm giao đang tới: tên, địa chỉ, người nhận và số điện thoại; nút Gọi (`tel:`, chỉ khi điểm có số — D-46) cạnh nút Chỉ đường.
 * Hai nút 56px secondary: nút primary duy nhất của màn là hành động ở chân màn (mục 5).
 */
export function StopContactCard({ stop }: { stop: StopDelivery }) {
  const t = useT()
  return (
    <div className="flex flex-none items-center gap-3 rounded-md border border-border bg-bg p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-h2 font-semibold">{stop.name}</span>
        <span className="leading-5.5 text-pretty text-text-2">{stop.address}</span>
        {stop.phone ? (
          <span className="leading-5.5 text-text-2">
            {stop.contactName ? t('driver.contact', { name: stop.contactName, phone: stop.phone }) : stop.phone}
          </span>
        ) : null}
      </div>
      <div className="flex flex-none gap-2">
        {stop.phone ? (
          <Button variant="secondary" size="iconTouch" className="size-14 [&_svg]:size-6" aria-label={t('driver.call', { name: stop.contactName ?? stop.name })} asChild>
            <a href={`tel:${stop.phone.replace(/\s+/g, '')}`}>
              <Phone strokeWidth={2} />
            </a>
          </Button>
        ) : null}
        <Button variant="secondary" size="iconTouch" className="size-14 [&_svg]:size-6" aria-label={t('driver.directions', { name: stop.name })} asChild>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(stop.address)}`} target="_blank" rel="noreferrer">
            <Navigation strokeWidth={2} />
          </a>
        </Button>
      </div>
    </div>
  )
}
