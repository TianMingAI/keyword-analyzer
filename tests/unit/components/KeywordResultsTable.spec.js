/* eslint-env jest */
import { mount } from '@vue/test-utils'
import KeywordResultsTable from '~/components/KeywordResultsTable.vue'

describe('components/KeywordResultsTable', () => {
  const rows = [
    {
      keyword: 'alpha',
      volume: 50,
      kd: 10,
      cpc: 1,
      roi: 5,
      url: 'https://example.com/alpha'
    },
    {
      keyword: 'beta',
      volume: 150,
      kd: 20,
      cpc: 2,
      roi: 15,
      url: 'https://example.com/beta'
    }
  ]

  it('renders result links with noopener protections', () => {
    const wrapper = mount(KeywordResultsTable, {
      propsData: {
        rows: [rows[0]]
      }
    })

    const link = wrapper.find('a')

    expect(link.text()).toBe('alpha')
    expect(link.attributes('href')).toBe('https://example.com/alpha')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('emits save and remove actions from the row action button', async () => {
    const wrapper = mount(KeywordResultsTable, {
      propsData: {
        rows,
        savedKeywordKeys: {
          alpha: true
        }
      }
    })

    const buttons = wrapper.findAll('[data-test="keyword-save-action"]')

    expect(buttons.at(0).text()).toBe('★')
    expect(buttons.at(0).attributes('aria-label')).toBe('Remove alpha from saved keywords')
    expect(buttons.at(1).text()).toBe('☆')
    expect(buttons.at(1).attributes('aria-label')).toBe('Save beta')

    await buttons.at(0).trigger('click')
    await buttons.at(1).trigger('click')

    expect(wrapper.emitted('remove-row')[0]).toEqual(['alpha'])
    expect(wrapper.emitted('save-row')[0]).toEqual([rows[1]])
  })

  it('renders an actionable empty state when filters remove every keyword', () => {
    const wrapper = mount(KeywordResultsTable)

    const emptyState = wrapper.find('[data-test="keyword-results-empty"]')

    expect(emptyState.exists()).toBe(true)
    expect(emptyState.text()).toContain('No matching keywords')
    expect(emptyState.text()).toContain('clear search')
  })
})
