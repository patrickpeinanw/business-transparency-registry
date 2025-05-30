import 'cypress-axe'
import './ownerChangeFormHelper'
import { SubmissionTypeE } from '../../enums/submission-type-e'
import { PercentageRangeE } from '../../enums/percentage-range-e'
import { DeclarationTypeE } from '../../enums/declaration-type-e'

Cypress.Commands.add('interceptPostsBtrApi', () => {
  cy.fixture('plotsEntityExistingSiResponse').then((plotsEntityExistingSiResponse) => {
    cy.intercept(
      'GET',
      '/api/v1/plots/entity/**',
      plotsEntityExistingSiResponse)
  })
})

Cypress.Commands.add('interceptPostsBtrApiNoSis', () => {
  cy.fixture('plotsEntityExistingSiResponseNoSis').then((plotsEntityExistingSiResponseNoSis) => {
    cy.intercept(
      'GET',
      '/api/v1/plots/entity/**',
      plotsEntityExistingSiResponseNoSis)
  })
})

Cypress.Commands.add('interceptPostsBtrApiNoPreviousSubmissions', () => {
  cy.intercept(
    'GET',
    '/api/v1/plots/entity/**',
    { statusCode: 404, headers: { 'x-not-found': 'true' } })
})

Cypress.Commands.add('interceptPostsBtrApiEmpty', () => {
  cy.intercept(
    'GET',
    '/api/v1/plots/entity/**',
    {})
})

Cypress.Commands.add('interceptPayFeeApi', () => {
  cy.fixture('payFeeForBtrRegsigin').then((payFeesForBtrRegsigin) => {
    cy.intercept(
      'GET',
      '**/api/v1/fees/BTR/REGSIGIN',
      payFeesForBtrRegsigin)
  })
})

Cypress.Commands.add('interceptLearApiEmptyResponse', () => {
  cy.fixture('payFeeForBtrRegsigin').then(() => {
    cy.intercept(
      'GET',
      '**/api/v1/fees/BTR/REGSIGIN',
      {})
  })
})

Cypress.Commands.add('interceptAccounts', () => {
  cy.fixture('accounts').then((accounts) => {
    cy.intercept(
      'GET',
      '**/api/v1/users/testSub/settings',
      accounts)
  })
})

Cypress.Commands.add('interceptBusinessSlim', () => {
  cy.fixture('business').then((business) => {
    cy.intercept(
      'GET',
      `**/api/v2/businesses/${business.identifier}?slim=true`,
      { business })
  })
})

Cypress.Commands.add('interceptBusinessContact', () => {
  cy.fixture('business').then((business) => {
    cy.fixture('businessContact').then((contact) => {
      cy.intercept(
        'GET',
        `**/api/v1/entities/${business.identifier}`,
        contact)
    })
  })
})

Cypress.Commands.add('visitHomePageNoPreviousSiSubmissions', (businessIdentifier?: string) => {
  if (!businessIdentifier) {
    businessIdentifier = 'BC0871427'
  }
  cy.interceptPostsBtrApiNoPreviousSubmissions().as('noSubmissionsSi')
  cy.interceptPayFeeApi().as('payFeeApi')
  cy.interceptBusinessContact().as('businessContact')
  cy.interceptBusinessSlim().as('businessApiCall')
  cy.visit(`/${businessIdentifier}/beneficial-owner-change?submissionType=${SubmissionTypeE.INITIAL_FILING}`)
  cy.wait(['@noSubmissionsSi', '@businessApiCall', '@payFeeApi', '@businessContact'])
})

Cypress.Commands.add('visitHomePageNoFakeData', (businessIdentifier?: string, submissionType?: SubmissionTypeE) => {
  if (!businessIdentifier) {
    businessIdentifier = 'BC0871427'
  }
  if (!submissionType) {
    submissionType = SubmissionTypeE.INITIAL_FILING
  }
  cy.interceptPostsBtrApiNoSis().as('existingSIs')
  cy.interceptPayFeeApi().as('payFeeApi')
  cy.interceptBusinessContact().as('businessContact')
  cy.interceptBusinessSlim().as('businessApiCall')
  cy.visit(`/${businessIdentifier}/beneficial-owner-change?submissionType=` + submissionType)
  cy.wait(['@existingSIs', '@businessApiCall', '@payFeeApi', '@businessContact'])
})

Cypress.Commands.add('visitHomePageWithFakeData', (
  businessIdentifier?: string,
  submissionType?: SubmissionTypeE,
  submissionForYear?: string,
  noPreviousSubmisions?: boolean,
  noSI?: boolean
) => {
  if (!businessIdentifier) {
    businessIdentifier = 'BC0871427'
  }
  if (!submissionType) {
    submissionType = SubmissionTypeE.CHANGE_FILING
  }
  let url = `/${businessIdentifier}/beneficial-owner-change?submissionType=` + submissionType
  if (submissionForYear) {
    url += `&submissionForYear=${submissionForYear}`
  }

  if (noPreviousSubmisions) {
    cy.interceptPostsBtrApiNoPreviousSubmissions().as('getSI')
  } else if (noSI) {
    cy.interceptPostsBtrApiEmpty().as('getSI')
  } else {
    cy.interceptPostsBtrApi().as('getSI')
  }

  cy.interceptPayFeeApi().as('payFeeApi')
  cy.interceptBusinessContact().as('businessContact')
  cy.interceptBusinessSlim().as('businessApiCall')
  cy.visit(url)
  cy.wait(['@getSI', '@businessApiCall', '@payFeeApi', '@businessContact'])
})

Cypress.Commands.add('visitHomePageWithFakeDataAndAxeInject',
  (businessIdentifier?: string, submissionType?: SubmissionTypeE.CHANGE_FILING) => {
    cy.visitHomePageWithFakeData(businessIdentifier, submissionType)
    cy.injectAxe()
  })

Cypress.Commands.add('siSelectCitizenship', (citizenships: Array<BtrCountryI>) => {
  const isCitizen = citizenships.findIndex((country: BtrCountryI) => country.alpha_2 === 'CA') !== -1
  const isPr = citizenships.findIndex((country: BtrCountryI) => country.alpha_2 === 'CA_PR') !== -1
  if (isCitizen) {
    cy.get('input[data-cy="citizenships-ca-citizen-radio"]').check()
  } else if (isPr) {
    cy.get('input[data-cy="citizenships-ca-pr-radio"]').check()
  } else {
    cy.get('input[data-cy="citizenships-other-radio"]').check()
    cy.get('[data-cy="citizenships.otherComboboxButton"]').click().then(
      () => {
        for (const country of citizenships) {
          cy.get('[id^="headlessui-combobox-options"]').contains(`${country.name}`).first().click({ force: true })
        }
      }
    )
  }
})

Cypress.Commands.add('addSingleTestSi', (profile: any) => {
  cy.get('[data-cy=add-new-btn]').click()

  switch (profile.verificationStatus) {
    case DeclarationTypeE.self:
      cy.get('[data-cy="declaration-button-me"]').click()
      break
    case DeclarationTypeE.parent:
      cy.get('[data-cy="declaration-button-parent"]').click()
      cy.get('#individual-person-full-name').type(profile.fullName)
      break
    case DeclarationTypeE.lawyer:
      cy.get('[data-cy="declaration-button-lawyer"]').click()
      cy.get('#individual-person-full-name').type(profile.fullName)
      break
    case DeclarationTypeE.none:
      cy.get('[data-cy="declaration-button-none"]').click()
      cy.get('#individual-person-full-name').type(profile.fullName)
      break
    default:
      break
  }

  cy.get('[data-cy=usePreferredName').check()
  cy.get('#individual-person-preferred-name').type(profile.preferredName)
  cy.get('#individual-person-email').type(profile.email)

  const controls = ['controlOfShares', 'controlOfVotes', 'controlOfDirectors']
  const percentageIndexMap = {
    [PercentageRangeE.LESS_THAN_25]: 0,
    [PercentageRangeE.AT_LEAST_25_TO_50]: 1,
    [PercentageRangeE.MORE_THAN_50_TO_75]: 2,
    [PercentageRangeE.MORE_THAN_75]: 3
  }

  for (const control of controls) {
    if (!profile[control]) {
      continue
    }
    Object.keys(profile[control]).forEach((key) => {
      const val = profile[control][key]
      if (typeof val === 'boolean' && val) {
        cy.get(`[data-cy="${control}.${key}"]`).check()
      } else if (typeof val === 'string') {
        cy.get(`[data-cy="${control}.percentage.${percentageIndexMap[val as PercentageRangeE]}"]`).click()
      }
    })
  }

  cy.get('[data-cy="start-date-select"]').click().then(() => {
    cy.get('.bcros-date-picker__calendar__day.dp__today').parent().click()
  })
  cy.get('#addNewPersonBirthdate').trigger('click')
  cy.get('[data-cy=date-picker]').get('.bcros-date-picker__calendar__day.dp__today').trigger('click')
  cy.get('[data-cy="address-country"]').click()
  cy.get('[data-cy="address-country"]').get('li').contains(profile.address.country).click()
  cy.get('[data-cy="address-line1-autocomplete"]').type(profile.address.streetAddress)
  cy.get('[data-cy="address-city"]').type(profile.address.city)
  cy.get('[data-cy="address-region-select"]').click()
  cy.get('[data-cy="address-region-select"]').get('li').contains(profile.address.province[0]).click()
  cy.get('[data-cy="address-postal-code"]').type(profile.address.postalCode)
  cy.get('[data-cy="phoneNumber.number"]').type(profile.phoneNumber.number)

  cy.siSelectCitizenship(profile.citizenships)

  cy.get('[data-cy="tax-number-input"]').type(profile.taxNumber)
  cy.get('[data-cy="testTaxResidency"]').get('[type="radio"][value="true"]').check()
  cy.get('[data-cy=new-si-done-btn]').click()
})

Cypress.Commands.add('addTestIndividuals', (multiple = true) => {
  cy.fixture('individuals').then((testData) => {
    cy.addSingleTestSi(testData.profile1)
    if (multiple) {
      cy.addSingleTestSi(testData.profile2)
    }
  })
})

Cypress.Commands.add('testMissingInfoRow', (index: number, text: string) => {
  cy.get('[data-cy="individualsSummaryTable"]')
    .find('tbody')
    .find('[data-cy="summary-table-row-missing-info"]').eq(Number(index))
    .should('exist')
    .find('td').as('items')
    .should('have.length', 2)
  cy.get('@items').eq(0).should('have.text', 'Unable to Obtain or Confirm Information')
  cy.get('@items').eq(1).as('info').should('contain.text', 'Steps taken')
  if (text.length < 200) {
    cy.get('@info').find('[data-cy="missing-info-text"]').should('have.text', text)
    cy.get('@info').find('[data-cy=missing-info-toggle-btn]').should('not.exist')
  } else {
    cy.get('@info').find('[data-cy="missing-info-text"]').as('text')
      .should('have.text', text.substring(0, 200))
    cy.get('@info').find('[data-cy=missing-info-toggle-btn]')
      .should('exist').as('toggleBtn')
      .should('have.text', 'More')
    // expand text
    cy.get('@toggleBtn').click()
    cy.get('@text').should('have.text', text)
    cy.get('@toggleBtn').should('have.text', 'Less')
    // back to minimize
    cy.get('@toggleBtn').click()
    cy.get('@text').should('have.text', text.substring(0, 200))
    cy.get('@toggleBtn').should('have.text', 'More')
  }
})
