import { useT } from '@/lib/i18n'
import { DataSection } from './components/DataSection'
import { FeedbackSection } from './components/FeedbackSection'
import { InputSection } from './components/InputSection'
import { NavigationSection } from './components/NavigationSection'
import { OverlaySection } from './components/OverlaySection'
import { Viewport3DSection } from './components/Viewport3DSection'
import { SheetLayout } from './SheetLayout'

const NAV = ['navigation', 'input', 'data', 'feedback', 'overlay', 'viewport'] as const
const NAV_IDS = { navigation: 'nav', input: 'input', data: 'data', feedback: 'feedback', overlay: 'overlay', viewport: 'viewport' } as const

/**
 * Bảng thành phần — mọi thành phần đã dùng trong các màn, render từ code
 * thật nên luôn đúng với sản phẩm. Route: /thanh-phan
 */
export function ComponentSheetPage() {
  const t = useT()
  return (
    <SheetLayout
      badge={t('designSystem.components.badge')}
      title={t('designSystem.components.title')}
      description={t('designSystem.components.description')}
      nav={NAV.map((key) => ({ id: NAV_IDS[key], label: t(`designSystem.components.nav.${key}`) }))}
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
