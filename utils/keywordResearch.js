const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
}

export const calculateKgr = ({ intitleResults, volume }) => {
  const intitle = toFiniteNumber(intitleResults)
  const monthlyVolume = toFiniteNumber(volume)

  if (intitle === null || !monthlyVolume || monthlyVolume <= 0) {
    return null
  }

  return intitle / monthlyVolume
}

export const calculateEkgr = ({ intitleResults, volume, kd }) => {
  const kgr = calculateKgr({ intitleResults, volume })
  const keywordDifficulty = toFiniteNumber(kd)

  if (kgr === null || keywordDifficulty === null) {
    return null
  }

  return kgr * (1 + keywordDifficulty / 100)
}

export const getKgrDifficultyBand = (score) => {
  if (score === null || score === undefined) {
    return { tone: 'empty', label: 'Waiting for intitle' }
  }

  if (score < 0.25) {
    return { tone: 'low', label: 'Low competition' }
  }

  if (score <= 1) {
    return { tone: 'medium', label: 'Medium competition' }
  }

  return { tone: 'high', label: 'Harder opportunity' }
}
