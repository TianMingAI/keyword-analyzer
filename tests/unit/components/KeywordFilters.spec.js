/* eslint-env jest */
import { mount } from '@vue/test-utils'
import KeywordFilters from '~/components/KeywordFilters.vue'

describe('components/KeywordFilters', () => {
  const mountFilters = (propsData = {}) =>
    mount(KeywordFilters, {
      propsData: {
        kdRange: [],
        volumeRange: [],
        ...propsData
      }
    })

  it('emits preset and custom range updates through keyboard-reachable button controls', async () => {
    const wrapper = mountFilters()
    const findButtonByText = (text) =>
      wrapper
        .findAll('button[type="button"]')
        .wrappers.find((button) => button.text().includes(text))

    await findButtonByText('KD %').trigger('click')

    const kdPresetButton = wrapper
      .findAll('button[type="button"]')
      .wrappers.find((button) => button.text().includes('85-100%'))

    expect(kdPresetButton.exists()).toBe(true)

    await kdPresetButton.trigger('click')

    expect(wrapper.emitted('update:kd-range')).toEqual([[[85, 100]]])

    await findButtonByText('Volume').trigger('click')
    const volumeInputs = wrapper.findAll('input[type="number"]')

    await volumeInputs.at(0).setValue('15')
    await volumeInputs.at(1).setValue('150')

    const applyButton = wrapper
      .findAll('button[type="button"]')
      .wrappers.find((button) => button.text() === 'Apply')

    await applyButton.trigger('click')

    expect(wrapper.emitted('update:volume-range')).toEqual([[['15', '150']]])
  })

  it('renders clear actions as buttons and emits empty ranges when cleared', async () => {
    const wrapper = mountFilters({
      kdRange: [10, 20],
      volumeRange: [100, 200]
    })

    const clearButtons = wrapper.findAll('button[aria-label]')
    const kdClearButton = clearButtons.wrappers.find(
      (button) => button.attributes('aria-label') === 'Clear KD filter'
    )
    const volumeClearButton = clearButtons.wrappers.find(
      (button) => button.attributes('aria-label') === 'Clear volume filter'
    )

    expect(kdClearButton.exists()).toBe(true)
    expect(volumeClearButton.exists()).toBe(true)

    await kdClearButton.trigger('click')
    await volumeClearButton.trigger('click')

    expect(wrapper.emitted('update:kd-range')).toEqual([[[]]])
    expect(wrapper.emitted('update:volume-range')).toEqual([[[]]])
  })

  it('emits keyword search and saved filter changes', async () => {
    const wrapper = mountFilters()

    await wrapper.find('[data-test="keyword-search"]').setValue('paycheck')
    await wrapper.find('[data-test="saved-filter"]').setValue('saved')

    expect(wrapper.emitted('update:query')[0]).toEqual(['paycheck'])
    expect(wrapper.emitted('update:saved-filter')[0]).toEqual(['saved'])
  })
})
