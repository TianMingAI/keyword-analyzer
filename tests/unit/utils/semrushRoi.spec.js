/* eslint-env jest */
import { getMissingHeaders, normalizeSemrushRows } from '~/utils/semrushRoi'

describe('utils/semrushRoi', () => {
  it('reports missing required columns', () => {
    expect(getMissingHeaders(['Keyword', 'Volume'])).toEqual(['Keyword Difficulty', 'CPC (USD)'])
  })

  it('normalizes, filters, and sorts imported rows by roi descending', () => {
    const rows = [
      {
        Keyword: 'cheap proxy',
        Volume: '1000',
        'Keyword Difficulty': '20',
        'CPC (USD)': '1.5'
      },
      {
        Keyword: 'ignore me',
        Volume: '100',
        'Keyword Difficulty': '0',
        'CPC (USD)': '8'
      },
      {
        Keyword: 'saas seo',
        Volume: '300',
        'Keyword Difficulty': '10',
        'CPC (USD)': '4'
      }
    ]

    expect(normalizeSemrushRows(rows)).toEqual([
      {
        keyword: 'saas seo',
        volume: 300,
        kd: 10,
        cpc: 4,
        roi: 120,
        url: 'https://www.google.com/search?q=saas%20seo'
      },
      {
        keyword: 'cheap proxy',
        volume: 1000,
        kd: 20,
        cpc: 1.5,
        roi: 75,
        url: 'https://www.google.com/search?q=cheap%20proxy'
      }
    ])
  })
})
