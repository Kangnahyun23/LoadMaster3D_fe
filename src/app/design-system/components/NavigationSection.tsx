import { ChevronLeft, Plus, Warehouse } from 'lucide-react'
import { useState } from 'react'
import { NavRail } from '@/app/NavRail'
import { PageHero } from '@/components/PageHero'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { TabCount, Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useT } from '@/lib/i18n'
import { Sample, SheetRow, SheetSection } from '../SheetLayout'

type Camera = 'truoc' | 'cua-sau' | 'goc-cheo'

export function NavigationSection() {
  const t = useT()
  const [camera, setCamera] = useState<Camera>('goc-cheo')
  const [speed, setSpeed] = useState<1 | 2 | 4>(2)
  const cameras: ReadonlyArray<{ value: Camera; label: string }> = [
    { value: 'truoc', label: t('designSystem.components.navigation.cameras.front') },
    { value: 'cua-sau', label: t('designSystem.components.navigation.cameras.rear') },
    { value: 'goc-cheo', label: t('designSystem.components.navigation.cameras.diagonal') },
  ]
  const back = t('designSystem.samples.back')

  return (
    <SheetSection id="nav" number="01" title={t('designSystem.components.nav.navigation')}>
      <SheetRow name="NavRail" note={t('designSystem.components.navigation.navRailNote')}>
        {/* Mẫu dựng ở bề rộng thật: khung hẹp hơn thì chính thanh điều hướng tự cuộn và che mục */}
        <div className="relative w-full overflow-x-auto rounded-md border border-border">
          <div className="flex h-36 min-w-342 flex-col bg-(image:--field)">
            <NavRail />
            <div className="flex-1" />
          </div>
        </div>
      </SheetRow>

      <SheetRow name="PageHero · PageHeader" note={t('designSystem.components.navigation.pageHeaderNote')} className="flex-col items-stretch">
        <Sample label={t('designSystem.components.navigation.standard')}>
          {/* Mẫu chỉ để nhìn: PageHero dựng <h1>, trang tài liệu đã có h1 của nó */}
          <div inert aria-hidden className="overflow-hidden rounded-md border border-border bg-(image:--field)">
            <PageHero
              icon={Warehouse}
              title={t('fleet.title')}
              meta={t('fleet.count', { count: 8 })}
              description={t('pageHero.fleet')}
              actions={<Button variant="primary"><Plus strokeWidth={1.5} />{t('fleet.add')}</Button>}
            />
          </div>
        </Sample>
        <Sample label={t('designSystem.components.navigation.dataTitle')}>
          <div className="flex h-18 items-center gap-4 rounded-md border border-border bg-chrome px-6">
            <Button variant="ghost" size="icon" aria-label={back}><ChevronLeft strokeWidth={1.5} /></Button>
            <span className="font-mono text-[22px] font-semibold tracking-[-0.02em]">TRIP-2026-0914</span>
            <StatusBadge status="nhap" />
            <div className="flex-1" />
            <Button variant="secondary">{t('designSystem.samples.saveDraft')}</Button>
            <Button variant="primary">{t('designSystem.samples.runOptimization')}</Button>
          </div>
        </Sample>
        <Sample label={t('designSystem.components.navigation.thin')}>
          <div className="flex h-14 items-center gap-4 rounded-md border border-border px-5">
            <Button variant="ghost" size="icon" aria-label={back}><ChevronLeft strokeWidth={1.5} /></Button>
            <span className="font-mono text-[18px] font-semibold tracking-[-0.02em]">TRIP-2026-0914</span>
            <StatusBadge status="da_toi_uu" />
            <div className="flex-1" />
            <Button variant="primary" className="h-9 px-3.5">{t('designSystem.samples.approvePlan')}</Button>
          </div>
        </Sample>
      </SheetRow>

      <SheetRow name="Tabs · SegmentedControl" note={t('designSystem.components.navigation.tabsNote')} className="flex-col items-stretch">
        <Sample label={t('designSystem.components.navigation.tabsSample')}>
          <Tabs defaultValue="unplaced" className="w-70 rounded-md border border-border">
            <TabsList>
              <TabsTrigger value="unplaced">{t('designSystem.components.navigation.unplaced')} <TabCount tone="danger">{3}</TabCount></TabsTrigger>
              <TabsTrigger value="pinned">{t('designSystem.components.navigation.pinned')} <TabCount>{2}</TabCount></TabsTrigger>
            </TabsList>
          </Tabs>
        </Sample>
        <div className="flex flex-wrap items-end gap-6">
          <Sample label={t('designSystem.components.navigation.segmentedFloating')}>
            <SegmentedControl ariaLabel={t('designSystem.components.navigation.view')} options={cameras} value={camera} onChange={setCamera} />
          </Sample>
          <Sample label="segmented · sm mono">
            <SegmentedControl ariaLabel={t('designSystem.components.navigation.speed')} size="sm" mono floating={false} options={[{ value: 1, label: '1×' }, { value: 2, label: '2×' }, { value: 4, label: '4×' }]} value={speed} onChange={setSpeed} />
          </Sample>
        </div>
      </SheetRow>

      <SheetRow name="SidePanel" note={t('designSystem.components.navigation.sidePanelNote')}>
        <div className="flex h-40 w-full overflow-hidden rounded-md border border-border">
          <aside className="flex w-70 flex-none flex-col border-r border-border">
            <div className="flex h-11 items-center justify-between border-b border-border pr-2 pl-4 text-body font-medium">{t('designSystem.components.navigation.packageList')}<Button variant="ghost" size="icon" className="size-8" aria-label={t('designSystem.components.navigation.collapse')}><ChevronLeft strokeWidth={1.5} /></Button></div>
          </aside>
          <div className="flex-1 bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)]" />
          <aside className="flex w-90 flex-none flex-col border-l border-border">
            <div className="flex h-11 items-center border-b border-border pl-4 text-body font-medium">{t('designSystem.components.navigation.selectedPackage')}</div>
          </aside>
        </div>
      </SheetRow>
    </SheetSection>
  )
}
