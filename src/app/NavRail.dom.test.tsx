import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { I18nProvider } from '@/lib/i18n'
import { NavRail } from './NavRail'

/** LM-053 (D-20): nút Cài đặt chưa mở màn nào nên không hiển thị. */
test('nav rail không có nút Cài đặt', () => {
  render(
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <MemoryRouter>
            <NavRail />
          </MemoryRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>,
  )
  expect(screen.getByRole('link', { name: 'Chuyến hàng' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Cài đặt' })).not.toBeInTheDocument()
})
