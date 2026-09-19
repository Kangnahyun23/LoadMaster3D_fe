---
id: LM-085
title: Bảng dữ liệu dùng chung — tìm, lọc, sắp xếp, phân trang, giữ trên URL
phase: 6
labels: [components, table]
depends_on: [LM-080]
estimate: 1d
prd: [D-52]
---

# LM-085 — DataTable có lọc, sắp xếp, phân trang

## Việc cần làm

- [x] `DataTable` bật tính năng TanStack Table v9 khi màn cần: sắp xếp (tiêu đề là nút, `aria-sort`), phân trang (25/50/100, "x–y / n").
- [x] `FilterBar` dùng chung: ô tìm, chọn một giá trị (Select), khoảng ngày; nút "Xoá lọc" khi có lọc.
- [x] `useListUrlState`: trạng thái tìm/lọc/sắp xếp/trang trên URL (`?q=&trang-thai=&sap-xep=&trang=`), quay lại giữ nguyên.
- [x] Trạng thái "không có kết quả khớp lọc" khác trạng thái rỗng.
- [x] Mẫu trên `/thanh-phan`.

## Tiêu chí nghiệm thu

- [x] DOM test: sắp xếp, lọc, đổi trang, URL đồng bộ; bàn phím dùng được toàn bộ.

## Kết quả (19/09/2026)

Màn danh sách ghép ba phần: `FilterBar` (trình bày) → màn tự lọc dòng bằng `@/lib/list-filter` → `DataTable` sắp xếp và phân
trang. Trạng thái nằm trên URL qua `useListUrlState`. Màn đang dùng `DataTable` (chuyến, đội xe, người dùng, bảng kiện, kế hoạch
gần đây, trang tài liệu) không đổi hành vi: tính năng mới chỉ chạy khi truyền prop, cột chỉ sắp xếp được khi khai `enableSorting: true`.

```tsx
const list = useListUrlState({ filters: ['trang-thai', 'tu', 'den'], defaultSort: { id: 'scheduledDate', desc: true } })
const rows = useMemo(() => trips.filter((trip) => matchesQuery([trip.id, trip.name, trip.route], list.query)
  && (list.filters['trang-thai'] === '' || trip.status === list.filters['trang-thai'])
  && isWithinDateRange(trip.scheduledDate, list.filters.tu, list.filters.den)), [trips, list.query, list.filters])

<FilterBar query={list.query} onQueryChange={list.setQuery} searchLabel={t('…')} values={list.filters}
  onValueChange={list.setFilter} onClear={list.clearAll}
  fields={[{ kind: 'select', name: 'trang-thai', label: t('…'), options }, { kind: 'dateRange', label: t('…'), from: 'tu', to: 'den' }]} />
<DataTable data={rows} columns={columns} sorting={list.sorting} onSortingChange={list.setSorting}
  pagination={{ pageIndex: list.pageIndex, pageSize: list.pageSize, onPageChange: list.setPage, onPageSizeChange: list.setPageSize }}
  isFiltering={list.isFiltering} onClearFilters={list.clearAll} />
```

### API

- `DataTable` (`src/components/DataTable.tsx`) — prop mới, đều tuỳ chọn:
  - `sorting` + `onSortingChange(sorting)`: đi cặp; không truyền thì bảng tự giữ thứ tự. Một cột mỗi lần, bấm lại đảo chiều,
    không có trạng thái "bỏ sắp xếp". Chữ so theo thứ tự tiếng Việt, số trong chuỗi theo giá trị (`sortFns.text/alphanumeric`).
    Cột chữ bấm lần đầu tăng dần, cột số giảm dần; cột ngày muốn mới nhất trước thì khai `sortDescFirst: true`.
  - `pagination: { pageIndex, pageSize, onPageChange, onPageSizeChange }` (kiểu `DataTablePagination`): chân bảng 25/50/100,
    "x–y / n" (`aria-live`), nút trước/sau 36px dùng `aria-disabled` nên tiêu điểm không rơi khi tới trang cuối. `pageIndex` quá số
    trang thì hiện trang cuối, không tự sửa URL (dữ liệu về muộn không kéo người dùng về trang 1: `autoResetPageIndex: false`).
  - `isFiltering`, `onClearFilters`, `noMatchMessage`: bảng rỗng lúc đang lọc giữ tiêu đề cột, nói "Không có kết quả khớp bộ lọc"
    (`role="status"`) kèm nút "Xoá lọc"; không lọc thì vẫn là `emptyMessage` / "Chưa có dữ liệu" như cũ.
  - `BaseTableFeatures` giờ gồm `rowSortingFeature`, `rowPaginationFeature` và hai row model — `createColumnHelper<BaseTableFeatures, Row>()`
    của các màn giữ nguyên.
- `DataTablePagination.tsx`: `PAGE_SIZES` (25, 50, 100), `DEFAULT_PAGE_SIZE`, `pageCountOf`, `clampPageIndex`, `PaginationFooter`.
- `DataTableParts.tsx`: `SortHeader` (nút trong `th`, mũi tên lucide 16px, cột căn phải để mũi tên bên trái), `NoMatchRow`.
- `FilterBar<TName>` (`src/components/FilterBar.tsx`): `query`, `onQueryChange`, `searchLabel`, `fields?`, `values?`,
  `onValueChange?(name, value)`, `onClear`. `FilterField` = `{ kind: 'select', name, label, options, allLabel? }` (dòng "Tất cả" trả `''`)
  | `{ kind: 'dateRange', label, from, to }` (hai ô `type="date"`, `YYYY-MM-DD`, hai đầu chặn nhau bằng `min`/`max`). Vùng
  `role="search"`; "Xoá lọc" chỉ hiện khi đang lọc, bấm xong tiêu điểm về ô tìm. Ô tìm và ô ngày giữ bản nháp tại chỗ: router đổi URL
  trong `startTransition`, ô nối thẳng vào giá trị URL sẽ mất chữ và ô ngày nhảy về trống giữa hai lần gõ.
- `useListUrlState({ filters?, defaultSort? })` (`src/components/useListUrlState.ts`) → `{ query, setQuery, filters, setFilter,
  clearAll, sorting, setSorting, pageIndex, pageSize, setPage, setPageSize, isFiltering }`. Tham số URL (`LIST_URL_PARAMS`): `q`,
  `sap-xep` (`id` tăng, `-id` giảm; trùng `defaultSort` thì bỏ), `trang` (từ 1), `so-dong` (25 thì bỏ) + tên bộ lọc của màn.
  Ghi bằng `replace`; đổi tìm/lọc/sắp xếp/cỡ trang về trang 1; `clearAll` giữ sắp xếp và cỡ trang. `sorting` và `filters` giữ
  nguyên object khi URL không đổi (dùng được làm deps).
- `src/lib/list-filter.ts`: `normalizeSearchText`, `matchesQuery(fields, query)` (bỏ dấu, `đ` → `d`, mọi từ phải có, thứ tự nào
  cũng được: "bien hoa" khớp "Biên Hoà"/"Biên Hòa"), `isWithinDateRange(date, from?, to?)` (tính hai đầu; đầu rỗng hoặc sai dạng như
  năm 6 chữ số là không giới hạn), `compareText` (`Intl.Collator('vi', { numeric: true })`).
- Chữ mới: nhánh `common.table` và `common.filters` (vi/en).

### Mẫu `/thanh-phan`

Mục 03 thêm hàng "DataTable · FilterBar · useListUrlState" (`src/app/design-system/components/DataTableSample.tsx`): mọi kiện của các
chuyến trong kho (2.863 dòng với seed ngày 19/09), tìm theo mã kiện/tên hàng/chuyến, lọc chuyến và ngày chạy, sắp theo ngày/mã/khối
lượng, phân trang; URL của trang giữ trạng thái. Dữ liệu đọc qua `design-system-api.ts` → `useSamplePackagesQuery`. Chữ của mẫu ở
`designSystem.components.data.table` (chỉ phục vụ trang tài liệu nên không đặt trong `common`).

### Sửa ngoài phạm vi, phát hiện khi làm

- **Vòng focus không hiện ở toàn app** (`src/index.css`): Tailwind v4 `outline-none` đặt `--tw-outline-style: none`, nên mọi thành
  phần viết `outline-none focus-visible:outline-2 …` (Button, Input, Select, Checkbox, nav rail…) không vẽ vòng khi dùng bàn phím. Thêm
  `:focus-visible { --tw-outline-style: solid }` ngoài `@layer`; `outline-none` và `focus-visible:outline-none` vẫn tắt vòng như cũ vì
  chúng ghi thẳng `outline-style`. Đã kiểm trên Chromium: vòng 2px `--primary` cách 2px.
- **`vitest.config.ts`**: project `dom` có `testTimeout: 15_000`. `TripFormPage` (3 giây khi chạy riêng) và `DriverStopPage` vượt 5 giây
  mặc định khi chạy cả bộ sau khi thêm test mới — chậm do tải song song, không phải lỗi.

### Kiểm thử

- `src/lib/list-filter.test.ts` (7): bỏ dấu, `đ`, nhiều từ nhiều trường, khoảng ngày và đầu sai dạng, thứ tự chữ tiếng Việt.
- `src/components/DataTable.dom.test.tsx` (6): không prop mới thì như cũ; tự giữ thứ tự tiếng Việt; có kiểm soát; rỗng vs không khớp;
  trang vượt số trang; chân bảng tiếng Anh.
- `src/components/FilterBar.dom.test.tsx` (4): ô tìm giữ chữ khi URL chưa kịp đổi và theo khi đổi từ ngoài; "Xoá lọc"; dòng "Tất cả";
  khoảng ngày.
- `src/components/useListUrlState.dom.test.tsx` (6, harness `src/test/trip-list-harness.tsx`, MemoryRouter): sắp xếp ↔ URL, tìm không
  dấu + lọc + về trang 1, không khớp + xoá lọc, phân trang + cỡ trang, mở từ URL và quay lại từ trang chi tiết, toàn bộ bằng bàn phím.
- `pnpm lint`, `pnpm exec tsc -b`, `pnpm build`, `pnpm test` (93 file, 592 test) xanh.

### Đề xuất sửa AGENTS (người điều phối áp)

- Mục 5 "Bảng dữ liệu", thêm: *Danh sách có tìm/lọc/sắp xếp/phân trang (LM-085, D-52) ghép `FilterBar` + `@/lib/list-filter` +
  `DataTable` + `useListUrlState`. Cột chỉ sắp xếp được khi khai `enableSorting: true`; tiêu đề cột sắp xếp được là nút có `aria-sort`.
  Phân trang 25/50/100 qua prop `pagination`. Bảng rỗng vì lọc truyền `isFiltering` để nói "không có kết quả khớp", khác "chưa có dữ
  liệu". Tham số URL tiếng Việt không dấu: `q`, `sap-xep`, `trang`, `so-dong` + tên bộ lọc của màn.*
- Mục 5 "Nút" (focus), thêm: *Tailwind v4: `outline-none` tắt biến `--tw-outline-style`; `index.css` đặt lại `solid` cho
  `:focus-visible` ngoài `@layer` để `focus-visible:outline-2` vẽ được vòng — không bỏ rule đó.*
- Mục 9 "Lớp dữ liệu" hoặc "Quy ước code", thêm: *Ô nhập nối vào tham số URL phải giữ bản nháp tại chỗ (router đổi URL trong
  `startTransition`); dùng `FilterBar`, không nối thẳng `value` vào `useSearchParams`.*
- Mục 9 "Kiểm thử", thêm: *project `dom` chờ tối đa 15 giây mỗi test.*
- Mục 3, thêm vào cây thư mục: `lib/list-filter.ts` (tìm bỏ dấu, lọc ngày, so chữ tiếng Việt) và `components/useListUrlState.ts`.
