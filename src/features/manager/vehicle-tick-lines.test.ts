import { expect, test } from 'vitest'
import { vehicleTickLines } from './vehicle-tick-lines'

test('biển số một dòng riêng, không bẻ; tên dòng xe ngắt theo từ', () => {
  expect(vehicleTickLines('Isuzu NQR 550 · 51C-284.19', 18)).toStrictEqual(['Isuzu NQR 550', '51C-284.19'])
  expect(vehicleTickLines('Hino FC9J đông lạnh · 51C-190.07', 18)).toStrictEqual(['Hino FC9J đông', 'lạnh', '51C-190.07'])
})

test('tên không có biển số thì chỉ ngắt theo từ', () => {
  expect(vehicleTickLines('Xe thuê ngoài', 18)).toStrictEqual(['Xe thuê ngoài'])
})

test('tên quá dài giữ tối đa hai dòng, dòng cuối cắt kèm dấu ba chấm', () => {
  expect(vehicleTickLines('Mercedes Benz Actros Heavy Duty Special · 51C-000.01', 12))
    .toStrictEqual(['Mercedes', 'Benz Actros…', '51C-000.01'])
})
