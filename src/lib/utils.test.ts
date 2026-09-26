import { expect, test } from 'vitest'
import { cn } from '@/lib/utils'

test('cn keeps a text colour next to a theme font-size class', () => {
  expect(cn('bg-primary text-white', 'h-10 px-4 text-body')).toBe('bg-primary text-white h-10 px-4 text-body')
})

test('cn keeps a theme font-size class when a text colour follows it', () => {
  expect(cn('text-caption', 'text-primary-hover')).toBe('text-caption text-primary-hover')
})

test('cn still lets a later theme font-size replace an earlier one', () => {
  expect(cn('h-14 text-body-lg', 'xl:h-10 text-body')).toBe('h-14 xl:h-10 text-body')
})

test('cn treats font-display (Archivo, V2.3) as a font family, not a weight', () => {
  expect(cn('font-mono font-semibold', 'font-display')).toBe('font-semibold font-display')
})
