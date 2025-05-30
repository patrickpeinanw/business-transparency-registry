import { expect, describe, test } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import { BcrosCustomFooter } from '#components'

describe('Tests for Footer.vue', () => {
  test('UTooltip component rendered', async () => {
    const wrapper = await mountSuspended(BcrosCustomFooter, { props: { appVersion: '1' } })
    const tooltip = wrapper.find('#footer-tooltip')
    expect(tooltip.exists()).toBeTruthy()
  })

  test('footer nav links rendered', async () => {
    const wrapper = await mountSuspended(BcrosCustomFooter, { props: { appVersion: '1' } })

    const expectedTexts = ['Home', 'Release Notes', 'Disclaimer', 'Privacy', 'Accessibility', 'Copyright']
    const expectedHrefs = [
      '/',
      'https://www.release-notes.bcregistry.gov.bc.ca',
      'https://www2.gov.bc.ca/gov/content/home/disclaimer',
      'https://www2.gov.bc.ca/gov/content/home/privacy',
      'https://www2.gov.bc.ca/gov/content/home/accessibility',
      'https://www2.gov.bc.ca/gov/content/home/copyright'
    ]

    const links = wrapper.findAll('a')
    expect(links.length).toBe(expectedTexts.length)

    links.forEach((link, index) => {
      expect(link.text()).toBe(expectedTexts[index])
      expect(link.attributes('href')).toBe(expectedHrefs[index])
    })
  })
})
