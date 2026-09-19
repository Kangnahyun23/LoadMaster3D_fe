import { expect, test } from 'vitest'
import { isSceneIdle } from './perf-idle'

test('a scene still drawing is never idle, however slow the frames are', () => {
  // Máy yếu: 2 FPS (500 ms/frame) nhưng frame cuối vẫn xin frame tiếp
  expect(isSceneIdle(true, 500)).toBe(false)
  expect(isSceneIdle(true, 40)).toBe(false)
})

test('a stopped loop is idle only after the quiet gap', () => {
  expect(isSceneIdle(false, 40)).toBe(false)
  expect(isSceneIdle(false, 250)).toBe(true)
  expect(isSceneIdle(false, 900)).toBe(true)
})
