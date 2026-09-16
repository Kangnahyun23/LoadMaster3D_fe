import { expect, test } from 'vitest'
import type { VehicleConfig } from '@/domain/models'
import { deleteVehicle, fetchVehicle, fetchVehicles, saveVehicle } from './vehicles-api'

/**
 * Seam của lớp dữ liệu Đội xe (LM-040): hook Query chỉ gọi bốn hàm này, nên test đi thẳng qua chúng
 * xuống kho mock dùng chung thay vì giả lập kho.
 */

const NEW_VEHICLE: VehicleConfig = {
  id: '',
  name: 'Thaco Ollin 720 · 51D-118.62',
  innerLengthCm: 610,
  innerWidthCm: 210,
  innerHeightCm: 210,
  maxPayloadKg: 7200,
  doorWidthCm: 200,
  doorHeightCm: 200,
  doorPosition: 'REAR',
  clearanceCm: 0,
  obstacles: [],
}

test('the fleet list comes from the seeded repository', async () => {
  const vehicles = await fetchVehicles()

  expect(vehicles.map((vehicle) => vehicle.id)).toContain('VEHICLE-001')
  expect(await fetchVehicle('VEHICLE-001')).toMatchObject({ name: 'Truck 6m', innerWidthCm: 240 })
})

test('a vehicle without an id is created, then updated and deleted under the id the repository gave it', async () => {
  const created = await saveVehicle({ ...NEW_VEHICLE })

  expect(created.id).not.toBe('')
  expect(await fetchVehicle(created.id)).toMatchObject({ name: NEW_VEHICLE.name })

  const renamed = await saveVehicle({ ...created, name: 'Thaco Ollin 720 · 51D-118.63' })
  expect(renamed.id).toBe(created.id)
  expect((await fetchVehicle(created.id)).name).toBe('Thaco Ollin 720 · 51D-118.63')

  await deleteVehicle(created.id)
  await expect(fetchVehicle(created.id)).rejects.toMatchObject({ code: 'NOT_FOUND' })
})
