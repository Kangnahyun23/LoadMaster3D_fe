/** Bộ sưu tập của kho mock. */
export type MockDbCollection = 'vehicles' | 'trips' | 'revisions'

/**
 * Tham số theo từng mã lỗi của kho. Kho chỉ trả mã + tham số, không trả câu hiển thị: UI dịch mã theo ngôn ngữ (D-28).
 */
export type MockDbErrorParams = {
  /** Không có bản ghi `id` trong `collection`. */
  NOT_FOUND: { collection: MockDbCollection; id: string }
  /** Xoá xe mà các chuyến `tripIds` còn dùng. */
  VEHICLE_IN_USE: { vehicleId: string; tripIds: string[] }
  /** Duyệt revision đã lỗi thời: xe hoặc kiện của chuyến đổi sau khi tối ưu (D-31). */
  REVISION_STALE: { revisionId: string }
  /** Duyệt revision có `result.status` khác `COMPLETED`. */
  REVISION_NOT_COMPLETED: { revisionId: string }
  /** Draft chỉnh một kiện không có placement trong revision (mã lạ, hoặc kiện nằm trong `unplacedPackages`). */
  PATCH_UNKNOWN_INSTANCE: { packageInstanceId: string }
}

export type MockDbErrorCode = keyof MockDbErrorParams

/** Lỗi nghiệp vụ của kho mock: promise bị từ chối bằng lỗi này, `code` cho UI chọn câu. */
export class MockDbError<Code extends MockDbErrorCode = MockDbErrorCode> extends Error {
  readonly code: Code
  readonly params: MockDbErrorParams[Code]

  constructor(code: Code, params: MockDbErrorParams[Code]) {
    // `message` chỉ cho người phát triển đọc trong log
    super(`${code} ${JSON.stringify(params)}`)
    this.name = 'MockDbError'
    this.code = code
    this.params = params
  }
}
