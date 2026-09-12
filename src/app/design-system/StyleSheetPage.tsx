import { SheetLayout } from './SheetLayout'
import { BadgeSection, FormSection } from './style/BadgeFormSection'
import { ButtonSection } from './style/ButtonSection'
import { CardTableSection, LegendSection } from './style/CardTableLegendSection'
import { PaletteSection } from './style/PaletteSection'
import { TypeSection } from './style/TypeSection'

const NAV = [
  { id: 'mau', label: 'Màu' },
  { id: 'chu', label: 'Chữ' },
  { id: 'nut', label: 'Nút' },
  { id: 'badge', label: 'Badge' },
  { id: 'form', label: 'Form' },
  { id: 'card', label: 'Card & bảng' },
  { id: 'legend', label: 'Điểm giao' },
]

/** Bảng kiểu dáng — tài liệu sống dựng từ token và primitive thật. Route: /kieu-dang */
export function StyleSheetPage() {
  return (
    <SheetLayout
      badge="Style sheet · v1"
      title="Hệ thống thiết kế LoadMaster"
      description="SaaS sáng, sạch, hiện đại. Nhiều khoảng trắng, viền mảnh, không bóng trên card. Vùng 3D luôn nền tối. Spacing bội số 4px, radius 8px cho nút và thẻ, 12px cho hộp thoại."
      nav={NAV}
    >
      <PaletteSection />
      <TypeSection />
      <ButtonSection />
      <BadgeSection />
      <FormSection />
      <CardTableSection />
      <LegendSection />
    </SheetLayout>
  )
}
