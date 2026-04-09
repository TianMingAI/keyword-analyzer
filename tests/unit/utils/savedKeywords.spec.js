/* eslint-env jest */
import {
  SAVED_KEYWORD_STATUSES,
  createSavedKeyword,
  isKeywordSaved,
  parseSavedKeywords,
  removeSavedKeyword,
  serializeSavedKeywords,
  updateSavedKeywordResearch,
  updateSavedKeywordStatus,
  upsertSavedKeyword
} from '~/utils/savedKeywords'

const row = {
  keyword: 'Alpha Keyword',
  volume: 100,
  kd: 20,
  cpc: 2,
  roi: 10,
  url: 'https://www.google.com/search?q=Alpha%20Keyword'
}

describe('utils/savedKeywords', () => {
  it('creates a saved keyword snapshot with default not-started status', () => {
    expect(createSavedKeyword(row, '2026-04-09T00:00:00.000Z')).toEqual({
      ...row,
      status: SAVED_KEYWORD_STATUSES.NOT_STARTED,
      savedAt: '2026-04-09T00:00:00.000Z',
      updatedAt: '2026-04-09T00:00:00.000Z'
    })
  })

  it('upserts and detects saved keywords by normalized keyword text', () => {
    const saved = upsertSavedKeyword([], row, '2026-04-09T00:00:00.000Z')
    const deduped = upsertSavedKeyword(
      saved,
      { ...row, keyword: ' alpha keyword ' },
      '2026-04-10T00:00:00.000Z'
    )

    expect(deduped).toHaveLength(1)
    expect(deduped[0].keyword).toBe('Alpha Keyword')
    expect(isKeywordSaved(deduped, 'ALPHA KEYWORD')).toBe(true)
  })

  it('updates only known statuses and removes saved keywords', () => {
    const saved = upsertSavedKeyword([], row, '2026-04-09T00:00:00.000Z')
    const done = updateSavedKeywordStatus(
      saved,
      row.keyword,
      SAVED_KEYWORD_STATUSES.SITE_DONE,
      '2026-04-11T00:00:00.000Z'
    )
    const unchanged = updateSavedKeywordStatus(
      done,
      row.keyword,
      'invalid_status',
      '2026-04-12T00:00:00.000Z'
    )

    expect(done[0].status).toBe(SAVED_KEYWORD_STATUSES.SITE_DONE)
    expect(done[0].updatedAt).toBe('2026-04-11T00:00:00.000Z')
    expect(unchanged).toEqual(done)
    expect(removeSavedKeyword(done, ' alpha keyword ')).toEqual([])
  })

  it('updates keyword research fields without changing the shortlist order', () => {
    const saved = upsertSavedKeyword([], row, '2026-04-09T00:00:00.000Z')
    const updated = updateSavedKeywordResearch(
      saved,
      row.keyword,
      { intitleResults: '250' },
      '2026-04-12T00:00:00.000Z'
    )

    expect(updated).toEqual([
      {
        ...saved[0],
        intitleResults: 250,
        updatedAt: '2026-04-12T00:00:00.000Z'
      }
    ])
  })

  it('serializes valid saved keywords and parses storage defensively', () => {
    const saved = upsertSavedKeyword([], row, '2026-04-09T00:00:00.000Z')
    const researched = updateSavedKeywordResearch(
      saved,
      row.keyword,
      { intitleResults: 0 },
      '2026-04-12T00:00:00.000Z'
    )

    expect(parseSavedKeywords('not json')).toEqual([])
    expect(parseSavedKeywords(JSON.stringify([{ keyword: '', status: 'site_done' }]))).toEqual([])
    expect(parseSavedKeywords(serializeSavedKeywords(researched))).toEqual(researched)
  })
})
