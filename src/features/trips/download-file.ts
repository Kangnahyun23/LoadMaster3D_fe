/** Tải một Blob về máy dưới tên `fileName` (file mẫu nhập kiện, LM-093): liên kết tạm, bấm, gỡ, thu hồi URL. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.hidden = true
  document.body.append(link)
  link.click()
  link.remove()
  // Thu hồi sau lượt sự kiện hiện tại: một số trình duyệt còn đọc URL ngay sau `click()`
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
