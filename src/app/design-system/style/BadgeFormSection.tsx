import { useState } from 'react'
import { StatusBadge, TRIP_STATUS } from '@/components/StatusBadge'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { readToken } from '@/lib/tokens'
import type { TripStatus } from '@/types/trip'
import { SheetSection } from '../SheetLayout'

const TONE_TOKENS: Record<string, [`--${string}`, `--${string}`]> = {
  neutral: ['--badge-neutral-fg', '--badge-neutral-bg'],
  info: ['--badge-info-fg', '--badge-info-bg'],
  cyan: ['--badge-cyan-fg', '--badge-cyan-bg'],
  success: ['--badge-success-fg', '--badge-success-bg'],
  warning: ['--badge-warning-fg', '--badge-warning-bg'],
  danger: ['--badge-danger-fg', '--badge-danger-bg'],
}

const VEHICLES = [
  'Xe tải 1,25 tấn — thùng kín',
  'Xe tải 2,5 tấn — thùng kín',
  'Xe tải 5 tấn — thùng bạt',
  'Container 20 DC',
  'Container 40 HC',
]

export function BadgeSection() {
  return (
    <SheetSection
      id="badge"
      number="04"
      title="Badge trạng thái"
      description="Cao 22px, pill, chữ 12px/500, nền nhạt + viền cùng tông. Chấm 6px đánh dấu trạng thái đang diễn ra."
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        {(Object.keys(TRIP_STATUS) as TripStatus[]).map((status) => {
          const spec = TRIP_STATUS[status]
          const [fg, bg] = TONE_TOKENS[spec.tone] ?? TONE_TOKENS.neutral!
          return (
            <div key={status} className="flex flex-col gap-3 rounded-md border border-border p-4">
              <div><StatusBadge status={status} /></div>
              <div className="flex flex-col gap-0.5">
                <span className="text-caption text-text-2">{spec.tone}{spec.dot ? ' · đang diễn ra' : ''}</span>
                <span className="font-mono text-caption text-text-3">{readToken(fg)} / {readToken(bg)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </SheetSection>
  )
}

export function FormSection() {
  const [vehicle, setVehicle] = useState(VEHICLES[0] ?? '')
  const [priority, setPriority] = useState('weight')

  return (
    <SheetSection
      id="form"
      number="05"
      title="Điều khiển nhập liệu"
      description="Cao 40px, viền 1px, radius 8px. Focus: viền primary + vòng 2px ngoài. Nhãn 14px/500 phía trên, gợi ý 12px phía dưới."
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-8 gap-y-6">
        <Input label="Tên khách hàng" placeholder="Nhập tên khách hàng" hint="Default" />
        <Input label="Khối lượng" required numeric suffix="kg" defaultValue="8.240" hint="Số dùng mono, canh phải, hậu tố đơn vị" />
        <Input label="Mã kiện" defaultValue="KIEN-00418" error="Mã kiện đã tồn tại" className="font-mono" />
        <Input label="Biển số xe" defaultValue="51C-123.45" disabled hint="Disabled" className="font-mono" />

        <div className="flex flex-col gap-1.5">
          <span className="text-body font-medium">Loại xe</span>
          <Select value={vehicle} onValueChange={setVehicle}>
            <SelectTrigger aria-label="Loại xe"><SelectValue /></SelectTrigger>
            <SelectContent>
              {VEHICLES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-caption text-text-3">Select · mũi tên 16px, stroke 1.5</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body font-medium">Tuỳ chọn xếp</span>
          <div className="flex flex-col gap-3 pt-1">
            <Checkbox defaultChecked label="Cho phép xoay kiện" />
            <Checkbox label="Cho phép chồng lên kiện dễ vỡ" />
            <Checkbox disabled label="Xếp hàng lạnh (không khả dụng)" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body font-medium">Ưu tiên tối ưu</span>
          <RadioGroup value={priority} onValueChange={setPriority} className="pt-1">
            <RadioGroupItem value="weight" label="Ưu tiên khối lượng" />
            <RadioGroupItem value="stops" label="Ưu tiên thứ tự điểm giao" />
            <RadioGroupItem value="volume" disabled label="Ưu tiên thể tích" />
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body font-medium">Hiển thị</span>
          <div className="flex flex-col gap-3 pt-1">
            <Switch defaultChecked label="Hiển thị trọng tâm" />
            <Switch label="Lưới sàn xe" />
            <Switch disabled label="Chế độ tối (disabled)" />
          </div>
        </div>
      </div>
    </SheetSection>
  )
}
