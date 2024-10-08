<template>
  <div data-cy="addIndividualPerson" class="w-full">
    <UForm
      ref="addIndividualForm"
      :schema="formSchema"
      :state="inputFormSi"
      class="w-full"
      @change="formChange"
    >
      <!--  section: your information  -->
      <BcrosSection
        v-if="!editMode"
        :section-title="$t('sectionTitles.isYourOwnInformation')"
        data-cy="isYourOwnInformation-section"
        rounded-bot
        rounded-top
      >
        <div class="flex-col w-full">
          <p class="pb-5">
            {{ $t('texts.isYourOwnInformation') }}
          </p>
          <UFormGroup name="workaroundForTriggeringValidationOnEntireForm">
            <UCheckbox
              v-model="inputFormSi.name.isYourOwnInformation"
              :label="$t('labels.isYourOwnInformation')"
              data-cy="isYourOwnInformation-checkbox"
              @change="setIsYourOwnInformation($event)"
            />
          </UFormGroup>
        </div>
      </BcrosSection>

      <BcrosSectionDivider v-if="!editMode" />

      <!--  section: individuals full name  -->
      <BcrosSection
        :show-section-has-errors="hasErrors(['name.'])"
        :section-title="$t('sectionTitles.individualsFullName')"
        rounded-bot
        :rounded-top="!editMode"
        :border="editMode"
        no-top-border
      >
        <div class="flex-col w-full">
          <BcrosInputsNameField
            id="individual-person-full-name"
            v-model="inputFormSi.name.fullName"
            name="name.fullName"
            :placeholder="$t('placeholders.fullName')"
            data-cy="testFullName"
            :is-disabled="inputFormSi.name.isYourOwnInformation"
            @change="setNewOrChanged([InputFieldsE.FULL_NAME])"
          />
          <div class="pt-5" />
          <UFormGroup name="doNothing">
            <UCheckbox
              v-model="inputFormSi.name.isUsePreferredName"
              :label="$t('texts.preferredName.checkbox')"
              data-cy="usePreferredName"
              @click="inputFormSi.name.preferredName = ''"
            />
          </UFormGroup>
          <div v-if="inputFormSi.name.isUsePreferredName" class="pt-3 w-full">
            <p>
              {{ $t('texts.preferredName.note') }}
            </p>
            <div class="pt-5">
              <BcrosInputsNameField
                id="individual-person-preferred-name"
                v-model="inputFormSi.name.preferredName"
                name="name.preferredName"
                :placeholder="$t('placeholders.preferredName')"
                data-cy="testPreferredName"
                :help="$t('texts.preferredName.hint')"
                @change="setNewOrChanged([InputFieldsE.PREFERRED_NAME])"
              />
            </div>
          </div>
        </div>
      </BcrosSection>

      <BcrosSectionDivider />

      <!--  section-header: type of interest or control of shares/votes-->
      <BcrosSection
        header-icon-name="i-mdi-plus-circle-multiple-outline"
        :header-title="$t('sectionHeaders.controlOf')"
        :header-text="$t('sectionIntroText.controlOf')"
        rounded-top
        :border="editMode"
        no-bot-border
      />

      <!--  section: type of interest or control of shares -->
      <BcrosSection
        :show-section-has-errors="false"
        :section-title="$t('sectionTitles.controlOfShares')"
        :border="editMode"
        no-top-border
      >
        <IndividualPersonControlOfSharesVotes
          v-model="inputFormSi.controlOfShares"
          name="controlOfShares"
          @change="setNewOrChanged([InputFieldsE.CONTROL_OF_SHARES])"
        />
      </BcrosSection>

      <!--  section: type of interest or control of votes -->
      <BcrosSection
        :show-section-has-errors="false"
        :section-title="$t('sectionTitles.controlOfVotes')"
        :border="editMode"
        no-top-border
      >
        <IndividualPersonControlOfSharesVotes
          v-model="inputFormSi.controlOfVotes"
          name="controlOfVotes"
          @change="setNewOrChanged([InputFieldsE.CONTROL_OF_VOTES])"
        />
      </BcrosSection>

      <!--  section: control of majority of directors  -->
      <BcrosSection
        :show-section-has-errors="false"
        :section-title="$t('sectionTitles.controlOfMajorityOfDirectors')"
        :border="editMode"
        no-top-border
      >
        <IndividualPersonControlOfDirectors
          v-model="inputFormSi.controlOfDirectors"
          name="controlOfDirectors"
          @change="setNewOrChanged([InputFieldsE.CONTROL_OF_DIRECTORS])"
        />
      </BcrosSection>

      <!--  section: other reasons  -->
      <BcrosSection
        :show-section-has-errors="hasErrors(['otherReasons'])"
        :section-title="$t('sectionTitles.otherReasons')"
        rounded-bot
        :border="editMode"
        no-top-border
      >
        <div class="w-full">
          <IndividualPersonControlOtherReasons
            id="otherReasons"
            v-model="inputFormSi.controlOther"
            name="otherReasons"
            data-cy="otherReasons"
            @change="setNewOrChanged([InputFieldsE.CONTROL_OTHER])"
          />
        </div>
      </BcrosSection>

      <BcrosSectionDivider />

      <!--  section-header: effective dates -->
      <BcrosSection
        header-icon-name="i-mdi-calendar"
        :header-title="$t('sectionHeaders.effectiveDates')"
        :header-text="$t('sectionIntroText.effectiveDates')"
        rounded-top
        :border="editMode"
        no-bot-border
      />

      <!--  section: effective dates -->
      <BcrosSection
        :show-section-has-errors="hasErrors(['effectiveDates'])"
        :section-title="$t('sectionTitles.effectiveDates')"
        rounded-bot
        :border="editMode"
        no-top-border
      >
        <div class="w-full">
          <IndividualPersonEffectiveDates
            :initial-date-groups="inputFormSi.effectiveDates"
            name="effectiveDates"
            data-cy="effectiveDates"
            :is-editing="isEditing"
            @dates-updated="inputFormSi.effectiveDates = $event;
                            setNewOrChanged([InputFieldsE.EFFECTIVE_DATES])"
          />
        </div>
      </BcrosSection>

      <BcrosSectionDivider />
      <!--  section-header: individuals details -->
      <BcrosSection
        header-icon-name="i-mdi-user-circle"
        :header-title="$t('sectionHeaders.individualsDetails')"
        :header-text="$t('sectionIntroText.individualsDetails')"
        rounded-top
        :border="editMode"
        no-bot-border
      />
      <!--  section: email address  -->
      <BcrosSection
        :show-section-has-errors="hasErrors(['email'])"
        :section-title="$t('sectionTitles.emailAddress')"
        :border="editMode"
        no-top-border
      >
        <div class="flex-col w-full">
          <BcrosInputsEmailField
            id="individual-person-email"
            v-model="inputFormSi.email"
            name="email"
            :placeholder="$t('labels.emailAddress')"
            data-cy="testEmail"
            @focus="clearEmailFieldOnEdit"
            @change="setNewOrChanged([InputFieldsE.EMAIL])"
            @blur="revertUnchangedEmailField"
          />
        </div>
      </BcrosSection>

      <!--  section: individual details address  -->
      <BcrosSection
        :show-section-has-errors="hasErrors(['address.'])"
        :section-title="$t('labels.lastKnownAddress')"
        :border="editMode"
        no-top-border
      >
        <div class="flex-col w-full">
          <BcrosInputsAddress
            id="addNewPersonLastKnownAddress"
            v-model="inputFormSi.address"
            name="address"
            :is-editing="isEditing"
            @country-change="countryChange"
            @postal-code-change="setNewOrChanged([InputFieldsE.ADDRESS_POSTAL_CODE])"
            @line1-change="setNewOrChanged([InputFieldsE.ADDRESS_LINE1])"
            @line2-change="setNewOrChanged([InputFieldsE.ADDRESS_LINE2])"
            @city-change="setNewOrChanged([InputFieldsE.ADDRESS_CITY])"
            @region-change="setNewOrChanged([InputFieldsE.ADDRESS_REGION])"
            @location-description-change="setNewOrChanged([InputFieldsE.ADDRESS_LOCATION_DESCRIPTION])"
          />
        </div>
      </BcrosSection>
      <BcrosSection
        :show-section-has-errors="hasErrors(['phoneNumber'])"
        :section-title="$t('sectionTitles.phoneNumber')"
        :border="editMode"
        no-top-border
      >
        <BcrosInputsPhoneNumber
          v-model="inputFormSi.phoneNumber"
          name="phoneNumber"
          data-cy="phoneNumberInput"
          :is-editing="isEditing"
          @change="setNewOrChanged([InputFieldsE.PHONE_NUMBER])"
        />
      </BcrosSection>
      <BcrosSection
        :show-section-has-errors="hasErrors([InputFieldsE.BIRTH_DATE])"
        :section-title="$t('labels.birthdate')"
        :border="editMode"
        no-top-border
      >
        <div class="flex-col w-full">
          <BcrosInputsDateSelect
            id="addNewPersonBirthdate"
            name="birthDate"
            :initial-date="!!inputFormSi.birthDate ? dateStringToDate(inputFormSi.birthDate) || undefined : undefined"
            :max-date="new Date()"
            :placeholder="$t('placeholders.dateSelect.birthdate')"
            :is-editing="isEditing"
            @selection="
              inputFormSi.birthDate = dateToString($event, 'YYYY-MM-DD');
              setNewOrChanged([InputFieldsE.BIRTH_DATE])"
            @change="setNewOrChanged([InputFieldsE.BIRTH_DATE])"
          />
        </div>
      </BcrosSection>

      <!--  section: citizenship or PR  -->
      <BcrosSection
        :show-section-has-errors="hasErrors(['citizenships'])"
        :section-title="$t('sectionTitles.citizenshipOrPR')"
        :border="editMode"
        no-top-border
      >
        <div class="flex flex-col w-full">
          <IndividualPersonCitizenship
            v-model="inputFormSi.citizenships"
            name="citizenships"
            @citizenship-updated="setNewOrChanged([InputFieldsE.CITIZENSHIPS])"
          />
        </div>
      </BcrosSection>

      <!--  section: tax details  -->
      <BcrosSection
        :show-section-has-errors="hasErrors(['tax.'])"
        :section-title="$t('sectionTitles.taxDetails')"
        :border="editMode"
        no-top-border
      >
        <div class="w-full flex flex-col">
          <p>
            {{ $t('texts.taxNumber') }}
          </p>
          <IndividualPersonTaxInfoTaxNumber
            id="addNewPersonTaxNumber"
            v-model:hasTaxNumber="inputFormSi.tax.hasTaxNumber"
            v-model:taxNumber="inputFormSi.tax.taxNumber"
            name="tax"
            variant="bcGov"
            :is-editing="isEditing"
            data-cy="testTaxNumber"
            @clear-errors="clearErrors($event)"
            @tax-number-changed="setNewOrChanged([InputFieldsE.TAX, InputFieldsE.TAX_NUMBER])"
            @has-tax-number-changed="setNewOrChanged([InputFieldsE.TAX])"
          />
        </div>
      </BcrosSection>
      <bcrosSection
        :show-section-has-errors="hasErrors(['isTaxResident'])"
        :section-title="$t('labels.taxResidency')"
        :border="editMode"
        no-top-border
      >
        <div class="flex flex-col w-full">
          <p>
            {{ $t('texts.taxResidency') }}
          </p>
          <IndividualPersonTaxInfoTaxResidency
            v-model="inputFormSi.isTaxResident"
            name="isTaxResident"
            variant="bcGov"
            data-cy="testTaxResidency"
            @change="setNewOrChanged([InputFieldsE.IS_TAX_RESIDENT])"
          />
        </div>
      </bcrosSection>

      <BcrosSection
        :show-section-has-errors="hasErrors(['determinationOfIncapacity'])"
        :section-title="$t('sectionTitles.determinationOfIncapacity')"
        rounded-bot
        :border="editMode"
        no-top-border
      >
        <DeterminationOfIncapacity
          v-model="inputFormSi.determinationOfIncapacity"
          name="determinationOfIncapacity"
          @change="setNewOrChanged([InputFieldsE.DETERMINATION_OF_INCAPACITY])"
        />
      </BcrosSection>

      <BcrosSectionDivider />

      <!--  section: unable to obtain or confirm  -->
      <BcrosSection
        :show-section-has-errors="hasErrors(['missingInfo'])"
        :section-title="$t('sectionTitles.unableToObtainOrConfirmInformation')"
        rounded-top
        rounded-bot
        :border="editMode"
      >
        <div class="w-full">
          <IndividualPersonControlUnableToObtainOrConfirmInformation
            v-model="inputFormSi.missingInfoReason"
            name="missingInfoReason"
            :missing-info="inputFormSi.couldNotProvideMissingInfo"
            @update:missing-info="inputFormSi.couldNotProvideMissingInfo = $event"
            @update:model-value="setNewOrChanged([InputFieldsE.MISSING_INFO_REASON])"
          />
        </div>
      </BcrosSection>
    </UForm>

    <div class="grid mt-6 w-full">
      <div class="flex justify-between">
        <UButton
          class="px-10 py-3 mr-5"
          :label="t('buttons.remove')"
          color="red"
          variant="outline"
          data-cy="edit-si-remove-btn"
          :disabled="!isEditing"
          @click="$emit('remove')"
        />
        <div class="flex">
          <UButton
            class="px-10 py-3"
            :label="t('buttons.cancel')"
            color="primary"
            variant="outline"
            data-cy="new-si-cancel-btn"
            @click="$emit('cancel')"
          />
          <UButton
            class="ml-5 px-10 py-3"
            :label="t('buttons.done')"
            color="primary"
            variant="solid"
            data-cy="new-si-done-btn"
            @click="handleDoneButtonClick()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RefinementCtx, z } from 'zod'
import type { FormError } from '#ui/types'
import { BtrCountryI } from '../../../../btr-common-components/interfaces/btr-address-i'
import { validateEmailRfc6532Regex } from '../../../../btr-common-components/utils'
import {
  validateControlSelectionForSharesAndVotes,
  validateFullNameSuperRefine,
  validateTaxNumberInfo
} from '~/utils/validation'
import {
  AddressSchema,
  SiControlOfDirectorsSchema, CountrySchema,
  SiControlOfSchema,
  SiNameSchema,
  SiSchema, SiSchemaType,
  TaxSchema
} from '~/utils/si-schema/definitions'
import { getDefaultInputFormSi } from '~/utils/si-schema/defaults'
import { CustomSiSchemaErrorMap } from '~/utils/si-schema/errorMessagesMap'
import DeterminationOfIncapacity from '~/components/individual-person/DeterminationOfIncapacity.vue'

const emits = defineEmits<{
  add: [value: SiSchemaType],
  cancel: [],
  update: [value: { index: number | undefined, updatedSI: SiSchemaType }],
  remove: []
}>()

const props = defineProps<{
  index?: number,
  setSignificantIndividual?: SiSchemaType,
  startDate?: string,
  editMode?: boolean
}>()

const t = useNuxtApp().$i18n.t
const bcrosAccount = useBcrosAccount()

const isEditing = ref(false)

const emailFieldUuid = getRandomUuid()
const clearEmailFieldOnEdit = () => {
  if (isEditing) {
    setFieldOriginalValue(emailFieldUuid, inputFormSi.email)
    inputFormSi.email = ''
  }
}
const revertUnchangedEmailField = () => {
  const originalValue = getFieldOriginalValue(emailFieldUuid)
  if (isEditing && !hasFieldChanged(inputFormSi, InputFieldsE.EMAIL) && originalValue) {
    inputFormSi.email = originalValue
  }
}

// extend existing schema with
const SiControlOfExtended = SiControlOfSchema.superRefine(validateControlSelectionForSharesAndVotes)
const SiNameExtended = SiNameSchema
  .extend({ preferredName: getPreferredNameValidator() })
  .superRefine(validateFullNameSuperRefine)

const AddressSchemaExtended = AddressSchema.extend({
  country: CountrySchema
    .optional()
    .refine((val: BtrCountryI | undefined) => {
      return val && val.name !== ''
    }, t('errors.validation.address.country'))
})

const AddressSchemaExtendedEdit = AddressSchemaExtended.extend({
  line1: z.string().optional(),
  postalCode: z.string().optional(),
  locationDescription: z.string().optional()
})

z.setErrorMap(CustomSiSchemaErrorMap)

const SiSchemaExtended = SiSchema.extend({
  couldNotProvideMissingInfo: z.literal(false),
  name: SiNameExtended,
  controlOfShares: SiControlOfExtended,
  controlOfVotes: SiControlOfExtended,
  controlOfDirectors:
    SiControlOfDirectorsSchema.refine(validateControlOfDirectors, getMissingControlOfDirectorsError()),
  email: getEmailValidator(),
  address: AddressSchemaExtended,
  tax: TaxSchema.superRefine(validateTaxNumberInfo),
  isTaxResident: z.boolean()
})

let formSchema: any = z.discriminatedUnion('couldNotProvideMissingInfo', [
  z.object({
    couldNotProvideMissingInfo: z.literal(true),
    missingInfoReason: z.string().transform(s => s.trim()).pipe(z.string().min(1)),
    name: SiNameSchema,

    ui: z.object({
      newOrUpdatedFields: z.array(z.string())
    })

  }),
  SiSchemaExtended
])

if (props.editMode) {
  const SiSchemaExtendedEdit = SiSchemaExtended.extend({
    birthDate: z.string().optional(),
    name: SiNameExtended,
    address: AddressSchemaExtendedEdit,
    tax: TaxSchema,
    email: z.string().optional()
  })

  formSchema = z.discriminatedUnion('couldNotProvideMissingInfo', [
    z.object({
      couldNotProvideMissingInfo: z.literal(true),
      missingInfoReason: z.string().transform(s => s.trim()).pipe(z.string().min(1)),
      name: SiNameExtended,

      ui: z.object({
        newOrUpdatedFields: z.array(z.string())
      })
    }),
    SiSchemaExtendedEdit
  ]).superRefine((schema: SiSchemaType, ctx: RefinementCtx): never => {
    // this superRefine is to work out through the redacted data fields and validate them only on change

    // birthdate check
    if (schema.ui.newOrUpdatedFields.includes(InputFieldsE.BIRTH_DATE)) {
      if (!schema.birthDate || schema.birthDate.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['birthDate'],
          message: t('errors.validation.birthDate.required')
        })
      }
    }
    // phone check // its already optional nothing to do here

    // street address
    if (schema.ui.newOrUpdatedFields.includes(InputFieldsE.ADDRESS_LINE1)) {
      if (!schema.address || !schema.address.line1 || schema.address.line1.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address', 'line1'],
          message: t('errors.validation.address.line1')
        })
      }
    }
    // postal code
    if (schema.ui.newOrUpdatedFields.includes(InputFieldsE.ADDRESS_POSTAL_CODE)) {
      if (!schema.address || !schema.address.postalCode || schema.address.postalCode.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address', 'postalCode'],
          message: t('errors.validation.address.postalCode')
        })
      }
    }
    // location description // its already optional nothing to do here

    // SIN
    if (schema.ui.newOrUpdatedFields.includes(InputFieldsE.TAX_NUMBER)) {
      // add tax to path, so that subsequent tax validator creates erroro messages with path
      ctx.path.push('tax')
      validateTaxNumberInfo(schema.tax, ctx)
      // remove tax from path so it does not add it in next ctx errors
      const taxPath = ctx.path.findIndex(v => v === 'tax')
      if (taxPath !== -1) {
        ctx.path.splice(taxPath, 1)
      }
    }

    // email
    if (schema.ui.newOrUpdatedFields.includes(InputFieldsE.EMAIL)) {
      if (!schema.email || schema.email.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: t('errors.validation.email.empty')
        })
      }
      if (!validateEmailRfc6532Regex(schema.email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: t('errors.validation.email.invalid')
        })
      }
    }
    return z.NEVER
  })
}
// extend schema end

const addIndividualForm = ref()

const formChange = async () => {
  await addBtrPayFees()
}

const countryChange = () => {
  if (
    undefined === inputFormSi.phoneNumber.countryCallingCode &&
    undefined === inputFormSi.phoneNumber.countryCode2letterIso &&
    undefined === inputFormSi.phoneNumber.number &&
    undefined !== inputFormSi.address?.country?.alpha_2
  ) {
    inputFormSi.phoneNumber.countryCode2letterIso = inputFormSi.address.country.alpha_2
  }
  setNewOrChanged([InputFieldsE.ADDRESS_COUNTRY])
}

function hasErrors (sectionErrorPaths: string[]): boolean {
  if (!addIndividualForm.value?.errors) {
    return false
  }
  for (const errorPath of sectionErrorPaths) {
    const errors = addIndividualForm.value.errors
    if (!errors || errors.length === 0) {
      return false
    }

    const hasErrors = errors.filter(errObj => errObj.path.includes(errorPath)).length > 0
    if (hasErrors) {
      return true
    }
  }

  return false
}

const clearErrors = (errorPath: string) => {
  addIndividualForm.value.clear(errorPath)
}

function handleDoneButtonClick () {
  const res = formSchema.safeParse(inputFormSi)
  let errors: FormError[] = []
  addIndividualForm.value.clear()
  if (!res.success) {
    errors = res.error.issues.map(issue => ({ message: issue.message, path: issue.path.join('.') }))
    console.error(errors)
    addIndividualForm.value.setErrors(errors)
  } else if (isEditing.value) {
    emits('update', { index: props.index, updatedSI: inputFormSi })
  } else {
    emits('add', inputFormSi)
  }
}

const setIsYourOwnInformation = (event: any) => {
  if (event.target.checked) {
    inputFormSi.name.fullName = bcrosAccount.userFullName
  } else {
    inputFormSi.name.fullName = ''
  }
}

const inputFormSi: SiSchemaType = reactive(getDefaultInputFormSi())

const setNewOrChanged = (fieldNames: Array<string>) => {
  inputFormSi.ui.newOrUpdatedFields ??= []
  for (let i = 0; i < fieldNames.length; i++) {
    if (!inputFormSi.ui.newOrUpdatedFields.includes(fieldNames[i])) {
      inputFormSi.ui.newOrUpdatedFields.push(fieldNames[i])
    }
  }
}

if (props.setSignificantIndividual) {
  isEditing.value = (props.index !== undefined)
  Object.assign(inputFormSi, props.setSignificantIndividual)
}

watch(inputFormSi.controlOfShares, (control) => {
  if (!control.inConcertControl) {
    inputFormSi.sharesInConcert = []
  }
  if (!control.actingJointly) {
    inputFormSi.sharesActingJointly = []
  }
})

watch(inputFormSi.controlOfVotes, (control) => {
  if (!control.inConcertControl) {
    inputFormSi.votesInConcert = []
  }
  if (!control.actingJointly) {
    inputFormSi.votesActingJointly = []
  }
})

watch(inputFormSi.controlOfDirectors, (control) => {
  if (!control.inConcertControl) {
    inputFormSi.directorsInConcert = []
  }
  if (!control.actingJointly) {
    inputFormSi.directorsActingJointly = []
  }
})
</script>
