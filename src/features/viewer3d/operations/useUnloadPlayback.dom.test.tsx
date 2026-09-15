import { act, renderHook } from '@testing-library/react'
import { expect, test } from 'vitest'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import { sceneBox as box } from '@/test/scene'
import { useUnloadPlayback } from './useUnloadPlayback'

function playback(placements: ScenePlacement[]) {
  return renderHook(() => useUnloadPlayback(placements))
}

test('stepping follows the result unloadingOrder, not the geometry', () => {
  const placements = [box('rear', 40, 0, 0, { unloadingOrder: 2 }), box('front', 0, 50, 0, { unloadingOrder: 1 })]
  const { result } = playback(placements)
  expect(result.current.fromResult).toBe(true)
  expect(result.current.current?.id).toBe('front')
  act(() => result.current.advance())
  expect(result.current.cursor).toBe(1)
  expect(result.current.current?.id).toBe('rear')
})

test('a fully blocked rear face pauses the simulation and keeps the target', () => {
  // Điểm 1 dỡ trước nhưng kiện điểm 2 nằm ngay sau, che kín mặt sau
  const placements = [box('target', 0, 0, 0, { unloadingOrder: 1 }), box('later', 20, 0, 0, { stop: 2, unloadingOrder: 2 })]
  const { result } = playback(placements)
  act(() => result.current.toggle())
  act(() => result.current.advance())
  expect(result.current.cursor).toBe(0)
  expect(result.current.playing).toBe(false)
  expect(result.current.warning).toBe(1)
  expect(result.current.current?.id).toBe('target')
})

test('a partially covered rear face only marks the target; the simulation moves on', () => {
  const placements = [box('target', 0, 0, 0, { unloadingOrder: 1 }), box('later', 20, 5, 0, { stop: 2, unloadingOrder: 2 })]
  const { result } = playback(placements)
  act(() => result.current.advance())
  expect(result.current.cursor).toBe(1)
  expect(result.current.warning).toBe(0)
})

test('a blocker already unloaded no longer pauses the target', () => {
  // Thứ tự dỡ đưa kiện chắn ra trước: không còn gì che khi tới lượt kiện đích
  const placements = [box('target', 0, 0, 0, { unloadingOrder: 2 }), box('later', 20, 0, 0, { stop: 2, unloadingOrder: 1 })]
  const { result } = playback(placements)
  act(() => result.current.advance())
  act(() => result.current.advance())
  expect(result.current.cursor).toBe(2)
  expect(result.current.warning).toBe(0)
})
