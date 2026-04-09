/* eslint-env jest */
import { filterRows, normalizeRange } from '~/utils/keywordFilters'

describe('utils/keywordFilters', () => {
  it('normalizes blank bounds, parses numbers, and orders reversed ranges', () => {
    expect(normalizeRange(['80', '20'], 0, 100)).toEqual([20, 80])
    expect(normalizeRange(['', ''], 0, 100)).toEqual([0, 100])
    expect(normalizeRange([], 0, 100)).toEqual([])
  })

  it('filters rows using the active kd and volume ranges', () => {
    const rows = [
      { keyword: 'alpha', kd: 10, volume: 50, roi: 20 },
      { keyword: 'beta', kd: 40, volume: 150, roi: 30 },
      { keyword: 'gamma', kd: 70, volume: 250, roi: 40 }
    ]

    expect(
      filterRows(rows, {
        kdRange: [0, 50],
        volumeRange: [100, 200]
      })
    ).toEqual([{ keyword: 'beta', kd: 40, volume: 150, roi: 30 }])
  })
})
