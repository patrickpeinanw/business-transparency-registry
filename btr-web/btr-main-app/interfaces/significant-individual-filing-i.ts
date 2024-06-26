import { z } from 'zod'
import { SiSchemaType } from '~/utils/si-schema/definitions'

export const FilingSchemaBase = z.object({
  effectiveDate: z.string().min(1),
  noSignificantIndividualsExist: z.boolean().default(false),
  businessIdentifier: z.string(),
  folioNumber: z.string().optional(),
  significantIndividuals: z.object({}).array(), // SignificantIndividualI[]
  certified: z.literal<boolean>(true)
})

export type FilingSchemaType = z.infer<typeof FilingSchemaBase>

export interface SignificantIndividualFilingI extends FilingSchemaType {
  significantIndividuals: SiSchemaType[]
}
