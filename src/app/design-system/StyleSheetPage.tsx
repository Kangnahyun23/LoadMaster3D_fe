import { useT } from '@/lib/i18n'
import { SheetLayout } from './SheetLayout'
import { BadgeSection, FormSection } from './style/BadgeFormSection'
import { ButtonSection } from './style/ButtonSection'
import { CardTableSection, LegendSection } from './style/CardTableLegendSection'
import { PaletteSection } from './style/PaletteSection'
import { TypeSection } from './style/TypeSection'

const NAV = [
  { id: 'mau', key: 'palette' },
  { id: 'chu', key: 'type' },
  { id: 'nut', key: 'buttons' },
  { id: 'badge', key: 'badge' },
  { id: 'form', key: 'form' },
  { id: 'card', key: 'card' },
  { id: 'legend', key: 'legend' },
] as const

/** Bảng kiểu dáng — tài liệu sống dựng từ token và primitive thật. Route: /kieu-dang */
export function StyleSheetPage() {
  const t = useT()
  return (
    <SheetLayout
      badge="Style sheet · v1"
      title={t('designSystem.style.title')}
      description={t('designSystem.style.description')}
      nav={NAV.map(({ id, key }) => ({ id, label: t(`designSystem.style.nav.${key}`) }))}
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
