import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { I18nProvider } from '@/lib/i18n'
import { ConfirmDialog } from './ConfirmDialog'

/** Hộp xác nhận dùng chung (fleet, trips, admin): huỷ đóng hộp, xác nhận gọi thao tác; đang gửi thì không huỷ được (LM-100). */
function renderDialog(pending: boolean) {
  const onOpenChange = vi.fn()
  const onConfirm = vi.fn()
  render(
    <I18nProvider>
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Xoá xe Hino FC9J?"
        description="Xe bị xoá khỏi đội xe."
        cancelLabel="Giữ lại"
        confirmLabel="Xoá xe"
        danger
        pending={pending}
        onConfirm={onConfirm}
      />
    </I18nProvider>,
  )
  return { onOpenChange, onConfirm }
}

test('cancel closes the dialog and confirm runs the action', async () => {
  const user = userEvent.setup()
  const { onOpenChange, onConfirm } = renderDialog(false)
  expect(screen.getByRole('dialog', { name: 'Xoá xe Hino FC9J?' })).toHaveAccessibleDescription('Xe bị xoá khỏi đội xe.')

  await user.click(screen.getByRole('button', { name: 'Giữ lại' }))
  expect(onOpenChange).toHaveBeenCalledWith(false)
  await user.click(screen.getByRole('button', { name: 'Xoá xe' }))
  expect(onConfirm).toHaveBeenCalledOnce()
})

test('while the action is pending the cancel button is disabled', async () => {
  const user = userEvent.setup()
  const { onOpenChange } = renderDialog(true)
  const cancel = screen.getByRole('button', { name: 'Giữ lại' })
  expect(cancel).toBeDisabled()
  await user.click(cancel)
  expect(onOpenChange).not.toHaveBeenCalled()
})
