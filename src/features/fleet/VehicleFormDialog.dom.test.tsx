import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { VehicleFormDialog } from './VehicleFormDialog'

function renderDialog() {
  const onSubmit = vi.fn()
  const onOpenChange = vi.fn()
  render(<VehicleFormDialog open onOpenChange={onOpenChange} onSubmit={onSubmit} />)
  return { onSubmit, onOpenChange, user: userEvent.setup() }
}

test('submitting an empty new vehicle shows field errors and does not save', async () => {
  const { onSubmit, user } = renderDialog()

  await user.click(screen.getByRole('button', { name: 'Thêm xe' }))

  expect(await screen.findByText('Nhập tên xe')).toBeInTheDocument()
  expect(screen.getByText('Nhập biển số')).toBeInTheDocument()
  expect(screen.getByLabelText('Tên xe')).toHaveAttribute('aria-invalid', 'true')
  expect(onSubmit).not.toHaveBeenCalled()
})

test('a valid new vehicle is saved and the dialog closes', async () => {
  const { onSubmit, onOpenChange, user } = renderDialog()

  await user.type(screen.getByLabelText('Tên xe'), 'Hyundai HD210')
  await user.type(screen.getByLabelText('Biển số'), '60C-446.32')
  await user.type(screen.getByLabelText('Kho trực thuộc'), 'Kho Long Bình')
  await user.click(screen.getByRole('button', { name: 'Thêm xe' }))

  await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
  expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
    name: 'Hyundai HD210',
    plate: '60C-446.32',
    depot: 'Kho Long Bình',
    innerLengthMm: 6000,
  })
  expect(onOpenChange).toHaveBeenCalledWith(false)
})
