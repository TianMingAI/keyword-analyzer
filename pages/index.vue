<template>
  <div id="main" class="flex h-full min-h-screen w-full flex-col bg-dark-blue font-rubik">
    <main class="flex-grow">
      <div class="px-4 pt-10 pb-16 text-white sm:px-6 lg:px-8">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <section
            v-if="!hasImportedRows"
            class="grid gap-8 border-b border-medium-blue pb-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-end"
          >
            <div class="max-w-3xl">
              <p class="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-orange">
                Open-source keyword research workbench
              </p>
              <h1 class="text-4xl font-bold leading-tight text-white sm:text-6xl">
                Analyze Semrush<br />
                Keywords Locally
              </h1>
              <p class="mt-5 max-w-2xl text-base leading-7 text-grey sm:text-lg">
                Import Excel, score opportunities, save candidates, check KGR with intitle, and keep
                your shortlist in this browser.
              </p>
            </div>

            <div
              data-test="import-dropzone"
              class="rounded-[1.75rem] border border-dashed border-orange/50 bg-dark-medium-blue p-4 text-white lg:w-[520px] lg:max-w-full lg:justify-self-end lg:self-center"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
            >
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                  <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-orange">
                    Start with Semrush Excel
                  </p>
                  <h2 class="text-xl font-bold leading-tight">Drop export or choose file.</h2>
                  <p class="mt-2 text-xs leading-5 text-grey">
                    Required: Keyword, Volume, KD, and CPC.
                  </p>
                </div>
                <div class="shrink-0 rounded-2xl bg-dark-blue p-3 sm:w-[240px]">
                  <button
                    class="flex w-full flex-row items-center justify-center gap-3 rounded-lg bg-orange py-2.5 px-4 text-sm font-bold text-white shadow-button-primary transition-colors duration-100 hover:bg-orangeHover active:bg-orange disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-orange"
                    :disabled="isImporting"
                    type="button"
                    @click="triggerFileInput"
                  >
                    {{ isImporting ? 'Importing…' : 'Choose File' }}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12.1714 3.983L2.12989 14.0245L0.480225 12.3748L10.5206 2.33333H1.67139V0H14.5047V12.8333H12.1714V3.983Z"
                        fill="#FFFBF7"
                      ></path>
                    </svg>
                  </button>
                  <p class="mt-2 text-center text-[11px] leading-5 text-grey">Local browser only</p>
                </div>
              </div>
            </div>
          </section>

          <section
            v-else
            data-test="workbench-bar"
            class="sticky top-0 z-30 -mx-4 border-b border-medium-blue bg-dark-blue px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          >
            <div
              class="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <div class="min-w-0">
                <p class="text-xs font-bold uppercase tracking-[0.24em] text-orange">
                  Keyword workbench
                </p>
                <h1 class="mt-1 text-2xl font-bold leading-tight text-white sm:text-3xl">
                  Keyword Opportunities
                </h1>
                <p class="mt-1 text-sm text-grey">
                  {{ importedRows.length.toLocaleString('en-US') }} imported keywords · data stays
                  local
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <button
                  data-test="scoring-guide-trigger"
                  class="rounded-full bg-dark-medium-blue px-4 py-2 text-sm font-bold text-white hover:bg-medium-blueHover focus-visible:ring-2 focus-visible:ring-orange"
                  type="button"
                  @click="isScoringGuideOpen = true"
                >
                  ? Scoring Guide
                </button>
                <button
                  class="rounded-full bg-orange px-5 py-2 text-sm font-bold text-white shadow-button-primary hover:bg-orangeHover focus-visible:ring-2 focus-visible:ring-orange"
                  type="button"
                  :disabled="isImporting"
                  @click="triggerFileInput"
                >
                  {{ isImporting ? 'Importing…' : 'Replace Excel' }}
                </button>
              </div>
            </div>
          </section>

          <p
            v-if="importError"
            class="rounded-lg bg-red-900/40 p-4 text-sm text-red-200"
            role="alert"
          >
            {{ importError }}
          </p>

          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls"
            class="hidden"
            @change="handleFileUpload"
          />

          <section
            v-if="!hasImportedRows"
            data-test="workbench-preview"
            class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch"
          >
            <div
              class="rounded-[2rem] border border-medium-blue bg-dark-blue p-5 text-white sm:p-6"
            >
              <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.24em] text-orange">
                    Preview of your workspace
                  </p>
                  <h2 class="mt-2 text-2xl font-bold">Import once. Work from a ranked queue.</h2>
                </div>
                <span
                  class="w-fit rounded-full bg-dark-medium-blue px-3 py-1 text-xs font-bold text-grey"
                >
                  Example data
                </span>
              </div>

              <div class="overflow-hidden rounded-3xl bg-dark-medium-blue">
                <div
                  class="grid grid-cols-[minmax(0,1fr)_72px_56px_72px] bg-dark-blue px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-grey sm:grid-cols-[minmax(0,1fr)_96px_72px_96px]"
                >
                  <span>Keyword</span>
                  <span class="text-right">Volume</span>
                  <span class="text-right">KD</span>
                  <span class="text-right">Score</span>
                </div>
                <div
                  v-for="row in previewRows"
                  :key="row.keyword"
                  class="grid grid-cols-[minmax(0,1fr)_72px_56px_72px] border-t border-dark-blue px-4 py-4 text-sm sm:grid-cols-[minmax(0,1fr)_96px_72px_96px]"
                >
                  <span class="min-w-0 truncate font-bold text-white">{{ row.keyword }}</span>
                  <span class="text-right text-grey">{{ row.volume }}</span>
                  <span class="text-right text-grey">{{ row.kd }}</span>
                  <span class="text-right font-bold text-orange">{{ row.score }}</span>
                </div>
              </div>

              <div class="mt-5 grid gap-3 text-sm text-grey sm:grid-cols-3">
                <div class="rounded-2xl bg-dark-medium-blue p-4">
                  <span class="font-bold text-white">1. Import</span>
                  <p class="mt-2 leading-6">Read Semrush Excel locally in your browser.</p>
                </div>
                <div class="rounded-2xl bg-dark-medium-blue p-4">
                  <span class="font-bold text-white">2. Score</span>
                  <p class="mt-2 leading-6">score opportunities by volume, CPC, and KD.</p>
                </div>
                <div class="rounded-2xl bg-dark-medium-blue p-4">
                  <span class="font-bold text-white">3. Ship</span>
                  <p class="mt-2 leading-6">Save targets, research intitle, mark site status.</p>
                </div>
              </div>
            </div>

            <div
              v-if="savedKeywords.length"
              data-test="saved-home-summary"
              class="max-h-[720px] overflow-auto rounded-[2rem] bg-medium-blue text-white shadow-md"
            >
              <SavedKeywordsPanel
                :keywords="savedKeywords"
                @remove="removeKeyword"
                @mark-site-done="markKeywordSiteDone"
                @mark-not-started="markKeywordNotStarted"
                @update-research="updateKeywordResearch"
              />
            </div>

            <div v-else class="rounded-[2rem] bg-medium-blue p-6 text-white shadow-md">
              <p class="text-xs font-bold uppercase tracking-[0.24em] text-orange">
                Pipeline preview
              </p>
              <h2 class="mt-2 text-3xl font-bold">Save only the keywords worth building.</h2>
              <div class="mt-6 space-y-3 text-sm">
                <div
                  v-for="step in pipelinePreviewSteps"
                  :key="step"
                  class="rounded-2xl bg-dark-medium-blue px-4 py-3 text-grey"
                >
                  {{ step }}
                </div>
              </div>
            </div>
          </section>

          <div
            v-if="isScoringGuideOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-dark-blue/80 px-4 py-8"
            @click.self="isScoringGuideOpen = false"
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="scoring-guide-title"
              class="max-h-full w-full max-w-2xl overflow-auto rounded-[2rem] border border-medium-blue bg-dark-medium-blue p-6 text-white shadow-2xl sm:p-8"
            >
              <div class="flex items-start justify-between gap-6">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.24em] text-orange">
                    Score logic
                  </p>
                  <h2 id="scoring-guide-title" class="mt-2 text-3xl font-bold">Scoring Guide</h2>
                </div>
                <button
                  data-test="scoring-guide-close"
                  class="rounded-full bg-dark-blue px-4 py-2 text-sm font-bold text-white hover:bg-medium-blueHover focus-visible:ring-2 focus-visible:ring-orange"
                  type="button"
                  aria-label="Close scoring guide"
                  @click="isScoringGuideOpen = false"
                >
                  Close
                </button>
              </div>

              <div class="mt-8 space-y-5 text-sm leading-7 text-grey">
                <div class="rounded-2xl bg-dark-blue p-5">
                  <h3 class="text-lg font-bold text-white">Opportunity Score</h3>
                  <p class="mt-2">
                    Opportunity Score = Volume × CPC ÷ KD. It is a quick ranking signal: higher
                    search volume, higher CPC, and lower KD move a keyword upward.
                  </p>
                </div>
                <div class="rounded-2xl bg-dark-blue p-5">
                  <h3 class="text-lg font-bold text-white">KGR / EKGR</h3>
                  <p class="mt-2">
                    KGR = intitle results ÷ monthly search volume. EKGR folds KD into that
                    competition check. Save a keyword first, then add intitle results in the
                    Pipeline.
                  </p>
                </div>
                <div class="rounded-2xl bg-dark-blue p-5">
                  <h3 class="text-lg font-bold text-white">Decision rule</h3>
                  <p class="mt-2">
                    Do not build from one score alone. Use Opportunity Score for the shortlist, then
                    validate with intitle, the live SERP, and your real build cost.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div
            v-if="hasImportedRows"
            class="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]"
          >
            <section
              class="min-w-0 rounded-[2rem] border border-medium-blue bg-dark-blue p-4 sm:p-5"
            >
              <div
                v-if="!hasImportedRows"
                class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <h2 class="text-2xl font-bold text-white">Keyword Opportunities</h2>
                  <p class="text-sm text-grey">
                    Sort is score-first. Save only keywords you would actually build.
                  </p>
                </div>
              </div>

              <template v-if="hasImportedRows">
                <BaseTable
                  :rows="importedRows"
                  :saved-keywords="savedKeywords"
                  @save-keyword="saveKeyword"
                  @remove-keyword="removeKeyword"
                />
              </template>
            </section>

            <aside class="xl:sticky xl:top-6">
              <SavedKeywordsPanel
                :keywords="savedKeywords"
                @remove="removeKeyword"
                @mark-site-done="markKeywordSiteDone"
                @mark-not-started="markKeywordNotStarted"
                @update-research="updateKeywordResearch"
              />
            </aside>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import BaseTable from '~/components/BaseTable.vue'
import SavedKeywordsPanel from '~/components/SavedKeywordsPanel.vue'
import { getMissingHeaders, normalizeSemrushRows } from '~/utils/semrushRoi'
import {
  SAVED_KEYWORDS_STORAGE_KEY,
  SAVED_KEYWORD_STATUSES,
  parseSavedKeywords,
  removeSavedKeyword,
  serializeSavedKeywords,
  updateSavedKeywordResearch,
  updateSavedKeywordStatus,
  upsertSavedKeyword
} from '~/utils/savedKeywords'

export default {
  components: {
    BaseTable,
    SavedKeywordsPanel
  },

  data() {
    return {
      importedRows: [],
      savedKeywords: [],
      importError: '',
      isImporting: false,
      isScoringGuideOpen: false,
      previewRows: [
        {
          keyword: 'mortgage calculator',
          volume: '14.8k',
          kd: 21,
          score: '25.7k'
        },
        {
          keyword: 'paycheck calculator',
          volume: '8.1k',
          kd: 24,
          score: '2.9k'
        },
        {
          keyword: 'foundation repair cost',
          volume: '1.3k',
          kd: 2,
          score: '3.1k'
        }
      ],
      pipelinePreviewSteps: [
        '☆ Save a promising keyword from the ranked list',
        'Add intitle results and check KGR / EKGR',
        'Mark it as site done when you publish'
      ]
    }
  },

  computed: {
    hasImportedRows() {
      return this.importedRows.length > 0
    }
  },

  mounted() {
    this.loadSavedKeywords()
  },

  methods: {
    statusLabel(status) {
      return status === SAVED_KEYWORD_STATUSES.SITE_DONE ? 'Site built' : 'Not built'
    },

    formatCompactScore(score) {
      if (score >= 1000) {
        return `${Number(score / 1000).toFixed(score >= 10000 ? 1 : 2)}k`
      }

      return Number(score).toLocaleString('en-US')
    },

    loadSavedKeywords() {
      this.savedKeywords = parseSavedKeywords(localStorage.getItem(SAVED_KEYWORDS_STORAGE_KEY))
    },

    persistSavedKeywords() {
      try {
        localStorage.setItem(SAVED_KEYWORDS_STORAGE_KEY, serializeSavedKeywords(this.savedKeywords))
      } catch (_error) {
        // Saving keywords is additive; analysis and import should continue even if storage is full.
      }
    },

    replaceSavedKeywords(savedKeywords) {
      this.savedKeywords = savedKeywords
      this.persistSavedKeywords()
    },

    saveKeyword(row) {
      this.replaceSavedKeywords(upsertSavedKeyword(this.savedKeywords, row))
    },

    removeKeyword(keyword) {
      this.replaceSavedKeywords(removeSavedKeyword(this.savedKeywords, keyword))
    },

    markKeywordSiteDone(keyword) {
      this.replaceSavedKeywords(
        updateSavedKeywordStatus(this.savedKeywords, keyword, SAVED_KEYWORD_STATUSES.SITE_DONE)
      )
    },

    markKeywordNotStarted(keyword) {
      this.replaceSavedKeywords(
        updateSavedKeywordStatus(this.savedKeywords, keyword, SAVED_KEYWORD_STATUSES.NOT_STARTED)
      )
    },

    updateKeywordResearch({ keyword, intitleResults }) {
      this.replaceSavedKeywords(
        updateSavedKeywordResearch(this.savedKeywords, keyword, { intitleResults })
      )
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    handleFileDrop(event) {
      const [file] = event.dataTransfer?.files || []

      if (file) {
        this.importFile(file)
      }
    },

    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (readEvent) => {
          resolve(readEvent.target.result)
        }

        reader.onerror = () => {
          reject(reader.error || new Error('Unable to import file.'))
        }

        reader.readAsArrayBuffer(file)
      })
    },

    async handleFileUpload(event) {
      const input = event?.target
      const file = input?.files?.[0]

      if (!file) {
        if (input) {
          input.value = ''
        }

        return
      }

      try {
        await this.importFile(file)
      } finally {
        if (input) {
          input.value = ''
        }
      }
    },

    async importFile(file) {
      this.isImporting = true
      this.importError = ''

      try {
        const fileBuffer = await this.readFile(file)
        const workbook = XLSX.read(fileBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const [headerRow = []] = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0 })
        const headers = headerRow.map((header) => String(header || '').trim())
        const missingHeaders = getMissingHeaders(headers)

        if (missingHeaders.length) {
          throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
        }

        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        this.importedRows = normalizeSemrushRows(rows)
      } catch (error) {
        this.importedRows = []
        this.importError = error?.message || 'Unable to import file.'
      } finally {
        this.isImporting = false
      }
    }
  }
}
</script>
