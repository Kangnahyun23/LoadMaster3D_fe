import type { Dictionary } from '../types'
import type { fields as source } from '../vi/fields'

export const fields = {
  innerLengthCm: 'Inner length',
  innerWidthCm: 'Inner width',
  innerHeightCm: 'Inner height',
  maxPayloadKg: 'Max payload',
  doorWidthCm: 'Door width',
  doorHeightCm: 'Door height',
  lengthCm: 'Length',
  widthCm: 'Width',
  heightCm: 'Height',
} satisfies Dictionary<typeof source>
