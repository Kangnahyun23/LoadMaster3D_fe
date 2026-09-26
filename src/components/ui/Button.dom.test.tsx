import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Button } from './Button'

test('filled buttons keep their text colour at both desktop and touch sizes (V2.3: primary is dark on cyan)', () => {
  render(
    <>
      <Button variant="primary">Duyệt phương án</Button>
      <Button variant="primary" size="touch">Bắt đầu xếp</Button>
      <Button variant="danger" size="touch">Xoá kiện</Button>
    </>,
  )

  expect(screen.getByRole('button', { name: 'Duyệt phương án' })).toHaveClass('text-on-primary', 'text-body')
  expect(screen.getByRole('button', { name: 'Bắt đầu xếp' })).toHaveClass('text-on-primary', 'text-body-lg')
  expect(screen.getByRole('button', { name: 'Xoá kiện' })).toHaveClass('text-white', 'text-body-lg')
})

test('outlined and ghost buttons keep the body text colour', () => {
  render(
    <>
      <Button variant="secondary" size="touch">So sánh phương án</Button>
      <Button variant="ghost">Huỷ</Button>
    </>,
  )

  expect(screen.getByRole('button', { name: 'So sánh phương án' })).toHaveClass('text-text', 'text-body-lg')
  expect(screen.getByRole('button', { name: 'Huỷ' })).toHaveClass('text-text', 'text-body')
})
