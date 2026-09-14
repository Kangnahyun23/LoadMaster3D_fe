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
