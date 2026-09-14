// Read the real Vite/R3F scene in tests; no application test bridge or production global.
export async function sceneSnapshot(page) {
  return page.evaluate(async () => {
    const { _roots } = await import('/node_modules/.vite/deps/@react-three_fiber.js')
    const canvas = document.querySelector('canvas')
    const s = _roots.get(canvas).store.getState()
    const proxy = s.scene.getObjectByName('editor-proxy')
    const instances = []
    let meshes = 0
    s.scene.traverse((o) => {
      if (o.isInstancedMesh) instances.push({ name: o.name, count: o.count })
      if (o.isMesh && !o.isInstancedMesh) meshes++
    })
    const target = s.controls.getTarget(s.camera.position.clone())
    return { instances, meshes, proxy: proxy?.position.toArray(), target: target.toArray(),
      direction: s.camera.position.clone().sub(target).normalize().toArray(),
      eventsEnabled: s.events.enabled, controlsEnabled: s.controls.enabled }
  })
}

export async function proxyPoint(page, deltaMm = [0, 0, 0]) {
  return page.evaluate(async (delta) => {
    const { _roots } = await import('/node_modules/.vite/deps/@react-three_fiber.js')
    const canvas = document.querySelector('canvas')
    const s = _roots.get(canvas).store.getState()
    const proxy = s.scene.getObjectByName('editor-proxy')
    const position = proxy.getWorldPosition(proxy.position.clone())
    position.x += delta[0] / 1000
    position.y += delta[2] / 1000
    position.z += delta[1] / 1000
    position.project(s.camera)
    const r = canvas.getBoundingClientRect()
    return { x: r.x + (position.x + 1) * r.width / 2, y: r.y + (1 - position.y) * r.height / 2 }
  }, deltaMm)
}

export async function waitIdle(page) {
  await page.waitForFunction(() => document.querySelector('[data-viewer-performance]')?.dataset.idle === 'true')
}
export async function metrics(page) {
  return page.locator('[data-viewer-performance]').evaluate((el) => ({ ...el.dataset }))
}

export async function visibleCargo(page) {
  return page.evaluate(async () => {
    const { _roots } = await import('/node_modules/.vite/deps/@react-three_fiber.js')
    const canvas = document.querySelector('canvas'), s = _roots.get(canvas).store.getState()
    const result = {}
    for (const name of ['cargo-opaque', 'cargo-dim', 'cargo-hull']) {
      const mesh = s.scene.getObjectByName(name)
      if (!mesh) continue
      const matrix = s.camera.matrixWorld.clone()
      let visible = 0
      for (let i = 0; i < mesh.count; i++) { mesh.getMatrixAt(i, matrix); if (matrix.elements[0] > 0) visible++ }
      result[name] = visible
    }
    return result
  })
}

export async function instancePoint(page, index) {
  return page.evaluate(async (i) => {
    const { _roots } = await import('/node_modules/.vite/deps/@react-three_fiber.js')
    const canvas = document.querySelector('canvas'), s = _roots.get(canvas).store.getState()
    const mesh = s.scene.getObjectByName('cargo-opaque'), matrix = s.camera.matrixWorld.clone()
    mesh.getMatrixAt(i, matrix)
    const p = s.camera.position.clone().setFromMatrixPosition(matrix).applyMatrix4(mesh.matrixWorld).project(s.camera)
    const r = canvas.getBoundingClientRect()
    return { x: r.x + (p.x + 1) * r.width / 2, y: r.y + (1 - p.y) * r.height / 2 }
  }, index)
}

export async function cameraPreset(page, label) {
  const values = { 'Trên': 'tren', 'Cửa sau': 'cua-sau', 'Bên hông': 'ben-hong', 'Trước': 'truoc', 'Góc chéo': 'goc-cheo' }
  await page.getByRole('combobox', { name: 'Góc nhìn', exact: true }).selectOption(values[label] ?? label)
}
export async function openInspector(page, tab = 'operations') {
  let dialog = page.getByRole('dialog')
  if (!await dialog.count()) {
    if (tab === 'package') await page.getByRole('button', { name: 'Chọn kiện', exact: true }).click()
    else if (tab === 'display') await page.getByRole('button', { name: 'Hiển thị', exact: true }).click()
    else await page.getByRole('button', { name: 'Chi tiết / Hiển thị', exact: true }).click()
  }
  dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: { package: 'Kiện', operations: 'Vận hành', display: 'Hiển thị', packages: 'Danh sách' }[tab], exact: true }).click()
  return dialog
}
export async function closeInspector(page) {
  const dialog = page.getByRole('dialog')
  if (await dialog.count()) await dialog.getByRole('button', { name: 'Đóng', exact: true }).click()
}
export async function selectPlacement(page, id) {
  const select = page.getByRole('combobox', { name: 'Chọn kiện', exact: true })
  const opened = !await select.count()
  if (opened) await openInspector(page, 'package')
  await select.selectOption(id)
  if (opened) await closeInspector(page)
}
export async function selectedPlacementId(page) {
  const select = page.getByRole('combobox', { name: 'Chọn kiện', exact: true })
  return await select.count() ? select.inputValue() : (await page.getByRole('button', { name: 'Chọn kiện', exact: true }).innerText()).trim()
}
export async function enterEdit(page) {
  const button = page.getByRole('button', { name: 'Chỉnh sửa', exact: true })
  if (await button.count()) await button.click()
  else await page.getByRole('button', { name: 'Chỉnh sửa kiện', exact: true }).click()
}
