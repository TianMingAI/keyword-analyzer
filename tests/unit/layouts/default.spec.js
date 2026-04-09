/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import DefaultLayout from '~/layouts/default.vue'

describe('layouts/default', () => {
  it('links to the open-source repository from the header', () => {
    const wrapper = shallowMount(DefaultLayout, {
      stubs: {
        Nuxt: true
      }
    })

    const githubLink = wrapper.find('[data-test="github-repo-link"]')

    expect(githubLink.exists()).toBe(true)
    expect(githubLink.attributes('href')).toBe('https://github.com/TianMingAI/keyword-analyzer')
    expect(githubLink.attributes('target')).toBe('_blank')
    expect(githubLink.attributes('rel')).toBe('noopener noreferrer')
    expect(githubLink.text()).toContain('GitHub')
  })
})
