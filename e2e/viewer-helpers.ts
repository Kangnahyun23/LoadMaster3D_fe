import type { Page } from '@playwright/test'
import type { CameraControls } from '@react-three/drei'
import type { ComponentRef } from 'react'
import type { InstancedMesh, Mesh, Vector3Tuple } from 'three'

/**
 * Đọc scene R3F thật của Vite dev server; không có cầu nối test hay biến toàn cục trong code
 * sản phẩm. File deps này chỉ re-export chunk chung mà app đã nạp, nên `_roots` là cùng một
 * Map dù URL không kèm `?v=`. Hàm truyền vào `page.evaluate` chạy trong trình duyệt: không
 * tham chiếu biến bên ngoài, mọi giá trị đi qua tham số; `import type` bị xoá khi transpile.
 */
export const R3F_DEPS = '/node_modules/.vite/deps/@react-three_fiber.js'
export type R3FModule = Pick<typeof import('@react-three/fiber'), '_roots'>
type CameraControlsImpl = ComponentRef<typeof CameraControls>

export type ScreenPoint = { x: number; y: number }
export type SceneSnapshot = {
  instances: { name: string; count: number }[]
  meshes: number
  proxy: Vector3Tuple | undefined
  target: Vector3Tuple
  direction: Vector3Tuple
  eventsEnabled: boolean
  controlsEnabled: boolean
}
/** Thuộc tính `data-*` của DebugOverlay (`?debug`), giữ nguyên chuỗi như DOM trả về. */
export type ViewerMetrics = Record<
  'fps' | 'frameTimeMs' | 'drawCalls' | 'triangles' | 'placementCount' | 'dpr' | 'qualityTier' | 'renderedFrames' | 'idle',
  string
>
export type VisibleCargo = { 'cargo-opaque': number; 'cargo-dim': number; 'cargo-hull'?: number }

export function sceneSnapshot(page: Page): Promise<SceneSnapshot> {
  return page.evaluate(async (url) => {
    const { _roots } = (await import(url)) as R3FModule
    const s = _roots.get(document.querySelector('canvas')!)!.store.getState()
    const controls = s.controls as CameraControlsImpl
    const proxy = s.scene.getObjectByName('editor-proxy')
    const instances: SceneSnapshot['instances'] = []
    let meshes = 0
    s.scene.traverse((o) => {
      const instanced = o as InstancedMesh
      if (instanced.isInstancedMesh) instances.push({ name: o.name, count: instanced.count })
      if ((o as Mesh).isMesh && !instanced.isInstancedMesh) meshes++
    })
    const target = controls.getTarget(s.camera.position.clone())
    return { instances, meshes, proxy: proxy?.position.toArray(), target: target.toArray(),
      direction: s.camera.position.clone().sub(target).normalize().toArray(),
      eventsEnabled: s.events.enabled, controlsEnabled: controls.enabled }
  }, R3F_DEPS)
}

/** Toạ độ màn hình của proxy editor, dịch thêm `deltaCm` theo trục nghiệp vụ X/Y/Z (cm; scene = cm × 0,01). */
export function proxyPoint(page: Page, deltaCm: Vector3Tuple = [0, 0, 0]): Promise<ScreenPoint> {
  return page.evaluate(async ({ url, delta }) => {
    const { _roots } = (await import(url)) as R3FModule
    const canvas = document.querySelector('canvas')!
    const s = _roots.get(canvas)!.store.getState()
    const proxy = s.scene.getObjectByName('editor-proxy')!
    const position = proxy.getWorldPosition(proxy.position.clone())
    position.x += delta[0] / 100
    position.y += delta[2] / 100
    position.z += delta[1] / 100
    position.project(s.camera)
    const r = canvas.getBoundingClientRect()
    return { x: r.x + (position.x + 1) * r.width / 2, y: r.y + (1 - position.y) * r.height / 2 }
  }, { url: R3F_DEPS, delta: deltaCm })
}

export async function waitIdle(page: Page) {
  await page.waitForFunction(() => document.querySelector<HTMLElement>('[data-viewer-performance]')?.dataset.idle === 'true')
}

/**
 * Chờ camera đứng yên thật trước khi so tư thế camera. `waitIdle` đọc DebugOverlay: overlay chỉ
 * công bố mẫu mỗi 500 ms và báo nghỉ sau 250 ms không có frame, nên ngay sau thao tác nó có thể
 * còn giữ mẫu "nghỉ" cũ (camera chưa kịp đổi), hoặc báo nghỉ giả khi một frame SwiftShader chậm
 * quá 250 ms giữa lúc camera đang chuyển. Ở đây đọc thẳng R3F: không còn frame nào được lên lịch
 * và vị trí, hướng, đích camera không đổi qua ba animation frame liên tiếp.
 */
export async function waitCameraSettled(page: Page) {
  await page.evaluate(async (url) => {
    const { _roots } = (await import(url)) as R3FModule
    const store = _roots.get(document.querySelector('canvas')!)!.store
    const started = performance.now()
    await new Promise<void>((resolve, reject) => {
      let previous = '', stableTicks = 0, ticks = 0
      const tick = () => {
        const s = store.getState(), controls = s.controls as CameraControlsImpl
        const pose = [...s.camera.position.toArray(), ...s.camera.quaternion.toArray(), ...controls.getTarget(s.camera.position.clone()).toArray()].join()
        stableTicks = s.internal.frames === 0 && pose === previous ? stableTicks + 1 : 0
        previous = pose
        ticks++
        if (ticks > 2 && stableTicks >= 3) resolve()
        else if (performance.now() - started > 30_000) reject(new Error('camera did not settle within 30 s'))
        else requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
  }, R3F_DEPS)
}

/** Tư thế đích camera-controls đang hướng tới: vị trí rồi tâm nhìn. */
function cameraGoal(page: Page): Promise<number[]> {
  return page.evaluate(async (url) => {
    const { _roots } = (await import(url)) as R3FModule
    const s = _roots.get(document.querySelector('canvas')!)!.store.getState(), controls = s.controls as CameraControlsImpl
    return [...controls.getPosition(s.camera.position.clone(), true).toArray(), ...controls.getTarget(s.camera.position.clone(), true).toArray()]
  }, R3F_DEPS)
}

/**
 * Thực hiện thao tác đổi camera rồi chờ tư thế mới được vẽ. `CameraRig` đổi camera trong effect
 * chạy sau commit, nên ngay sau thao tác `waitCameraSettled` có thể thấy tư thế cũ đứng yên. Hàm
 * chờ đích camera đổi (effect đã chạy) rồi mới chờ camera đứng yên. Không tự xin frame: từ LM-056
 * `CameraRig` tự `invalidate()` sau mỗi lệnh camera, kể cả khi giảm chuyển động.
 */
export async function renderCameraChange(page: Page, action: () => Promise<unknown>) {
  const previous = await cameraGoal(page)
  await action()
  await page.evaluate(async ({ url, previous }) => {
    const { _roots } = (await import(url)) as R3FModule
    const store = _roots.get(document.querySelector('canvas')!)!.store
    const started = performance.now()
    await new Promise<void>((resolve, reject) => {
      const tick = () => {
        const s = store.getState(), controls = s.controls as CameraControlsImpl
        const goal = [...controls.getPosition(s.camera.position.clone(), true).toArray(), ...controls.getTarget(s.camera.position.clone(), true).toArray()]
        if (goal.some((value, i) => value !== previous[i])) resolve()
        else if (performance.now() - started > 30_000) reject(new Error('camera goal did not change within 30 s'))
        else requestAnimationFrame(tick)
      }
      tick()
    })
  }, { url: R3F_DEPS, previous })
  await waitCameraSettled(page)
}

/** Chờ một nhịp cố định để thao tác kịp đánh thức demand loop, rồi chờ scene nghỉ lại. */
export async function settle(page: Page, delayMs: number) {
  await page.waitForTimeout(delayMs)
  await waitIdle(page)
}

export function metrics(page: Page): Promise<ViewerMetrics> {
  return page.locator('[data-viewer-performance]').evaluate((el) => ({ ...el.dataset }) as ViewerMetrics)
}

export function visibleCargo(page: Page): Promise<VisibleCargo> {
  return page.evaluate(async (url) => {
    const { _roots } = (await import(url)) as R3FModule
    const s = _roots.get(document.querySelector('canvas')!)!.store.getState()
    const result: Record<string, number> = {}
    for (const name of ['cargo-opaque', 'cargo-dim', 'cargo-hull']) {
      const mesh = s.scene.getObjectByName(name) as InstancedMesh | undefined
      if (!mesh) continue
      const matrix = s.camera.matrixWorld.clone()
      let visible = 0
      for (let i = 0; i < mesh.count; i++) { mesh.getMatrixAt(i, matrix); if (matrix.elements[0] > 0) visible++ }
      result[name] = visible
    }
    return result as VisibleCargo
  }, R3F_DEPS)
}

/** Toạ độ màn hình của tâm một instance; `name` là tên InstancedMesh (mặc định kiện đặc, `obstacle-body` cho vật cản). */
export function instancePoint(page: Page, index: number, name = 'cargo-opaque'): Promise<ScreenPoint> {
  return page.evaluate(async ({ url, index, name }) => {
    const { _roots } = (await import(url)) as R3FModule
    const canvas = document.querySelector('canvas')!
    const s = _roots.get(canvas)!.store.getState()
    const mesh = s.scene.getObjectByName(name) as InstancedMesh, matrix = s.camera.matrixWorld.clone()
    mesh.getMatrixAt(index, matrix)
    const p = s.camera.position.clone().setFromMatrixPosition(matrix).applyMatrix4(mesh.matrixWorld).project(s.camera)
    const r = canvas.getBoundingClientRect()
    return { x: r.x + (p.x + 1) * r.width / 2, y: r.y + (1 - p.y) * r.height / 2 }
  }, { url: R3F_DEPS, index, name })
}

export function hasSceneObject(page: Page, name: string): Promise<boolean> {
  return page.evaluate(async ({ url, name }) => {
    const { _roots } = (await import(url)) as R3FModule
    return Boolean(_roots.get(document.querySelector('canvas')!)!.store.getState().scene.getObjectByName(name))
  }, { url: R3F_DEPS, name })
}

const PRESET_VALUES = { 'Trên': 'tren', 'Cửa sau': 'cua-sau', 'Bên hông': 'ben-hong', 'Trước': 'truoc', 'Góc chéo': 'goc-cheo' } as const
export type CameraPresetLabel = keyof typeof PRESET_VALUES

export async function cameraPreset(page: Page, label: CameraPresetLabel) {
  await page.getByRole('combobox', { name: 'Góc nhìn', exact: true }).selectOption(PRESET_VALUES[label])
}

const INSPECTOR_TABS = { package: 'Kiện', operations: 'Vận hành', display: 'Hiển thị', packages: 'Danh sách', metrics: 'Chỉ số' } as const
export type InspectorTab = keyof typeof INSPECTOR_TABS

export async function openInspector(page: Page, tab: InspectorTab = 'operations') {
  if (!await page.getByRole('dialog').count()) {
    if (tab === 'package') await page.getByRole('button', { name: 'Chọn kiện', exact: true }).click()
    else if (tab === 'display') await page.getByRole('button', { name: 'Hiển thị', exact: true }).click()
    else await page.getByRole('button', { name: 'Chi tiết / Hiển thị', exact: true }).click()
  }
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: INSPECTOR_TABS[tab], exact: true }).click()
  return dialog
}

export async function closeInspector(page: Page) {
  const dialog = page.getByRole('dialog')
  if (await dialog.count()) await dialog.getByRole('button', { name: 'Đóng', exact: true }).click()
}

export async function selectPlacement(page: Page, id: string) {
  const select = page.getByRole('combobox', { name: 'Chọn kiện', exact: true })
  const opened = !await select.count()
  if (opened) await openInspector(page, 'package')
  await select.selectOption(id)
  if (opened) await closeInspector(page)
}

export async function selectedPlacementId(page: Page) {
  const select = page.getByRole('combobox', { name: 'Chọn kiện', exact: true })
  return await select.count()
    ? select.inputValue()
    : (await page.getByRole('button', { name: 'Chọn kiện', exact: true }).innerText()).trim()
}

export async function enterEdit(page: Page) {
  const button = page.getByRole('button', { name: 'Chỉnh sửa', exact: true })
  if (await button.count()) await button.click()
  else await page.getByRole('button', { name: 'Chỉnh sửa kiện', exact: true }).click()
}

/**
 * Nạp module nguồn qua Vite trong trình duyệt để lấy đúng dữ liệu app đang dùng (mock
 * nghiệp vụ, fixture benchmark, operations model) mà không nhân bản logic vào test.
 */
export const SOURCE_MODULES = {
  benchmark: '/src/features/viewer3d/benchmark.mock.ts',
  /** `benchmarkScene` và `seedScene`: scene cm đúng như Planner dựng. */
  scene: '/src/test/scene.ts',
  /** `unloadSequence`, `createLifoIndex`: thứ tự dỡ và kiểm LIFO đúng như mô phỏng dỡ. */
  operations: '/src/features/viewer3d/operations/unloading.ts',
} as const
