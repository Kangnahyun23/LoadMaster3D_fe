import { CanvasTexture, SRGBColorSpace, type MeshStandardMaterial } from 'three'

/** One neutral atlas: carton tape, pallet slats and crate battens. The geometry is
 * still the domain envelope, not a fabricated physical model of its contents. */
export function createCargoSurface() {
  const canvas = document.createElement('canvas')
  canvas.width = 384; canvas.height = 128
  const context = canvas.getContext('2d')!
  const pixels = context.createImageData(384, 128)
  for (let i = 0; i < 384 * 128; i++) {
    const value = 245 + ((i * 73 + (i >>> 7) * 19) % 10)
    pixels.data.set([value, value, value, 255], i * 4)
  }
  context.putImageData(pixels, 0, 0)
  for (let tile = 0; tile < 3; tile++) {
    context.save(); context.translate(tile * 128, 0)
    context.strokeStyle = 'rgba(0,0,0,0.16)'; context.lineWidth = 2
    context.strokeRect(2, 2, 124, 124)
    if (tile === 0) {
      context.fillStyle = 'rgba(255,255,255,0.3)'; context.fillRect(55, 0, 18, 128)
      context.lineWidth = 1
      for (const x of [55, 73]) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 128); context.stroke() }
    } else {
      context.lineWidth = tile === 1 ? 5 : 2
      for (let y = 20; y < 128; y += tile === 1 ? 24 : 18) { context.beginPath(); context.moveTo(2, y); context.lineTo(126, y); context.stroke() }
      if (tile === 2) { context.lineWidth = 9; context.strokeRect(10, 10, 108, 108); context.beginPath(); context.moveTo(10, 10); context.lineTo(118, 118); context.stroke() }
    }
    context.restore()
  }
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace
  return texture
}

// Existing Three r186 uv_vertex hook; one per-instance scalar, no extra materials/draws.
export const applyCargoSurface: MeshStandardMaterial['onBeforeCompile'] = (shader) => {
  shader.vertexShader = 'attribute float packageSurface;\n' + shader.vertexShader
  shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_MAP\n vMapUv.x = (clamp(vMapUv.x, 0.015, 0.985) + packageSurface) / 3.0;\n#endif')
}
