import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Cỡ chữ của `@theme` trong `src/index.css` (`--text-display` … `--text-caption`).
 * Không khai báo thì tailwind-merge coi `text-body` là màu chữ và bỏ `text-white`
 * đứng trước nó (LM-055). Thêm token cỡ chữ mới vào `@theme` thì thêm tên vào đây.
 */
const THEME_FONT_SIZES = ['display', 'h1', 'h2', 'h3', 'body-lg', 'body', 'caption']

const twMerge = extendTailwindMerge({
  extend: {
    theme: { text: THEME_FONT_SIZES },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
