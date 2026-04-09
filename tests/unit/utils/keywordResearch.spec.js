/* eslint-env jest */
import { calculateEkgr, calculateKgr, getKgrDifficultyBand } from '~/utils/keywordResearch'

describe('utils/keywordResearch', () => {
  it('calculates KGR and EKGR from intitle, monthly volume, and KD', () => {
    expect(calculateKgr({ intitleResults: 25, volume: 200 })).toBe(0.125)
    expect(calculateEkgr({ intitleResults: 25, volume: 200, kd: 40 })).toBe(0.175)
  })

  it('returns null when formula inputs are incomplete or invalid', () => {
    expect(calculateKgr({ intitleResults: null, volume: 200 })).toBe(null)
    expect(calculateKgr({ intitleResults: 10, volume: 0 })).toBe(null)
    expect(calculateEkgr({ intitleResults: undefined, volume: 200, kd: 20 })).toBe(null)
  })

  it('bands KGR-style scores into practical competition labels', () => {
    expect(getKgrDifficultyBand(null)).toEqual({ tone: 'empty', label: 'Waiting for intitle' })
    expect(getKgrDifficultyBand(0.249)).toEqual({ tone: 'low', label: 'Low competition' })
    expect(getKgrDifficultyBand(1)).toEqual({ tone: 'medium', label: 'Medium competition' })
    expect(getKgrDifficultyBand(1.01)).toEqual({ tone: 'high', label: 'Harder opportunity' })
  })
})
