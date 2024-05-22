import { FilingActionE } from '~/enums/filing-action-e'
import { PercentageRangeE } from '~/enums/percentage-range-e'
import { SiSchemaType } from '~/utils/si-schema/definitions'

export const SI_EXAMPLE_DATE = '2001-01-01'

export const testSI: SiSchemaType = {
  name: {
    isYourOwnInformation: false,
    isUsePreferredName: true,
    fullName: 'Test Name',
    preferredName: 'Waffles Test'
  },
  address: {
    city: 'Victoria',
    country: { name: 'Canada', alpha_2: 'CA' },
    line1: '1234 test street',
    postalCode: 'V1A 2B3',
    region: 'BC',
    line2: '',
    locationDescription: ''
  },
  birthDate: '2000-03-19',
  citizenships: [{ name: 'Canada (Citizen)', alpha_2: 'CA' }],
  email: '1@1.com',
  tax: {
    hasTaxNumber: true,
    taxNumber: '000 000 000'
  },
  isTaxResident: true,
  controlOfShares: {
    controlName: 'controlOfShares',
    percentage: PercentageRangeE.MORE_THAN_50_TO_75,
    actingJointly: undefined,
    registeredOwner: true,
    beneficialOwner: false,
    indirectControl: false,
    inConcertControl: false
  },
  controlOfVotes: {
    controlName: 'controlOfVotes',
    percentage: PercentageRangeE.AT_LEAST_25_TO_50,

    registeredOwner: true,
    beneficialOwner: false,
    indirectControl: false,
    inConcertControl: false
  },
  controlOfDirectors: {
    directControl: true,
    indirectControl: true,
    significantInfluence: false,
    inConcertControl: false
  },
  controlOther: '',
  missingInfoReason: '',
  startDate: SI_EXAMPLE_DATE,
  couldNotProvideMissingInfo: false,
  endDate: '',
  uuid: undefined,
  ui: {
    action: FilingActionE.ADD
  }
}
