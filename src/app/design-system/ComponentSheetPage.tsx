import { DataSection } from './components/DataSection'
import { FeedbackSection } from './components/FeedbackSection'
import { InputSection } from './components/InputSection'
import { NavigationSection } from './components/NavigationSection'
import { OverlaySection } from './components/OverlaySection'
import { Viewport3DSection } from './components/Viewport3DSection'
import { SheetLayout } from './SheetLayout'

const NAV = [
  { id: 'nav', label: 'Điều hướng' },
  { id: 'input', label: 'Nhập liệu' },
  { id: 'data', label: 'Hiển thị dữ liệu' },
  { id: 'feedback', label: 'Phản hồi' },
  { id: 'overlay', label: 'Lớp phủ' },
  { id: 'viewport', label: 'Thành phần 3D' },
]

/**
 * Bảng thành phần — mọi thành phần đã dùng trong các màn, render từ code
 * thật nên luôn đúng với sản phẩm. Route: /thanh-phan
 */
export function ComponentSheetPage() {
  return (
    <SheetLayout
      badge="Bảng thành phần · bàn giao"
      title="Thành phần giao diện"
      description="Tập hợp mọi thành phần đã dùng trong các màn hình. Quy ước chung: spacing bội số 4px · radius 8px (modal 12px, pill 9999px) · viền 1px --border · font UI Be Vietnam Pro, số và mã dùng JetBrains Mono với tabular figures · icon Lucide, stroke 1.5, cỡ 16 / 20 / 24 · focus ring 2px --primary cách 2px."
      nav={NAV}
    >
      <NavigationSection />
      <InputSection />
      <DataSection />
      <FeedbackSection />
      <OverlaySection />
      <Viewport3DSection />
    </SheetLayout>
  )
}
