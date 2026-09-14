import { expect, test } from 'vitest'
import {
  cargoPackageSchema,
  MODEL_ISSUE_CODES,
  optimizationRequestSchema,
  optimizationResultSchema,
  vehicleConfigSchema,
} from '@/domain/models'

/** Payloads missing every field, with nested rows and `null` where an object belongs, so each schema raises all it can. */
const BROKEN_PAYLOADS = [
  { entity: 'vehicle', schema: vehicleConfigSchema, payload: { obstacles: [{}, null], axles: [{}] } },
  { entity: 'package', schema: cargoPackageSchema, payload: {} },
  { entity: 'request', schema: optimizationRequestSchema, payload: { vehicle: null, packages: [null], settings: {} } },
  {
    entity: 'result',
    schema: optimizationResultSchema,
    payload: { placements: [{}], unplacedPackages: [{}, null], metrics: { centerOfGravityCm: {} } },
  },
  { entity: 'vehicle', schema: vehicleConfigSchema, payload: null },
  { entity: 'package', schema: cargoPackageSchema, payload: null },
  { entity: 'request', schema: optimizationRequestSchema, payload: null },
  { entity: 'result', schema: optimizationResultSchema, payload: null },
]

test('every issue raised for a broken payload is a registered code, never a zod sentence (D-28)', () => {
  const registered: readonly string[] = MODEL_ISSUE_CODES
  const unregistered = BROKEN_PAYLOADS.flatMap(({ entity, schema, payload }) =>
    (schema.safeParse(payload).error?.issues ?? [])
      .filter(({ message }) => !registered.includes(message))
      .map(({ path, message }) => `${[entity, ...path].join('.')}: ${message}`),
  )
  expect(unregistered).toStrictEqual([])
})
