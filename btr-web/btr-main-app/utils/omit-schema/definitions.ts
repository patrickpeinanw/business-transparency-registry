import { z, type RefinementCtx } from 'zod'
import { CompletingIndividualTypeE } from '~/enums/omit/completing-individual-type-e'
import { InfoToOmitE } from '~/enums/omit/info-to-omit-e'
import { IndividualsAtRiskE } from '~/enums/omit/individuals-at-risk-e'
import { validateNameSuperRefineOmitForm } from '~/utils/validation'

// I'm using translate instead of message as it doesn't work with message
const emailSchema = z.string().superRefine((email: string, ctx: RefinementCtx): never => {
  // email
  if (!email || email.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      translate: 'errors.validation.email.empty'
    })
    return z.NEVER
  }
  if (!validateEmailRfc6532Regex(email)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      translate: 'errors.validation.email.invalid'
    })
  }
  return z.NEVER
})

const nameSchema = z.string().superRefine(validateNameSuperRefineOmitForm)

const certifySchema = z.boolean().superRefine((certify: boolean, ctx: RefinementCtx): never => {
  if (!certify) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      translate: 'errors.validation.certify'
    })
  }
  return z.NEVER
})

const birthdateSchema = z.string().superRefine((bday: string, ctx: RefinementCtx): never => {
  if (!bday || bday.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      translate: 'errors.validation.birthDate.required'
    })
    return z.NEVER
  }

  const result = bday.replace(/\d{4}-\d{2}-\d{2}/i, '')
  if (result.length !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      translate: 'errors.validation.birthDate.invalid'
    })
    return z.NEVER
  }

  if (Number.isNaN(new Date(bday).getFullYear())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      translate: 'errors.validation.birthDate.incorrect'
    })
    return z.NEVER
  }
  return z.NEVER
})

const businessIdSchema = z.string().superRefine((id: string, ctx: RefinementCtx): never => {
  if (!id || id.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      translate: 'errors.validation.businessId.required'
    })
  }
  return z.NEVER
})

export const CompletingPartySchema = z.object({
  email: emailSchema,
  name: nameSchema,
  certify: certifySchema,
  invididualType: z.nativeEnum(CompletingIndividualTypeE)
})

export const OmitObscureSchema = z.object({
  infoToOmit: z.array(z.nativeEnum(InfoToOmitE)).nonempty({
    message: 'Information to Omit is required'
  }),
  individualsAtRisk: z.array(z.nativeEnum(IndividualsAtRiskE)).nonempty({
    message: 'Individual at risk is required'
  }),
  reasons: z.string().min(1, {
    message: 'Reasons is required'
  })
})

export const SiBizInfoSchema = z.object({
  name: nameSchema,
  birthdate: birthdateSchema,
  email: emailSchema,
  businessId: businessIdSchema
})

export const OmitSchema = z.object({
  uuid: z.string().min(1),
  completingParty: CompletingPartySchema,
  omitObscure: OmitObscureSchema,
  siBizInfo: SiBizInfoSchema
})

export type OmitSchemaType = z.infer<typeof OmitSchema>
export type CompletingPartySchemaType = z.infer<typeof CompletingPartySchema>
export type OmitObscureSchemaType = z.infer<typeof OmitObscureSchema>
export type SiBizInfoSchemaType = z.infer<typeof SiBizInfoSchema>

export const UseTranslateErrorMap: z.ZodErrorMap = (issue: z.ZodIssueOptionalMessage, ctx: z.ErrorMapCtx) => {
  const t = useNuxtApp().$i18n.t
  if (issue.translate) {
    return { message: t(issue.translate) }
  }
  return { message: ctx.defaultError }
}
