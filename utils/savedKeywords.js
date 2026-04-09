export const SAVED_KEYWORDS_STORAGE_KEY = 'keyword-analyzer:saved-keywords:v1'

export const SAVED_KEYWORD_STATUSES = {
  NOT_STARTED: 'not_started',
  SITE_DONE: 'site_done'
}

const KNOWN_STATUSES = Object.values(SAVED_KEYWORD_STATUSES)

const currentIsoString = () => new Date().toISOString()

export const normalizeKeywordKey = (keyword = '') => String(keyword).trim().toLowerCase()

const isKnownStatus = (status) => KNOWN_STATUSES.includes(status)

const toSavedKeyword = (value) => {
  if (!value || !normalizeKeywordKey(value.keyword) || !isKnownStatus(value.status)) {
    return null
  }

  const savedKeyword = {
    keyword: String(value.keyword).trim(),
    volume: Number(value.volume) || 0,
    kd: Number(value.kd) || 0,
    cpc: Number(value.cpc) || 0,
    roi: Number(value.roi) || 0,
    url: value.url || `https://www.google.com/search?q=${encodeURIComponent(value.keyword)}`,
    status: value.status,
    savedAt: value.savedAt || currentIsoString(),
    updatedAt: value.updatedAt || value.savedAt || currentIsoString()
  }

  if (Number.isFinite(Number(value.intitleResults))) {
    savedKeyword.intitleResults = Number(value.intitleResults)
  }

  return savedKeyword
}

export const createSavedKeyword = (row, now = currentIsoString()) => {
  const keyword = String(row?.keyword || '').trim()

  return {
    keyword,
    volume: Number(row?.volume) || 0,
    kd: Number(row?.kd) || 0,
    cpc: Number(row?.cpc) || 0,
    roi: Number(row?.roi) || 0,
    url: row?.url || `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
    status: SAVED_KEYWORD_STATUSES.NOT_STARTED,
    savedAt: now,
    updatedAt: now
  }
}

export const isKeywordSaved = (savedRows = [], keyword) => {
  const keywordKey = normalizeKeywordKey(keyword)

  return savedRows.some((row) => normalizeKeywordKey(row.keyword) === keywordKey)
}

export const upsertSavedKeyword = (savedRows = [], row, now = currentIsoString()) => {
  const keywordKey = normalizeKeywordKey(row?.keyword)

  if (!keywordKey) {
    return savedRows
  }

  if (isKeywordSaved(savedRows, keywordKey)) {
    return savedRows
  }

  return [createSavedKeyword(row, now), ...savedRows]
}

export const removeSavedKeyword = (savedRows = [], keyword) => {
  const keywordKey = normalizeKeywordKey(keyword)

  return savedRows.filter((row) => normalizeKeywordKey(row.keyword) !== keywordKey)
}

export const updateSavedKeywordStatus = (
  savedRows = [],
  keyword,
  status,
  now = currentIsoString()
) => {
  if (!isKnownStatus(status)) {
    return savedRows
  }

  const keywordKey = normalizeKeywordKey(keyword)

  return savedRows.map((row) => {
    if (normalizeKeywordKey(row.keyword) !== keywordKey) {
      return row
    }

    return {
      ...row,
      status,
      updatedAt: now
    }
  })
}

export const updateSavedKeywordResearch = (
  savedRows = [],
  keyword,
  research,
  now = currentIsoString()
) => {
  const keywordKey = normalizeKeywordKey(keyword)
  const rawIntitleResults = research?.intitleResults
  const intitleResults =
    rawIntitleResults === '' || rawIntitleResults === null || rawIntitleResults === undefined
      ? undefined
      : Number(rawIntitleResults)

  return savedRows.map((row) => {
    if (normalizeKeywordKey(row.keyword) !== keywordKey) {
      return row
    }

    const nextRow = {
      ...row,
      updatedAt: now
    }

    if (intitleResults === undefined || !Number.isFinite(intitleResults)) {
      delete nextRow.intitleResults
      return nextRow
    }

    return {
      ...nextRow,
      intitleResults: Math.max(0, intitleResults)
    }
  })
}

export const parseSavedKeywords = (rawValue) => {
  try {
    const parsedValue = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.map(toSavedKeyword).filter(Boolean)
  } catch (_error) {
    return []
  }
}

export const serializeSavedKeywords = (savedRows = []) => {
  return JSON.stringify(savedRows.map(toSavedKeyword).filter(Boolean))
}
