// Read-only detail for the design prototype. Values come from the same seed snapshot.
export function packageDetail(p, stopName, format) {
  const [length, width, height] = p.size;
  const scale = 112 / Math.max(length, width, height);
  const origin = [110, 24];
  const x = [length * scale * .78, length * scale * .25];
  const y = [-width * scale * .56, width * scale * .35];
  const z = [0, height * scale * .78];
  const add = (...vectors) => vectors.reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
  const point = v => v.join(',');
  const o = origin, a = add(o, x), b = add(o, y), c = add(o, x, y);
  const az = add(a, z), bz = add(b, z), cz = add(c, z);
  const polygon = (points, fill) => `<polygon points="${points.map(point).join(' ')}" fill="${fill}"/>`;
  const dimension = (start, end, label, dx = 0, dy = 0) => `<path d="M${point(start)}L${point(end)}"/><text x="${(start[0] + end[0]) / 2 + dx}" y="${(start[1] + end[1]) / 2 + dy}" text-anchor="middle">${label}</text>`;
  const drawing = `<svg viewBox="0 0 260 205" role="img" aria-label="Dài ${length}, rộng ${width}, cao ${height} cm"><g stroke="#9aadc5" stroke-width="1" stroke-linejoin="round">${polygon([o, a, c, b], '#f4f7fc')}${polygon([b, c, cz, bz], '#e5edf8')}${polygon([a, c, cz, az], '#d5e2f1')}</g><g stroke="#96a9bf" stroke-width=".8">${dimension(add(bz, [0, 13]), add(cz, [0, 13]), `D ${length}`, 0, 15)}${dimension(add(cz, [12, 15]), add(az, [12, 15]), `R ${width}`, 14, 10)}${dimension(add(a, [18, 0]), add(az, [18, 0]), `C ${height}`, 22, 4)}</g></svg>`;
  return `<header class="inspector-header"><div><span>Kiện đang xem</span><strong class="mono">${p.id}</strong></div><button class="button secondary" id="close-detail" aria-label="Đóng chi tiết kiện">Đóng <span aria-hidden="true">×</span></button></header><div class="inspector-body">
    <div class="section-heading"><h3>${p.name}</h3></div>
    <div class="inspector-stop"><span class="stop-dot stop-${p.stop}">${p.stop}</span><span>${stopName}</span></div>
    <figure class="dimension-drawing">${drawing}<figcaption>${p.size.join(' × ')} cm · Dài × Rộng × Cao</figcaption></figure>
    <dl class="inspector-facts"><div><dt>Số lượng</dt><dd>${p.quantity} kiện</dd></div><div><dt>Mỗi kiện</dt><dd>${format.format(p.kg)} kg</dd></div><div><dt>Tổng khối lượng</dt><dd>${format.format(p.quantity * p.kg)} kg</dd></div><div><dt>Thể tích mỗi kiện</dt><dd>${format.format(length * width * height / 1000)} lít</dd></div></dl>
    <section class="inspector-guidance"><h4>Yêu cầu xếp hàng</h4><ul>${p.fragile ? '<li>Hàng dễ vỡ.</li>' : ''}<li>${p.upright ? 'Giữ đứng khi xếp.' : 'Được đổi hướng theo phương án.'}</li><li>Tải tối đa đặt lên trên: <strong>${format.format(p.top)} kg / kiện</strong>.</li></ul></section>
    </div>`;
}
