// Explicit design-review scenarios; no writes, timers or simulated server success.
const scenarios = {
  approved: { label: 'Đã duyệt', tone: 'success', stage: 1, next: true, progress: 'Chờ kho bắt đầu' },
  planning: { label: 'Chưa có phương án', tone: 'neutral', stage: 0, progress: 'Đang lập kế hoạch', notice: ['Kiểm tra danh sách trước khi tối ưu', 'Đối chiếu xe, điểm giao và yêu cầu xếp hàng.'], action: 'Mở thiết lập tối ưu', path: 'toi-uu' },
  stale: { label: 'Cần duyệt lại', tone: 'warning', stage: 0, progress: 'Phương án cần kiểm tra lại', notice: ['Dữ liệu chuyến đã thay đổi', 'Cần kiểm tra và duyệt phương án mới trước khi bàn giao cho kho.'], action: 'Xem lại phương án', path: 'phuong-an' },
  loading: { label: 'Đang xếp', tone: 'info', stage: 1, progress: 'Kho đang xếp hàng', notice: ['Chuyến đang khoá chỉnh sửa', 'Xe, điểm giao và danh sách kiện được giữ theo phương án kho đang thực hiện.'] },
  delivering: { label: 'Đang giao', tone: 'info', stage: 2, progress: 'Tài xế đang giao hàng', notice: ['Đang thực hiện chuyến', 'Danh sách chỉ đọc. Phác thảo này chưa có dữ liệu xác nhận giao từng điểm.'] },
  fetching: { surface: true, label: 'Đang tải chuyến', text: 'Đang lấy thông tin xe, hàng hoá và phương án.', skeleton: true },
  error: { surface: true, label: 'Chưa tải được chuyến', text: 'Không thể hiển thị dữ liệu lúc này. Bạn có thể thử lại.', retry: true },
  empty: { surface: true, label: 'Chưa có kiện hàng', text: 'Danh sách sẽ xuất hiện sau khi thêm kiện hoặc nhập từ file.', retry: true },
  missing: { surface: true, label: 'Không tìm thấy chuyến', text: 'Kiểm tra lại mã chuyến hoặc quay về danh sách.' },
};

export function setupScenarios(onChange) {
  const app = document.getElementById('app');
  const picker = document.getElementById('scenario');
  const heading = document.querySelector('.heading');
  const badge = heading.querySelector('.badge');
  const primary = heading.querySelector('.primary');
  const primaryMarkup = primary.innerHTML;
  const notice = document.getElementById('workflow-notice');
  const surface = document.createElement('section');
  surface.className = 'state-surface';
  surface.setAttribute('aria-live', 'polite');
  document.querySelector('main').append(surface);
  function apply(key) {
    const state = scenarios[key] ?? scenarios.approved;
    picker.value = scenarios[key] ? key : 'approved';
    app.dataset.stateSurface = String(Boolean(state.surface));
    heading.hidden = Boolean(state.surface);
    surface.hidden = !state.surface;
    notice.hidden = !state.notice;
    notice.dataset.tone = state.tone ?? 'info';
    notice.innerHTML = state.notice ? `<div><strong>${state.notice[0]}</strong><span>${state.notice[1]}</span></div><span class="badge ${state.tone}">${state.label}</span>` : '';
    if (state.surface) {
      surface.innerHTML = `${state.skeleton ? '<div class="skeleton-lines" aria-hidden="true"><span></span><span></span><span></span></div>' : ''}<h2>${state.label}</h2><p>${state.text}</p>${state.retry ? `<button class="button secondary" id="retry-scenario">${key === 'error' ? 'Thử lại bản mẫu' : 'Xem chuyến mẫu'}</button>` : '<a class="button secondary" href="/chuyen">Về danh sách chuyến</a>'}`;
      surface.querySelector('#retry-scenario')?.addEventListener('click', () => apply('approved'));
    } else {
      badge.className = `badge ${state.tone}`;
      badge.textContent = state.label;
      if (state.action) primary.textContent = state.action;
      else primary.innerHTML = primaryMarkup;
      primary.href = `/chuyen/TRIP-2026-0914/${state.path ?? 'phuong-an'}`;
      document.querySelector('.journey .badge').textContent = state.progress;
      document.querySelectorAll('.steps li').forEach((step, i) => {
        step.className = i < state.stage ? 'done' : i === state.stage ? (state.next ? 'next' : 'current') : '';
        step.removeAttribute('aria-current');
        if (i === state.stage && !state.next) step.setAttribute('aria-current', 'step');
        step.querySelector('span').textContent = i < state.stage ? '✓' : String(i + 1);
      });
    }
    const url = new URL(location.href);
    url.searchParams.set('scenario', picker.value);
    history.replaceState(null, '', url);
    onChange();
  }
  picker.addEventListener('change', () => apply(picker.value));
  apply(new URL(location.href).searchParams.get('scenario') ?? 'approved');
}
