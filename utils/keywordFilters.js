export const normalizeRange = (range = [], defaultMin, defaultMax) => {
  if (!Array.isArray(range) || !range.length) {
    return []
  }

  const [rawMin, rawMax] = range
  const parsedMin = Number.parseInt(rawMin === '' || rawMin == null ? defaultMin : rawMin, 10)
  const parsedMax = Number.parseInt(rawMax === '' || rawMax == null ? defaultMax : rawMax, 10)
  const safeMin = Number.isNaN(parsedMin) ? defaultMin : parsedMin
  const safeMax = Number.isNaN(parsedMax) ? defaultMax : parsedMax

  return safeMin <= safeMax ? [safeMin, safeMax] : [safeMax, safeMin]
}

export const filterRows = (rows = [], { kdRange = [], volumeRange = [] } = {}) => {
  return rows.filter((row) => {
    const kdMatches = !kdRange.length || (row.kd >= kdRange[0] && row.kd <= kdRange[1])
    const volumeMatches =
      !volumeRange.length || (row.volume >= volumeRange[0] && row.volume <= volumeRange[1])

    return kdMatches && volumeMatches
  })
}
