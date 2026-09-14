import { Languages } from 'lucide-react'
import { LOCALE_NAMES, LOCALES, useLocale, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type LanguageSwitchProps = {
  /** Nav rail xếp dọc; header các màn toàn màn hình (kho, tài xế, 3D) xếp ngang. */
  orientation?: 'horizontal' | 'vertical'
  /** `md`: nút 44px cho desktop. `touch`: nút 56px, chữ 16px cho tablet và điện thoại. */
  size?: 'md' | 'touch'
  className?: string
}

/**
 * Nút chuyển vi / en. Đổi ngôn ngữ tại chỗ: không tải lại trang, không remount
 * route, dữ liệu đang nhập giữ nguyên.
 *
 * Mỗi nút hiện mã ngôn ngữ và đọc kèm tên ngôn ngữ viết bằng chính ngôn ngữ đó
 * ("EN English"), để người không đọc được ngôn ngữ đang hiện vẫn tìm ra.
 */
export function LanguageSwitch({ orientation = 'horizontal', size = 'md', className }: LanguageSwitchProps) {
  const t = useT()
  const { locale, setLocale } = useLocale()
  const vertical = orientation === 'vertical'

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={cn('flex items-center', vertical ? 'flex-col gap-1' : 'gap-2', className)}
    >
      <Languages className={cn('text-text-3', size === 'touch' ? 'size-6' : 'size-5')} strokeWidth={1.5} aria-hidden />
      <div
        className={cn(
          'flex gap-0.5 rounded-md border border-border bg-bg p-0.5 font-semibold',
          vertical && 'flex-col',
          size === 'touch' ? 'text-body-lg' : 'text-caption',
        )}
      >
        {LOCALES.map((option) => {
          const active = option === locale
          return (
            <button
              key={option}
              type="button"
              lang={option}
              aria-pressed={active}
              onClick={() => setLocale(option)}
              className={cn(
                'grid place-items-center rounded-sm',
                size === 'touch' ? 'size-14' : 'size-11',
                'transition-colors duration-(--dur-fast) ease-standard',
                'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                active ? 'bg-primary-bg text-primary-hover' : 'text-text-2 hover:bg-surface',
              )}
            >
              {option.toUpperCase()}{' '}
              <span className="sr-only">{LOCALE_NAMES[option]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
