import { SheetSection } from '../SheetLayout'
import { STOP_COLORS } from '@/lib/stops'
import { readToken } from '@/lib/tokens'

type Swatch = { name: string; token: `--${string}` }

const GROUPS: Array<{ name: string; note: string; items: Swatch[] }> = [
  {
    name: 'Nền & viền',
    note: 'Trang trắng, surface cho vùng phụ và tiêu đề bảng.',
    items: [
      { name: 'Nền', token: '--bg' },
      { name: 'Surface', token: '--surface' },
      { name: 'Viền', token: '--border' },
      { name: 'Disabled', token: '--text-disabled' },
    ],
  },
  {
    name: 'Chữ',
    note: 'Ba mức: chính, phụ, mờ. Không dùng độ trong suốt cho chữ.',
    items: [
      { name: 'Text chính', token: '--text' },
      { name: 'Text phụ', token: '--text-2' },
      { name: 'Text mờ', token: '--text-3' },
    ],
  },
  {
    name: 'Primary',
    note: 'Một màu nhấn duy nhất. Nền nhạt cho trạng thái chọn và tag thông tin.',
    items: [
      { name: 'Primary', token: '--primary' },
      { name: 'Hover', token: '--primary-hover' },
      { name: 'Nền nhạt', token: '--primary-bg' },
    ],
  },
  {
    name: 'Ngữ nghĩa',
    note: 'Chỉ dùng cho trạng thái và phản hồi, không dùng làm màu trang trí.',
    items: [
      { name: 'Success', token: '--success' },
      { name: 'Warning', token: '--warning' },
      { name: 'Danger', token: '--danger' },
      { name: 'Info', token: '--info' },
    ],
  },
]

export function PaletteSection() {
  return (
    <SheetSection id="mau" number="01" title="Bảng màu">
      {GROUPS.map((group) => (
        <PaletteGroup key={group.name} name={group.name} note={group.note}>
          {group.items.map((item) => (
            <SwatchCard key={item.token} name={item.name} token={item.token} />
          ))}
        </PaletteGroup>
      ))}

      <PaletteGroup name="Điểm giao" note="8 màu định danh, an toàn cho người mù màu (Okabe–Ito). Chỉ để định danh điểm giao.">
        {STOP_COLORS.map((color, index) => (
          <div key={color} className="flex flex-col gap-2">
            <div className="h-14 rounded-md border border-text/8" style={{ background: color }} />
            <div className="flex flex-col gap-0.5">
              <span className="text-caption font-medium">Điểm {index + 1}</span>
              <span className="font-mono text-caption text-text-3">--stop-{index + 1}</span>
            </div>
          </div>
        ))}
      </PaletteGroup>

      <PaletteGroup name="Vùng 3D" note="Luôn nền tối, kể cả khi toàn app sáng. Gradient dọc 180° từ --canvas-1 tới --canvas-2.">
        <div className="col-span-full flex h-30 items-end justify-between rounded-md bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)] px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-caption font-medium text-white">Viewport 3D</span>
            <span className="font-mono text-caption text-white/60">
              {readToken('--canvas-1')} → {readToken('--canvas-2')}
            </span>
          </div>
          <span className="font-mono text-caption text-white/60">--panel-dark · --border-dark cho panel và viền</span>
        </div>
      </PaletteGroup>
    </SheetSection>
  )
}

function PaletteGroup({ name, note, children }: { name: string; note: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_minmax(0,1fr)] items-start gap-6">
      <div className="flex flex-col gap-1 pt-0.5">
        <span className="text-body font-medium">{name}</span>
        <span className="text-caption text-pretty text-text-3">{note}</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-3">{children}</div>
    </div>
  )
}

function SwatchCard({ name, token }: { name: string; token: `--${string}` }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-14 rounded-md border border-text/8" style={{ background: `var(${token})` }} />
      <div className="flex flex-col gap-0.5">
        <span className="text-caption font-medium">{name}</span>
        <span className="font-mono text-caption text-text-3">
          {token} · {readToken(token)}
        </span>
      </div>
    </div>
  )
}
