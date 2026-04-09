export const REQUIRED_SEMRUSH_HEADERS = ['Keyword', 'Volume', 'Keyword Difficulty', 'CPC (USD)']

const toNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim()
    if (!normalized) {
      return 0
    }

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const getMissingHeaders = (headers = []) => {
  return REQUIRED_SEMRUSH_HEADERS.filter((header) => !headers.includes(header))
}

export const normalizeSemrushRows = (rows = []) => {
  return rows
    .map((row) => {
      const keyword = String(row.Keyword || '').trim()
      const volume = toNumber(row.Volume)
      const kd = toNumber(row['Keyword Difficulty'])
      const cpc = toNumber(row['CPC (USD)'])

      if (!keyword || volume <= 0 || kd <= 0 || cpc <= 0) {
        return null
      }

      return {
        keyword,
        volume,
        kd,
        cpc,
        roi: Number(((volume * cpc) / kd).toFixed(2)),
        url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`
      }
    })
    .filter(Boolean)
    .sort((left, right) => right.roi - left.roi)
}
