import { trips } from './screens.mock.js';
import { packages, stops, addresses } from './trip-detail.mock.js';
import { $, fmt, escape, href, badge, link, shell, dialog, summaryBlock } from './screen-ui.js';
import { packageDetail } from './package-detail.js';
const totalWeight = packages.reduce((n, p) => n + p.kg * p.quantity, 0);
const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
const summary = () => `<dl class="review-facts"><div><dt>Kiện hàng</dt><dd>132 <small>/ 6 loại</small></dd></div><div><dt>Khối lượng</dt><dd>${fmt.format(totalWeight)} <small>kg</small></dd></div><div><dt>Điểm giao</dt><dd>4</dd></div></dl>`;

export function tripList() {
  const active = trips.filter(t => ['loading', 'delivering'].includes(t.state)).length;
  const attention = trips.filter(t => ['stale', 'optimized'].includes(t.state)).length;
  const dates = [...new Set(trips.map(t => t.date))];
  const attentionTrips = trips.filter(t => ['stale', 'optimized'].includes(t.state));
  const order = ['draft', 'optimized', 'stale', 'approved', 'loading', 'loaded', 'delivering'];
  const sort = { key: '', dir: 'ascending' };
  const sortHead = (key, label, extra = '') => `<th scope="col" class="sortable ${extra}" data-sort="${key}" aria-sort="none"><button type="button">${label}<span aria-hidden="true">↕</span></button></th>`;

  $('screen-root').innerHTML = shell('trips', `${summaryBlock([
    { label: 'Chuyến trong kỳ', value: trips.length },
    { label: 'Đang thực hiện', value: active },
    { label: 'Cần xử lý', value: attention },
  ], 'Kỳ 22–24/09/2026 · trích từ dữ liệu seed, không phải báo cáo toàn đội xe.')}<div class="dispatch-grid"><section class="paper"><div class="list-tools"><label class="search"><input id="trip-search" placeholder="Tìm mã chuyến, tuyến giao hoặc phương tiện…" aria-label="Tìm chuyến"></label><label class="tool-field">Trạng thái<select id="trip-status"><option value="all">Mọi trạng thái</option><option value="attention">Cần xử lý</option><option value="active">Đang thực hiện</option></select></label><label class="tool-field">Ngày chạy<select id="trip-date"><option value="all">Mọi ngày</option>${dates.map(d => `<option value="${d}">${d}</option>`).join('')}</select></label><label class="tool-field tool-density">Mật độ<select id="trip-density"><option value="compact">Gọn</option><option value="default" selected>Mặc định</option><option value="roomy">Thoáng</option></select></label></div><div class="filter-context" id="filter-context" hidden></div><div class="suite-table-scroll"><table class="trip-table" data-density="default"><thead><tr><th scope="col">Chuyến / tuyến giao</th>${sortHead('date', 'Ngày chạy', 'col-date')}<th scope="col" class="col-vehicle">Phương tiện</th>${sortHead('count', 'Hàng', 'num')}${sortHead('state', 'Trạng thái')}</tr></thead><tbody id="trip-rows"></tbody></table></div><footer class="list-foot" id="trip-count" aria-live="polite"></footer></section><details class="attention-panel" id="attention-panel" open><summary><span>Cần xử lý</span><b>${attentionTrips.length}</b></summary><div class="attention-body"><p class="attention-lede">Hoàn tất các mục này trước khi nhân viên kho bắt đầu xếp.</p><ul class="attention-list">${attentionTrips.map(t => `<li><div class="attention-top"><span class="mono">${t.id}</span>${badge(t.label, t.tone)}</div><p>${t.state === 'stale' ? 'Dữ liệu kiện thay đổi sau khi duyệt.' : escape(t.name)}</p><button type="button" class="attention-action" data-attention-trip="${t.id}">Xem chuyến <span aria-hidden="true">→</span></button></li>`).join('')}</ul><button type="button" class="button secondary" id="attention-filter">Lọc ${attentionTrips.length} chuyến cần xử lý</button></div></details></div>${dialog('trip-preview', 'Thông tin chuyến', '<div id="trip-preview-body"></div>')}`, link('＋ Tạo chuyến', 'create', true));

  function openTrip(id) {
    const t = trips.find(x => x.id === id);
    if (t.id === 'TRIP-2026-0914') { location.href = './trip-detail.html?layout=b'; return; }
    $('trip-preview-body').innerHTML = `<p class="mono">${t.id}</p><h3>${escape(t.name)}</h3>${badge(t.label, t.tone)}<dl><div><dt>Hàng hoá</dt><dd>${t.count} kiện / ${t.stops} điểm</dd></div><div><dt>Ngày chạy</dt><dd>${t.date}</dd></div></dl><a class="button secondary" href="/chuyen/${t.id}">Mở chuyến trong FE hiện tại ↗</a>`;
    $('trip-preview').showModal();
  }

  function sortRows(rows) {
    if (!sort.key) return rows;
    const sign = sort.dir === 'ascending' ? 1 : -1;
    const iso = d => d.split('/').reverse().join('');
    return [...rows].sort((a, b) => sign * (sort.key === 'count' ? a.count - b.count
      : sort.key === 'state' ? order.indexOf(a.state) - order.indexOf(b.state)
        : iso(a.date).localeCompare(iso(b.date))));
  }

  function renderChips(q, filter, day) {
    const chips = [];
    if (q) chips.push([`Tìm: ${$('trip-search').value.trim()}`, () => { $('trip-search').value = ''; }]);
    if (filter !== 'all') chips.push([`Trạng thái: ${$('trip-status').selectedOptions[0].textContent}`, () => { $('trip-status').value = 'all'; }]);
    if (day !== 'all') chips.push([`Ngày chạy: ${day}`, () => { $('trip-date').value = 'all'; }]);
    const box = $('filter-context');
    box.hidden = !chips.length;
    box.innerHTML = chips.length ? `<span>Đang lọc</span>${chips.map(([label], i) => `<button type="button" class="filter-chip" data-chip="${i}">${escape(label)}<span aria-hidden="true">×</span></button>`).join('')}<button type="button" class="filter-clear" id="filter-clear">Xoá bộ lọc</button>` : '';
    box.querySelectorAll('[data-chip]').forEach(b => { b.onclick = () => { chips[Number(b.dataset.chip)][1](); render(); }; });
    if (chips.length) $('filter-clear').onclick = () => { $('trip-search').value = ''; $('trip-status').value = 'all'; $('trip-date').value = 'all'; render(); };
  }

  function render() {
    const q = normalize($('trip-search').value), filter = $('trip-status').value, day = $('trip-date').value;
    const rows = sortRows(trips.filter(t => normalize(`${t.id} ${t.name} ${t.vehicle} ${t.plate}`).includes(q)
      && (filter === 'all' || (filter === 'attention' ? ['stale', 'optimized'] : ['loading', 'delivering']).includes(t.state))
      && (day === 'all' || t.date === day)));
    $('trip-rows').innerHTML = rows.map(t => `<tr><td><button type="button" class="trip-row-link" data-trip="${t.id}"><strong>${escape(t.name)}</strong><span class="mono">${t.id}</span></button></td><td class="col-date mono">${t.date}</td><td class="col-vehicle"><strong>${t.vehicle}</strong><small>${t.plate ? `<span class="mono">${t.plate}</span>` : 'Chưa gán biển số'}</small></td><td class="num"><strong>${t.count}<em> kiện</em></strong><small>${t.stops} điểm giao</small></td><td>${badge(t.label, t.tone)}</td></tr>`).join('')
      || '<tr><td colspan="5" class="empty">Không có chuyến khớp bộ lọc đang bật.</td></tr>';
    $('trip-count').textContent = rows.length === trips.length
      ? `Hiển thị 1–${rows.length} trên ${trips.length} chuyến`
      : `Hiển thị ${rows.length} trên ${trips.length} chuyến`;
    renderChips(q, filter, day);
  }

  $('trip-search').addEventListener('input', render);
  $('trip-status').addEventListener('change', render);
  $('trip-date').addEventListener('change', render);
  $('attention-filter').onclick = () => { $('trip-status').value = 'attention'; render(); };
  $('trip-density').onchange = e => { document.querySelector('.trip-table').dataset.density = e.target.value; };
  document.querySelectorAll('.trip-table th.sortable').forEach(th => {
    th.querySelector('button').onclick = () => {
      sort.dir = sort.key === th.dataset.sort && sort.dir === 'ascending' ? 'descending' : 'ascending';
      sort.key = th.dataset.sort;
      document.querySelectorAll('.trip-table th.sortable').forEach(o => o.setAttribute('aria-sort', 'none'));
      th.setAttribute('aria-sort', sort.dir);
      render();
    };
  });
  $('trip-rows').onclick = e => { const b = e.target.closest('[data-trip]'); if (b) openTrip(b.dataset.trip); };
  $('attention-panel').querySelectorAll('.attention-action').forEach(b => { b.onclick = () => openTrip(b.dataset.attentionTrip); });
  // Dưới 1280px rail thu lại thành một dòng mở được, không bóp bảng.
  const narrow = matchMedia('(max-width: 1279px)');
  const fit = () => { $('attention-panel').open = !narrow.matches; };
  narrow.addEventListener('change', fit); fit();
  render();
}

export function createTrip() {
  $('screen-root').innerHTML = shell('create', `<div class="form-layout"><form id="create-form" class="paper form-paper"><div class="form-heading"><span class="step-number">1</span><div><h2>Thông tin chuyến</h2><p>Đặt tên dễ nhận biết và chọn xe trước khi thêm hàng.</p></div></div><div class="field-grid"><label class="field full">Tên chuyến<input name="name" required maxlength="120" placeholder="Ví dụ: Q.7 – Bình Dương – Biên Hoà"><small>Dùng địa điểm để đồng nghiệp dễ tìm lại.</small></label><label class="field">Ngày chạy<input name="date" type="date" value="2026-09-22" required></label><label class="field">Tài xế<select name="driver"><option>Phạm Quốc Dũng</option><option>Chưa phân công</option></select></label><label class="field full">Phương tiện<select name="vehicle" id="vehicle-choice"><option value="Hyundai HD210">Hyundai HD210 · 60C-446.32</option><option value="Isuzu NQR 550">Isuzu NQR 550 · 51C-284.19</option></select></label></div><div class="vehicle-spec" id="vehicle-spec">Lòng thùng 720 × 235 × 240 cm · Tải trọng 9.500 kg</div><div class="form-heading"><span class="step-number">2</span><div><h2>Thứ tự điểm giao</h2><p>Mẫu bốn điểm. Dùng mũi tên để đổi thứ tự.</p></div></div><ol class="editable-stops" id="draft-stops"></ol><div class="form-heading"><span class="step-number">3</span><div><h2>Hàng hoá</h2><p>Bản phác thảo dùng danh sách 132 kiện hiện có.</p></div></div><div class="attached-data"><div><strong>6 loại kiện / 132 kiện</strong><small>${fmt.format(totalWeight)} kg · Yêu cầu xếp đi kèm từng loại</small></div><a href="./trip-detail.html?layout=b">Xem danh sách ↗</a></div><footer class="form-actions"><button class="button primary" type="submit">Xem lại bản nháp</button><a href="${href('trips')}" class="button secondary">Quay lại</a><small>Bản nháp chỉ nằm trong trang này.</small></footer></form><aside class="form-aside"><span class="suite-caption">Lập chuyến</span><h2>Kiểm tra trước khi tiếp tục</h2><ol class="plain-checklist"><li>Tên tuyến và ngày chạy</li><li>Xe phù hợp với kích thước hàng</li><li>Thứ tự điểm giao đúng thực tế</li><li>Số lượng và yêu cầu xếp từng loại</li></ol><div class="mini-glass">${summary()}<p>Thông số từ danh sách mẫu; chưa phải kết quả tối ưu.</p></div></aside></div>${dialog('draft-review', 'Kiểm tra bản nháp', '<div id="draft-review-body"></div>')}`);
  const order = [0, 1, 2, 3];
  function renderStops() { $('draft-stops').innerHTML = order.map((index, i) => `<li><span class="stop-dot stop-${index + 1}">${i + 1}</span><div><strong>${stops[index]}</strong><small>${addresses[index]}</small></div><button type="button" data-move="${i},-1" aria-label="Đưa ${stops[index]} lên" ${i === 0 ? 'disabled' : ''}>↑</button><button type="button" data-move="${i},1" aria-label="Đưa ${stops[index]} xuống" ${i === 3 ? 'disabled' : ''}>↓</button></li>`).join(''); }
  $('draft-stops').onclick = e => { const b = e.target.closest('[data-move]'); if (!b) return; const [i, delta] = b.dataset.move.split(',').map(Number); [order[i], order[i + delta]] = [order[i + delta], order[i]]; renderStops(); $('draft-stops').querySelector(`[data-move="${i + delta},${delta}"]`)?.focus(); };
  $('vehicle-choice').onchange = e => { $('vehicle-spec').textContent = e.target.value.startsWith('Hyundai') ? 'Lòng thùng 720 × 235 × 240 cm · Tải trọng 9.500 kg' : 'Lòng thùng 570 × 210 × 215 cm · Tải trọng 5.500 kg — hàng mẫu nặng 5.844 kg, vượt tải xe này.'; };
  $('create-form').onsubmit = e => { e.preventDefault(); const data = new FormData(e.target); if (data.get('vehicle').startsWith('Isuzu')) { $('vehicle-choice').setCustomValidity('Hàng mẫu vượt tải 5.500 kg. Chọn xe khác.'); $('vehicle-choice').reportValidity(); return; } $('draft-review-body').innerHTML = `<h3>${escape(data.get('name'))}</h3><p>${escape(data.get('date'))} · ${escape(data.get('driver'))}</p><p>${escape(data.get('vehicle'))}</p><ol>${order.map(i => `<li>${stops[i]}</li>`).join('')}</ol><p class="quiet-note">Chưa tạo chuyến trong hệ thống. Thiết lập tiếp theo dùng chuyến mẫu 132 kiện, không tự lưu bản nháp này.</p>${link('Xem phác thảo thiết lập tối ưu', 'optimize', true)}`; $('draft-review').showModal(); };
  $('vehicle-choice').addEventListener('change', () => $('vehicle-choice').setCustomValidity(''));
  renderStops();
}

export function optimization() {
  $('screen-root').innerHTML = shell('optimize', `<div class="optimization-layout"><form id="optimization-form" class="paper form-paper"><div class="form-heading"><span class="step-number">1</span><div><h2>Kiểm tra đầu vào</h2><p>TRIP-2026-0914 · Q.7 → Biên Hoà</p></div></div><div class="input-review">${summary()}<div><strong>Hyundai HD210</strong><span>60C-446.32 · Lòng thùng 720 × 235 × 240 cm</span></div></div><a class="inline-action" href="./trip-detail.html?layout=b">Kiểm tra danh sách kiện →</a><div class="form-heading"><span class="step-number">2</span><div><h2>Yêu cầu xếp hàng</h2><p>Chọn yêu cầu cho lần chạy mẫu.</p></div></div><label class="setting-row"><div><strong>Ưu tiên thứ tự dỡ theo điểm giao</strong><p>Hỗ trợ lấy hàng của điểm giao trước.</p></div><input type="checkbox" name="lifo" checked></label><label class="setting-row"><div><strong>Ưu tiên tâm khối lượng thấp</strong><p>Đây là tâm khối lượng hàng, không phải toàn xe.</p></div><input type="checkbox" name="low" checked></label><details class="advanced-settings"><summary>Thiết lập nâng cao</summary><label class="field">Giới hạn thời gian (giây)<input name="time" type="number" min="1" max="600" value="30" required></label><label class="field">Seed lặp lại<input name="seed" type="number" min="0" step="1" value="42"></label><p>Phương thức đang dùng: MOCK. Không chạy thuật toán thật từ bản phác thảo.</p></details><footer class="form-actions"><button class="button primary">Xem bước chạy mẫu</button>${link('Quay lại danh sách', 'trips')}</footer></form><aside class="optimization-aside"><div class="mini-glass"><span class="suite-caption">Trước khi xếp</span><h2>Hai giới hạn khác nhau</h2><div class="capacity"><div><span>Khối lượng / tải xe</span><strong>61,5%</strong></div><meter min="0" max="100" value="61.5"></meter><small>5.844 / 9.500 kg</small><div><span>Thể tích hàng / thùng</span><strong>40,8%</strong></div><meter min="0" max="100" value="40.8"></meter><small>16,55 m³ / thể tích thùng</small></div><p>Thể tích còn lại không đảm bảo mọi kiện đều xếp vừa. Cần kiểm tra kết quả hình học.</p></div><div class="quiet-note"><strong>Sau khi chạy</strong><p>Xem phương án → kiểm tra kiện chưa xếp và cảnh báo → duyệt để kho thực hiện.</p></div></aside></div>${dialog('run-preview', 'Phác thảo bước xử lý', '<p>Yêu cầu đã được kiểm tra định dạng trong trang. Chưa gửi tác vụ tối ưu.</p><div id="run-values" class="review-facts"></div><p class="quiet-note">Giao diện chạy thật cần có huỷ, thời gian đã chạy và số kiện đã xét từ service. Bản này không tạo thanh tiến độ giả.</p><div class="dialog-actions"><a class="button primary" href="./screens.html?screen=planner">Xem bố cục kết quả mẫu</a><a class="button secondary" href="/chuyen/TRIP-2026-0914/toi-uu">Chạy mock trong FE hiện tại ↗</a></div>')}`);
  $('optimization-form').onsubmit = e => { e.preventDefault(); const data = new FormData(e.target); $('run-values').textContent = `Giới hạn ${data.get('time')} giây · Thứ tự điểm giao: ${data.has('lifo') ? 'Bật' : 'Tắt'} · Tâm khối lượng thấp: ${data.has('low') ? 'Bật' : 'Tắt'}`; $('run-preview').showModal(); };
}

export function planner() {
  $('screen-root').innerHTML = shell('planner', `<div class="planner-shell"><div class="planner-strip"><span class="mono">TRIP-2026-0914</span>${badge('Bản duyệt mẫu', 'success')}<span>132 kiện · 4 điểm giao</span><a href="./trip-detail.html?layout=b">Chi tiết chuyến ↗</a></div><div class="planner-grid"><section class="planner-stage" aria-label="Ảnh tham chiếu phương án 3D"><img src="/docs/screenshots/handoff/vi-planner-success.png" alt="Ảnh chụp engine LoadMaster hiện tại: xe và 132 kiện trong phương án mẫu"><div class="scene-reference">Ảnh từ engine hiện tại · Không phải canvas tương tác</div><a class="button primary scene-open" href="/chuyen/TRIP-2026-0914/phuong-an">Mở mô phỏng 3D thật ↗</a></section><aside class="planner-inspector"><div class="segmented" role="group" aria-label="Nội dung panel"><button data-panel="cargo" aria-pressed="true">Kiện hàng</button><button data-panel="review" aria-pressed="false">Kiểm tra</button></div><div id="planner-content"></div></aside></div><footer class="planner-bottom"><strong>Đọc → kiểm tra → duyệt</strong><p>Các điều khiển camera, xếp/dỡ và chỉnh kiện tiếp tục dùng engine hiện tại. Phác thảo tập trung vào tổ chức công cụ và inspector.</p></footer></div>`);
  function panel(mode) {
    document.querySelectorAll('[data-panel]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.panel === mode)));
    $('planner-content').innerHTML = mode === 'cargo' ? `<label class="field">Loại kiện<select id="planner-package">${packages.map(p => `<option value="${p.id}">${p.id} · ${p.name}</option>`).join('')}</select></label><div id="planner-package-detail" class="package-detail"></div>` : `<h2>Trước khi duyệt</h2><ol class="plain-checklist"><li>Đối chiếu kiện đã xếp / chưa xếp.</li><li>Kiểm tra vị trí, hướng đặt và khả năng tiếp cận.</li><li>Xem cảnh báo từ engine.</li></ol><div class="quiet-note">Ảnh tĩnh không chứng minh phương án hợp lệ. Mở viewer thật để xem kết quả kiểm tra hiện tại.</div><a class="button secondary" href="./trip-detail.html?layout=b&scenario=stale">Phác thảo cần duyệt lại →</a>`;
    if (mode === 'cargo') { const render = () => { const p = packages.find(p => p.id === $('planner-package').value); $('planner-package-detail').innerHTML = packageDetail(p, stops[p.stop - 1], fmt); $('planner-package-detail').querySelector('.inspector-header').remove(); }; $('planner-package').onchange = render; render(); }
  }
  document.querySelectorAll('[data-panel]').forEach(b => b.onclick = () => panel(b.dataset.panel)); panel('cargo');
}
