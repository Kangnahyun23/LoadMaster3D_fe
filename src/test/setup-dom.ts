import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Không bật `globals`, nên RTL không tự dọn DOM giữa các test.
afterEach(() => {
  cleanup()
})
