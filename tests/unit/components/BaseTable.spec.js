/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import BaseTable from '~/components/BaseTable.vue'

jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}))

jest.mock('xlsx', () => ({
  write: jest.fn(() => 'workbook-binary'),
  utils: {
    book_new: jest.fn(() => ({ sheets: [] })),
    json_to_sheet: jest.fn(() => ({})),
    book_append_sheet: jest.fn()
  }
}))

describe('components/BaseTable', () => {
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
      kd: 30,
      cpc: 2,
      roi: 10,
      url: 'https://example.com/beta'
    },
    {
      keyword: 'gamma',
      volume: 250,
      kd: 70,
      cpc: 3,
      roi: 20,
      url: 'https://example.com/gamma'
    }
  ]

  const mountTable = (propsData = {}) =>
    shallowMount(BaseTable, {
      propsData: {
        rows,
        ...propsData
      },
      stubs: {
        KeywordFilters: {
          name: 'KeywordFilters',
          props: ['kdRange', 'volumeRange', 'query', 'savedFilter'],
          template: '<div />'
        },
        KeywordResultsTable: {
          name: 'KeywordResultsTable',
          props: ['rows', 'savedKeywordKeys'],
          template: '<div />'
        }
      }
    })

  beforeEach(() => {
    saveAs.mockClear()
    XLSX.write.mockClear()
    XLSX.utils.book_new.mockClear()
    XLSX.utils.json_to_sheet.mockClear()
    XLSX.utils.book_append_sheet.mockClear()
  })

  it('recomputes rendered rows from props and active filters, and exports the filtered set', async () => {
    const wrapper = mountTable()
    const filterPanel = wrapper.findComponent({ name: 'KeywordFilters' })
    const resultsTable = () => wrapper.findComponent({ name: 'KeywordResultsTable' })

    expect(
      resultsTable()
        .props('rows')
        .map((row) => row.keyword)
    ).toEqual(['alpha', 'beta', 'gamma'])
    expect(wrapper.vm.filteredRows.map((row) => row.keyword)).toEqual(['alpha', 'beta', 'gamma'])

    filterPanel.vm.$emit('update:kd-range', [0, 40])
    await wrapper.vm.$nextTick()

    expect(
      resultsTable()
        .props('rows')
        .map((row) => row.keyword)
    ).toEqual(['alpha', 'beta'])
    expect(wrapper.vm.filteredRows.map((row) => row.keyword)).toEqual(['alpha', 'beta'])

    await wrapper.setProps({
      rows: [
        rows[0],
        {
          keyword: 'delta',
          volume: 180,
          kd: 35,
          cpc: 4,
          roi: 25,
          url: 'https://example.com/delta'
        }
      ]
    })

    expect(
      resultsTable()
        .props('rows')
        .map((row) => row.keyword)
    ).toEqual(['alpha', 'delta'])
    expect(wrapper.vm.filteredRows.map((row) => row.keyword)).toEqual(['alpha', 'delta'])

    filterPanel.vm.$emit('update:volume-range', [100, 200])
    await wrapper.vm.$nextTick()

    expect(
      resultsTable()
        .props('rows')
        .map((row) => row.keyword)
    ).toEqual(['delta'])
    expect(wrapper.vm.filteredRows.map((row) => row.keyword)).toEqual(['delta'])

    wrapper.vm.exportProcessedData()

    expect(XLSX.utils.book_new).toHaveBeenCalledTimes(1)
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
      {
        keyword: 'delta',
        volume: 180,
        kd: 35,
        cpc: 4,
        roi: 25,
        url: 'https://example.com/delta'
      }
    ])
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith({ sheets: [] }, {}, 'Processed Data')
    expect(XLSX.write).toHaveBeenCalledWith({ sheets: [] }, { bookType: 'xlsx', type: 'binary' })
    expect(saveAs).toHaveBeenCalledTimes(1)
    expect(saveAs.mock.calls[0][0]).toBeInstanceOf(Blob)
    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'processed-data.xlsx')
  })

  it('passes saved keyword keys to the results table and forwards save/remove events', async () => {
    const wrapper = mountTable({
      savedKeywords: [
        {
          keyword: 'Alpha',
          status: 'not_started'
        }
      ]
    })
    const resultsTable = wrapper.findComponent({ name: 'KeywordResultsTable' })

    expect(resultsTable.props('savedKeywordKeys')).toEqual({
      alpha: true
    })

    resultsTable.vm.$emit('save-row', rows[1])
    resultsTable.vm.$emit('remove-row', 'Alpha')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('save-keyword')[0]).toEqual([rows[1]])
    expect(wrapper.emitted('remove-keyword')[0]).toEqual(['Alpha'])
  })

  it('filters rows by search query and saved-only mode', async () => {
    const wrapper = mountTable({
      savedKeywords: [
        {
          keyword: 'beta',
          status: 'not_started'
        }
      ]
    })
    const filterPanel = wrapper.findComponent({ name: 'KeywordFilters' })
    const resultsTable = () => wrapper.findComponent({ name: 'KeywordResultsTable' })

    filterPanel.vm.$emit('update:query', 'ga')
    await wrapper.vm.$nextTick()

    expect(
      resultsTable()
        .props('rows')
        .map((row) => row.keyword)
    ).toEqual(['gamma'])

    filterPanel.vm.$emit('update:query', '')
    filterPanel.vm.$emit('update:saved-filter', 'saved')
    await wrapper.vm.$nextTick()

    expect(
      resultsTable()
        .props('rows')
        .map((row) => row.keyword)
    ).toEqual(['beta'])

    filterPanel.vm.$emit('update:saved-filter', 'unsaved')
    await wrapper.vm.$nextTick()

    expect(
      resultsTable()
        .props('rows')
        .map((row) => row.keyword)
    ).toEqual(['alpha', 'gamma'])
  })

  it('renders a capped result window and loads more without limiting exports', async () => {
    const wrapper = mountTable()
    const resultsTable = () => wrapper.findComponent({ name: 'KeywordResultsTable' })

    await wrapper.setData({
      visibleLimit: 2
    })

    expect(
      resultsTable()
        .props('rows')
        .map((row) => row.keyword)
    ).toEqual(['alpha', 'beta'])
    expect(wrapper.text()).toContain('Showing 2')
    expect(wrapper.text()).toContain('3 filtered keywords')

    await wrapper.find('[data-test="load-more-keywords"]').trigger('click')

    expect(
      resultsTable()
        .props('rows')
        .map((row) => row.keyword)
    ).toEqual(['alpha', 'beta', 'gamma'])

    await wrapper.setData({
      visibleLimit: 2
    })

    wrapper.vm.exportProcessedData()

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(rows)
  })
})
