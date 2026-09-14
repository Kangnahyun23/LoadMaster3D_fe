import { CanvasTexture, SRGBColorSpace } from 'three'

/** One tiny shared neutral surface, multiplied by instance colors. Cosmetic packing
 * seams carry no package/orientation metadata and add no meshes or draw calls. */
export function createCargoSurface() {
  const canvas = document.createElement('canvas')
  canvas.width = 128; canvas.height = 128
  const context = canvas.getContext('2d')!
  const pixels = context.createImageData(128, 128)
  for (let i = 0; i < 128 * 128; i++) {
    const value = 246 + ((i * 73 + (i >>> 7) * 19) % 9)
    pixels.data.set([value, value, value, 255], i * 4)
  }
  context.putImageData(pixels, 0, 0)
  context.fillStyle = 'rgba(255,255,255,0.24)'
  context.fillRect(55, 0, 18, 128)
  context.strokeStyle = 'rgba(0,0,0,0.1)'
  context.lineWidth = 1
  context.strokeRect(1, 1, 126, 126)
  context.beginPath(); context.moveTo(55, 0); context.lineTo(55, 128)
  context.moveTo(73, 0); context.lineTo(73, 128); context.stroke()
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}
