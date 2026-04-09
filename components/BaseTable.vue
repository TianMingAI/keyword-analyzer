<template>
  <div class="w-full">
    <div class="mx-auto w-full rounded-[2rem] bg-dark-medium-blue p-3 shadow-md">
      <div class="sticky top-[112px] z-20 -mx-3 -mt-3 rounded-t-[2rem] bg-dark-medium-blue p-3">
        <div class="mb-3 flex flex-col gap-1 px-2 pt-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-xl font-bold text-white">Ranked keyword list</h2>
            <p class="text-xs leading-5 text-grey">
              Score-first ranking. Save candidates, then research them in the pipeline.
            </p>
          </div>
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-orange">
            {{ filteredRows.length.toLocaleString('en-US') }} visible
          </span>
        </div>

        <KeywordFilters
          :kd-range="kdRange"
          :query="query"
          :saved-filter="savedFilter"
          :volume-range="volumeRange"
          @update:kd-range="updateKdRange"
          @update:query="updateQuery"
          @update:saved-filter="updateSavedFilter"
          @update:volume-range="updateVolumeRange"
          @export="exportProcessedData"
        />
      </div>
      <div class="max-h-[72vh] overflow-auto rounded-lg">
        <KeywordResultsTable
          :rows="visibleRows"
          :saved-keyword-keys="savedKeywordKeys"
          @save-row="$emit('save-keyword', $event)"
          @remove-row="$emit('remove-keyword', $event)"
        />
      </div>
      <div
        v-if="filteredRows.length > visibleRows.length"
        class="mt-4 flex flex-col gap-3 rounded-2xl bg-dark-medium-blue p-4 text-sm text-grey sm:flex-row sm:items-center sm:justify-between"
      >
        <span>
          Showing {{ visibleRows.length.toLocaleString('en-US') }} of
          {{ filteredRows.length.toLocaleString('en-US') }} filtered keywords.
        </span>
        <button
          data-test="load-more-keywords"
          class="rounded-lg bg-medium-blue px-4 py-2 font-bold text-white hover:bg-medium-blueHover focus-visible:ring-2 focus-visible:ring-orange"
          type="button"
          @click="loadMoreRows"
        >
          Load more
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import KeywordFilters from '~/components/KeywordFilters.vue'
import KeywordResultsTable from '~/components/KeywordResultsTable.vue'
import { filterRows, normalizeRange } from '~/utils/keywordFilters'
import { normalizeKeywordKey } from '~/utils/savedKeywords'

export default {
  name: 'BaseTable',

  components: {
    KeywordFilters,
    KeywordResultsTable
  },

  props: {
    rows: {
      type: Array,
      default: () => []
    },
    savedKeywords: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      kdRange: [],
      volumeRange: [],
      query: '',
      savedFilter: 'all',
      visibleLimit: 500
    }
  },

  computed: {
    filteredRows() {
      const normalizedQuery = this.query.trim().toLowerCase()
      const rows = filterRows(this.rows, {
        kdRange: this.kdRange,
        volumeRange: this.volumeRange
      })

      return rows.filter((row) => {
        const keywordKey = normalizeKeywordKey(row.keyword)
        const matchesQuery = !normalizedQuery || keywordKey.includes(normalizedQuery)
        const isSaved = Boolean(this.savedKeywordKeys[keywordKey])

        if (this.savedFilter === 'saved') {
          return matchesQuery && isSaved
        }

        if (this.savedFilter === 'unsaved') {
          return matchesQuery && !isSaved
        }

        return matchesQuery
      })
    },

    savedKeywordKeys() {
      return this.savedKeywords.reduce((keys, keyword) => {
        keys[normalizeKeywordKey(keyword.keyword)] = true
        return keys
      }, {})
    },

    visibleRows() {
      return this.filteredRows.slice(0, this.visibleLimit)
    }
  },

  methods: {
    updateKdRange(range) {
      this.kdRange = normalizeRange(range, 0, 100)
      this.resetVisibleRows()
    },

    updateVolumeRange(range) {
      this.volumeRange = normalizeRange(range, 0, 99999999)
      this.resetVisibleRows()
    },

    updateQuery(query) {
      this.query = query
      this.resetVisibleRows()
    },

    updateSavedFilter(filter) {
      this.savedFilter = filter
      this.resetVisibleRows()
    },

    resetVisibleRows() {
      this.visibleLimit = 500
    },

    loadMoreRows() {
      this.visibleLimit += 500
    },

    exportProcessedData() {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(this.filteredRows)

      XLSX.utils.book_append_sheet(wb, ws, 'Processed Data')

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })

      saveAs(
        new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }),
        'processed-data.xlsx'
      )
    },

    s2ab(binaryString) {
      const buffer = new ArrayBuffer(binaryString.length)
      const view = new Uint8Array(buffer)

      for (let index = 0; index < binaryString.length; index += 1) {
        view[index] = binaryString.charCodeAt(index) & 0xff
      }

      return buffer
    }
  }
}
</script>
