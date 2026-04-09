/* eslint-env jest */
import { mount } from '@vue/test-utils'
import SavedKeywordsPanel from '~/components/SavedKeywordsPanel.vue'
import { SAVED_KEYWORD_STATUSES } from '~/utils/savedKeywords'

describe('components/SavedKeywordsPanel', () => {
  const keywords = [
    {
      keyword: 'alpha',
      volume: 100,
      kd: 20,
      cpc: 2,
      roi: 10,
      url: 'https://example.com/alpha',
      status: SAVED_KEYWORD_STATUSES.NOT_STARTED,
      savedAt: '2026-04-09T00:00:00.000Z',
      updatedAt: '2026-04-09T00:00:00.000Z'
    },
    {
      keyword: 'beta',
      volume: 200,
      kd: 40,
      cpc: 4,
      roi: 20,
      url: 'https://example.com/beta',
      status: SAVED_KEYWORD_STATUSES.SITE_DONE,
      savedAt: '2026-04-09T00:00:00.000Z',
      updatedAt: '2026-04-10T00:00:00.000Z'
    }
  ]

  it('renders saved keywords with status controls and safe links', async () => {
    const wrapper = mount(SavedKeywordsPanel, {
      propsData: {
        keywords
      }
    })

    expect(wrapper.text()).toContain('Saved Pipeline')
    expect(wrapper.text()).toContain('alpha')
    expect(wrapper.text()).toContain('beta')
    expect(wrapper.text()).toContain('Not built')
    expect(wrapper.text()).toContain('Site built')

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('https://example.com/alpha')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')

    await wrapper.find('[data-test="mark-site-done-alpha"]').trigger('click')
    await wrapper.find('[data-test="mark-not-started-beta"]').trigger('click')
    await wrapper.find('[data-test="remove-alpha"]').trigger('click')

    expect(wrapper.emitted('mark-site-done')[0]).toEqual(['alpha'])
    expect(wrapper.emitted('mark-not-started')[0]).toEqual(['beta'])
    expect(wrapper.emitted('remove')[0]).toEqual(['alpha'])
  })

  it('groups saved keywords into not-started and site-done pipeline lanes', () => {
    const wrapper = mount(SavedKeywordsPanel, {
      propsData: {
        keywords
      }
    })

    const notStartedLane = wrapper.find('[data-test="saved-not-started"]')
    const doneLane = wrapper.find('[data-test="saved-site-done"]')

    expect(notStartedLane.text()).toContain('Not built')
    expect(notStartedLane.text()).toContain('alpha')
    expect(notStartedLane.text()).not.toContain('beta')
    expect(doneLane.text()).toContain('Site built')
    expect(doneLane.text()).toContain('beta')
    expect(doneLane.text()).not.toContain('alpha')
  })

  it('keeps the saved count badge on one line', () => {
    const wrapper = mount(SavedKeywordsPanel, {
      propsData: {
        keywords
      }
    })

    const badge = wrapper.find('[data-test="saved-count-badge"]')

    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('2 saved')
    expect(badge.classes()).toContain('shrink-0')
    expect(badge.classes()).toContain('whitespace-nowrap')
  })

  it('shows saved, researched, and site-done pipeline counts', () => {
    const wrapper = mount(SavedKeywordsPanel, {
      propsData: {
        keywords: [
          keywords[0],
          {
            ...keywords[1],
            intitleResults: 25
          }
        ]
      }
    })

    expect(wrapper.find('[data-test="saved-count"]').text()).toContain('2')
    expect(wrapper.find('[data-test="researched-count"]').text()).toContain('1')
    expect(wrapper.find('[data-test="site-done-count"]').text()).toContain('1')
  })

  it('lets users capture intitle research and shows KGR-style metrics on saved keywords', async () => {
    const wrapper = mount(SavedKeywordsPanel, {
      propsData: {
        keywords: [
          {
            ...keywords[0],
            volume: 200,
            kd: 40,
            intitleResults: 25
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Research')
    expect(wrapper.text()).toContain('KGR')
    expect(wrapper.text()).toContain('0.125')
    expect(wrapper.text()).toContain('0.175')
    expect(wrapper.text()).toContain('Low competition')

    const input = wrapper.find('[data-test="intitle-alpha"]')
    expect(input.element.value).toBe('25')

    await input.setValue('50')

    expect(wrapper.emitted('update-research')[0]).toEqual([
      {
        keyword: 'alpha',
        intitleResults: 50
      }
    ])
  })
})
