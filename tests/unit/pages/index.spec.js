/* eslint-env jest */
import { mount } from '@vue/test-utils'
import * as XLSX from 'xlsx'
import BaseTable from '~/components/BaseTable.vue'
import SavedKeywordsPanel from '~/components/SavedKeywordsPanel.vue'
import IndexPage from '~/pages/index.vue'
import { SAVED_KEYWORDS_STORAGE_KEY, SAVED_KEYWORD_STATUSES } from '~/utils/savedKeywords'

jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn()
  }
}))

describe('pages/index', () => {
  const originalFileReader = global.FileReader
  const readMock = XLSX.read
  const sheetToJsonMock = XLSX.utils.sheet_to_json
  const savedAlpha = {
    keyword: 'alpha',
    volume: 100,
    kd: 10,
    cpc: 2,
    roi: 20,
    url: 'https://example.com/alpha',
    status: SAVED_KEYWORD_STATUSES.NOT_STARTED,
    savedAt: '2026-04-09T00:00:00.000Z',
    updatedAt: '2026-04-09T00:00:00.000Z'
  }

  const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

  const makeFileReaderMock = () => {
    return class FileReaderMock {
      constructor() {
        this.onload = null
        this.onerror = null
        this.error = null
      }

      readAsArrayBuffer(file) {
        if (file.shouldFail) {
          this.error = new Error(file.errorMessage || 'Unable to import file.')
          if (this.onerror) {
            this.onerror()
          }
          return
        }

        if (this.onload) {
          this.onload({ target: { result: file.buffer } })
        }
      }
    }
  }

  const uploadFile = async (wrapper, file) => {
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [file]
    })

    await input.trigger('change')
    await flushPromises()
    await wrapper.vm.$nextTick()
  }

  beforeEach(() => {
    localStorage.clear()
    global.FileReader = makeFileReaderMock()
    readMock.mockReset()
    sheetToJsonMock.mockReset()
    readMock.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {}
      }
    })
  })

  afterEach(() => {
    global.FileReader = originalFileReader
  })

  it('clears stale import errors and replaces the imported rows on a later valid upload', async () => {
    const uploadScenarios = [
      {
        headers: ['Keyword', 'Volume', 'Keyword Difficulty', 'CPC (USD)'],
        rows: [
          {
            Keyword: 'alpha',
            Volume: '100',
            'Keyword Difficulty': '10',
            'CPC (USD)': '2'
          },
          {
            Keyword: 'beta',
            Volume: '200',
            'Keyword Difficulty': '20',
            'CPC (USD)': '3'
          }
        ]
      },
      {
        headers: ['Keyword', 'Volume'],
        rows: []
      },
      {
        headers: ['Keyword', 'Volume', 'Keyword Difficulty', 'CPC (USD)'],
        rows: [
          {
            Keyword: 'gamma',
            Volume: '300',
            'Keyword Difficulty': '30',
            'CPC (USD)': '4'
          }
        ]
      }
    ]

    let uploadIndex = -1

    sheetToJsonMock.mockImplementation((sheet, options = {}) => {
      if (options.header === 1) {
        uploadIndex += 1
        return [uploadScenarios[uploadIndex].headers]
      }

      return uploadScenarios[uploadIndex].rows
    })

    const wrapper = mount(IndexPage)

    expect(wrapper.text()).toContain('Analyze Semrush')
    expect(wrapper.text()).toContain('Keywords Locally')
    expect(wrapper.find('[data-test="import-dropzone"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="workbench-preview"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="workbench-bar"]').exists()).toBe(false)
    expect(wrapper.findComponent(BaseTable).exists()).toBe(false)

    await uploadFile(wrapper, {
      buffer: new ArrayBuffer(8)
    })

    expect(wrapper.findComponent(BaseTable).props('rows')).toHaveLength(2)
    expect(wrapper.find('[data-test="import-dropzone"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="workbench-preview"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="workbench-bar"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="workbench-bar"]').text()).toContain('2 imported')
    expect(wrapper.text()).not.toContain('Analyze Semrush')
    expect(wrapper.text()).not.toContain('Unable to import file')

    await uploadFile(wrapper, {
      buffer: new ArrayBuffer(8)
    })

    expect(wrapper.find('[role="alert"]').text()).toContain('Missing required columns')
    expect(wrapper.find('[data-test="import-dropzone"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="workbench-preview"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="workbench-bar"]').exists()).toBe(false)
    expect(wrapper.findComponent(BaseTable).exists()).toBe(false)

    await uploadFile(wrapper, {
      buffer: new ArrayBuffer(8)
    })

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findComponent(BaseTable).props('rows')).toHaveLength(1)
    expect(wrapper.text()).toContain('gamma')
    expect(wrapper.find('[data-test="workbench-bar"]').text()).toContain('1 imported')
    expect(wrapper.text()).not.toContain('alpha')
    expect(wrapper.text()).not.toContain('beta')
  })

  it('opens the scoring guide as a dialog instead of expanding inline content', async () => {
    const wrapper = mount(IndexPage)

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    await wrapper.setData({
      importedRows: [
        {
          keyword: 'alpha',
          volume: 100,
          kd: 10,
          cpc: 2,
          roi: 20,
          url: 'https://example.com/alpha'
        }
      ]
    })

    await wrapper.find('[data-test="scoring-guide-trigger"]').trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(wrapper.find('[role="dialog"]').text()).toContain('Opportunity Score')

    await wrapper.find('[data-test="scoring-guide-close"]').trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('loads saved keywords, persists updates, and keeps them independent from file imports', async () => {
    localStorage.setItem(SAVED_KEYWORDS_STORAGE_KEY, JSON.stringify([savedAlpha]))

    sheetToJsonMock.mockImplementation((sheet, options = {}) => {
      if (options.header === 1) {
        return [['Keyword', 'Volume', 'Keyword Difficulty', 'CPC (USD)']]
      }

      return [
        {
          Keyword: 'gamma',
          Volume: '300',
          'Keyword Difficulty': '30',
          'CPC (USD)': '4'
        }
      ]
    })

    const wrapper = mount(IndexPage)
    const baseTable = () => wrapper.findComponent(BaseTable)
    const savedPanel = () => wrapper.findComponent(SavedKeywordsPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.savedKeywords.map((keyword) => keyword.keyword)).toEqual(['alpha'])

    expect(baseTable().exists()).toBe(false)
    expect(wrapper.find('[data-test="saved-home-summary"]').exists()).toBe(true)
    expect(savedPanel().exists()).toBe(true)
    expect(wrapper.find('[data-test="saved-home-summary"]').text()).toContain('1 saved')
    expect(wrapper.find('[data-test="saved-home-summary"]').text()).toContain('alpha')
    expect(wrapper.find('[data-test="saved-home-summary"]').text()).toContain('Volume 100')
    expect(wrapper.find('[data-test="saved-home-summary"]').text()).toContain('KD 10')

    savedPanel().vm.$emit('mark-site-done', 'alpha')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.savedKeywords[0].status).toBe(SAVED_KEYWORD_STATUSES.SITE_DONE)

    savedPanel().vm.$emit('mark-not-started', 'alpha')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.savedKeywords[0].status).toBe(SAVED_KEYWORD_STATUSES.NOT_STARTED)

    await uploadFile(wrapper, {
      buffer: new ArrayBuffer(8)
    })

    expect(
      baseTable()
        .props('rows')
        .map((row) => row.keyword)
    ).toEqual(['gamma'])
    expect(
      baseTable()
        .props('savedKeywords')
        .map((keyword) => keyword.keyword)
    ).toEqual(['alpha'])

    baseTable().vm.$emit('save-keyword', {
      keyword: 'beta',
      volume: 200,
      kd: 20,
      cpc: 3,
      roi: 30,
      url: 'https://example.com/beta'
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.savedKeywords.map((keyword) => keyword.keyword)).toEqual(['beta', 'alpha'])
    expect(localStorage.getItem(SAVED_KEYWORDS_STORAGE_KEY)).toContain('"keyword":"beta"')

    savedPanel().vm.$emit('mark-site-done', 'beta')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.savedKeywords[0].status).toBe(SAVED_KEYWORD_STATUSES.SITE_DONE)

    savedPanel().vm.$emit('update-research', {
      keyword: 'beta',
      intitleResults: 50
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.savedKeywords[0].intitleResults).toBe(50)
    expect(localStorage.getItem(SAVED_KEYWORDS_STORAGE_KEY)).toContain('"intitleResults":50')

    expect(wrapper.vm.savedKeywords.map((keyword) => keyword.keyword)).toEqual(['beta', 'alpha'])

    savedPanel().vm.$emit('remove', 'beta')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.savedKeywords.map((keyword) => keyword.keyword)).toEqual(['alpha'])
    expect(localStorage.getItem(SAVED_KEYWORDS_STORAGE_KEY)).not.toContain('"keyword":"beta"')
  })

  it('shows a preview instead of a live workspace before an Excel file is imported', async () => {
    const wrapper = mount(IndexPage)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test="workbench-preview"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="saved-home-summary"]').exists()).toBe(false)
    expect(wrapper.findComponent(BaseTable).exists()).toBe(false)
    expect(wrapper.text()).toContain('Preview of your workspace')
    expect(wrapper.text()).toContain('score opportunities')
  })
})
