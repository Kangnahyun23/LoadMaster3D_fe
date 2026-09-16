import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Không bật `globals`, nên RTL không tự dọn DOM giữa các test.
afterEach(() => {
  cleanup()
})

/**
 * jsdom chưa có `ResizeObserver` và các API layout mà Radix (Select, Dialog) gọi khi mở.
 * Bản giả tối thiểu: chỉ cần tồn tại, test không đo kích thước thật.
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub
Element.prototype.scrollIntoView ??= () => {}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
