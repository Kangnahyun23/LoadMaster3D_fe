import { Calendar, Check, ChevronDown, Navigation, Phone, Plus, X } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Switch } from '@/components/ui/Switch'
import { ORIENTATION_CODES, orientDimensions, type OrientationCode } from '@/domain/geometry'
import { cn } from '@/lib/utils'
import { Sample, SheetRow, SheetSection } from '../SheetLayout'

export function InputSection() {
  const [orientation, setOrientation] = useState<OrientationCode>('LWH')
  const [slice, setSlice] = useState(435)

  return (
    <SheetSection id="input" number="02" title="Nhập liệu">
      <SheetRow name="Button" note="Kiểu: primary · secondary · ghost · danger. Trạng thái: default · hover · disabled · loading. Không có kiểu success — nút xác nhận kho dùng primary (mục 5).">
        <Button variant="primary"><Check strokeWidth={1.5} />Duyệt phương án</Button>
        <Button variant="secondary">Lưu nháp</Button>
        <Button variant="ghost">Xem chi tiết</Button>
        <Button variant="danger">Huỷ chuyến</Button>
        <Button variant="primary" disabled>Disabled</Button>
        <Button variant="primary" loading>Đang chạy…</Button>
      </SheetRow>

      <SheetRow name="IconButton · RoundAction" note="Ghost · secondary (viền) · primary · tròn 56px “Đã dỡ” cho tài xế.">
        <Sample label="ghost 36"><Button variant="ghost" size="icon" aria-label="Đóng"><X strokeWidth={1.5} /></Button></Sample>
        <Sample label="secondary 36"><Button variant="secondary" size="icon" aria-label="Thêm"><Plus strokeWidth={1.5} /></Button></Sample>
        <Sample label="primary 44"><Button variant="primary" size="icon" className="size-11" aria-label="Phát"><Check strokeWidth={2} /></Button></Sample>
        <Sample label="secondary 56"><Button variant="secondary" size="iconTouch" className="size-14 [&_svg]:size-6" aria-label="Gọi"><Phone strokeWidth={2} /></Button></Sample>
        <Sample label="secondary 56"><Button variant="secondary" size="iconTouch" className="size-14 [&_svg]:size-6" aria-label="Chỉ đường"><Navigation strokeWidth={2} /></Button></Sample>
        <Sample label="tròn · chờ"><button type="button" className="grid size-14 place-items-center rounded-full border-2 border-success bg-bg text-body-lg font-semibold text-badge-success-fg">Đã dỡ</button></Sample>
        <Sample label="tròn · xong"><button type="button" className="grid size-14 place-items-center rounded-full bg-success text-white"><Check className="size-7" strokeWidth={3} /></button></Sample>
        <Sample label="tròn · từ chối"><button type="button" disabled className="grid size-14 place-items-center rounded-full border-2 border-badge-danger-border bg-bg text-danger"><X className="size-6" strokeWidth={2.5} /></button></Sample>
      </SheetRow>

      <SheetRow name="Input · Select · FilterButton" note="Trạng thái: default · focus · error · disabled. Biến thể: mono canh phải có hậu tố đơn vị. FilterButton 36px có icon và mũi tên.">
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <Input label="Tên khách hàng" placeholder="Nhập tên khách hàng" />
          <Input label="Khối lượng" required numeric suffix="kg" defaultValue="8.240" />
          <Input label="Mã kiện" defaultValue="KIEN-00418" error="Mã kiện đã tồn tại" className="font-mono" />
          <Input label="Biển số xe" defaultValue="51C-123.45" disabled className="font-mono" />
        </div>
        <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-bg px-3 text-body font-medium hover:bg-surface">
          <Calendar className="size-4 text-text-3" strokeWidth={1.5} />30 ngày qua<ChevronDown className="size-3.5 text-text-3" strokeWidth={1.5} />
        </button>
      </SheetRow>

      <SheetRow name="Checkbox · Radio · Switch · RangeSlider · OrientationPicker" note="18px checkbox/radio, switch 36×20, thanh trượt native tô primary phần đã đi qua, bộ chọn 6 hướng đặt theo mã Spec." className="flex-col items-stretch gap-6">
        <div className="flex flex-wrap gap-10">
          <div className="flex flex-col gap-3"><Checkbox defaultChecked label="Cho phép xoay kiện" /><Checkbox label="Chồng lên kiện dễ vỡ" /><Checkbox disabled label="Xếp hàng lạnh" /></div>
          <RadioGroup defaultValue="weight"><RadioGroupItem value="weight" label="Ưu tiên khối lượng" /><RadioGroupItem value="stops" label="Ưu tiên thứ tự điểm giao" /><RadioGroupItem value="volume" disabled label="Ưu tiên thể tích" /></RadioGroup>
          <div className="flex flex-col gap-3"><Switch defaultChecked label="Hiển thị trọng tâm" /><Switch label="Lưới sàn xe" /><Switch disabled label="Chế độ tối" /></div>
        </div>
        <div className="flex w-70 flex-col gap-2">
          <div className="flex justify-between text-caption"><span className="font-medium text-text-3">Cắt lớp theo chiều dài</span><span className="font-mono font-medium">{slice.toLocaleString('vi-VN')} cm</span></div>
          <input type="range" className="lm-range" min={0} max={720} step={5} value={slice} onChange={(e) => setSlice(Number(e.target.value))} aria-label="Cắt lớp" style={{ '--lm-range-fill': `${(slice / 720) * 100}%` } as CSSProperties} />
        </div>
        <div role="group" aria-label="Hướng xoay" className="grid w-70 grid-cols-3 gap-1.5">
          {ORIENTATION_CODES.map((value) => { const { placedLengthCm: w, placedHeightCm: h } = orientDimensions({ lengthCm: 28, widthCm: 18, heightCm: 12 }, value); return (
            <button key={value} type="button" aria-pressed={orientation === value} onClick={() => setOrientation(value)}
              className={cn('flex flex-col items-center gap-1 rounded-md border px-1 py-2', orientation === value ? 'border-primary bg-primary-bg text-primary-hover' : 'border-border text-text-2 hover:bg-surface')}>
              <span aria-hidden className="block rounded-xs bg-current opacity-85" style={{ width: w, height: h }} />
              <span className="font-mono text-[11px] leading-3.5 font-medium">{value}</span>
            </button>
          ) })}
        </div>
      </SheetRow>
    </SheetSection>
  )
}
