import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * jsdom chưa cài `ResizeObserver`, nhưng primitive Radix có đo kích thước (Switch, Select, ScrollArea)
 * gọi thẳng vào nó và làm đổ cả cây React. Bản giả không báo kích thước — test không dựa vào layout.
 */
class NoopResizeObserver implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver ??= NoopResizeObserver

// Không bật `globals`, nên RTL không tự dọn DOM giữa các test.
afterEach(() => {
  cleanup()
})

/** Các API layout khác mà Radix (Select, Dialog) gọi khi mở; jsdom chưa có. */
Element.prototype.scrollIntoView ??= () => {}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
