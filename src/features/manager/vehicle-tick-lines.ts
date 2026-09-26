/**
 * Chia tên xe "Hino FC9J đông lạnh · 51C-190.07" thành các dòng của nhãn trục SVG (SVG không tự xuống dòng): tên dòng xe ngắt
 * theo từ trong `maxChars` ký tự, tối đa `maxNameLines` dòng (dòng cuối thừa thì cắt kèm "…"), rồi biển số một dòng riêng, không
 * bẻ — cùng luật với `VehicleName` (LM-095). Tên không có " · " thì cả tên ngắt theo từ.
 */
export function vehicleTickLines(name: string, maxChars: number, maxNameLines = 2): string[] {
  const cut = name.lastIndexOf(' · ')
  const model = cut === -1 ? name : name.slice(0, cut)
  const plate = cut === -1 ? null : name.slice(cut + 3)

  const lines: string[] = []
  for (const word of model.split(/\s+/).filter(Boolean)) {
    const last = lines.at(-1)
    if (last !== undefined && last.length + 1 + word.length <= maxChars) lines[lines.length - 1] = `${last} ${word}`
    else lines.push(word)
  }
  if (lines.length > maxNameLines) {
    const kept = lines.slice(0, maxNameLines)
    const tail = kept[maxNameLines - 1] ?? ''
    kept[maxNameLines - 1] = `${tail.slice(0, Math.max(1, maxChars - 1))}…`
    lines.splice(0, lines.length, ...kept)
  }
  return plate === null ? lines : [...lines, plate]
}
