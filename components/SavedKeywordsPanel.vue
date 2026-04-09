<template>
  <section class="w-full rounded-2xl bg-medium-blue p-5 text-white shadow-md">
    <div class="mb-5 flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h2 class="text-2xl font-bold">Saved Pipeline</h2>
        <p class="mt-2 text-sm leading-6 text-grey">
          Your shortlist. Keep it small enough to actually build.
        </p>
      </div>
      <span
        data-test="saved-count-badge"
        class="shrink-0 whitespace-nowrap rounded-full bg-dark-blue px-3 py-1 text-sm leading-none text-orange"
      >
        {{ keywords.length }} saved
      </span>
    </div>

    <div
      v-if="!keywords.length"
      class="rounded-2xl border border-dashed border-grey/40 p-6 text-sm leading-6 text-grey"
    >
      Saved keywords will appear here. Keep 10-30 targets that are worth building.
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-3 gap-2 text-center text-xs">
        <div data-test="saved-count" class="rounded-xl bg-dark-blue p-3">
          <div class="text-lg font-bold text-white">{{ keywords.length }}</div>
          <div class="mt-1 text-grey">Saved</div>
        </div>
        <div data-test="researched-count" class="rounded-xl bg-dark-blue p-3">
          <div class="text-lg font-bold text-white">{{ researchedKeywords.length }}</div>
          <div class="mt-1 text-grey">Researched</div>
        </div>
        <div data-test="site-done-count" class="rounded-xl bg-dark-blue p-3">
          <div class="text-lg font-bold text-white">{{ siteDoneKeywords.length }}</div>
          <div class="mt-1 text-grey">Site Done</div>
        </div>
      </div>

      <div data-test="saved-not-started">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-[0.22em] text-grey">Not built</h3>
          <span class="text-sm text-orange">{{ notStartedKeywords.length }}</span>
        </div>
        <div class="space-y-3">
          <article
            v-for="keyword in notStartedKeywords"
            :key="keyword.keyword"
            class="rounded-2xl bg-dark-medium-blue p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <a
                class="text-sm font-bold text-white underline"
                :href="keyword.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ keyword.keyword }}
              </a>
              <span class="shrink-0 text-sm font-bold text-orange">{{
                formatScore(keyword.roi)
              }}</span>
            </div>
            <div class="mt-3 text-xs text-grey">
              Volume {{ keyword.volume }} · KD {{ keyword.kd }} · CPC {{ keyword.cpc }}
            </div>
            <details class="mt-4 rounded-xl bg-dark-blue p-3 text-xs text-grey">
              <summary class="cursor-pointer font-bold text-white">Research</summary>
              <div class="mt-3 space-y-3">
                <label class="block">
                  <span class="mb-1 block">intitle results</span>
                  <input
                    :data-test="`intitle-${keyword.keyword}`"
                    class="w-full rounded-lg bg-medium-blue px-3 py-2 text-white ring-1 ring-grey/20 focus-visible:ring-2 focus-visible:ring-orange"
                    name="intitle-results"
                    autocomplete="off"
                    inputmode="numeric"
                    min="0"
                    placeholder="e.g. 25"
                    type="number"
                    :value="intitleValue(keyword)"
                    @input="emitResearchUpdate(keyword.keyword, $event.target.value)"
                  />
                </label>
                <a
                  class="inline-flex text-orange underline"
                  :href="intitleSearchUrl(keyword.keyword)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open intitle search
                </a>
                <div class="grid grid-cols-2 gap-2">
                  <div class="rounded-lg bg-medium-blue p-3">
                    <div class="text-grey">KGR</div>
                    <div class="mt-1 text-base font-bold text-white">{{ formatKgr(keyword) }}</div>
                  </div>
                  <div class="rounded-lg bg-medium-blue p-3">
                    <div class="text-grey">EKGR</div>
                    <div class="mt-1 text-base font-bold text-white">
                      {{ formatEkgr(keyword) }}
                    </div>
                  </div>
                </div>
                <div :class="['rounded-lg px-3 py-2 font-bold', researchBandClass(keyword)]">
                  {{ researchBand(keyword).label }}
                </div>
              </div>
            </details>
            <div class="mt-4 flex gap-2">
              <button
                :data-test="`mark-site-done-${keyword.keyword}`"
                type="button"
                class="rounded-lg bg-orange px-3 py-2 text-xs font-semibold text-white hover:bg-orangeHover"
                @click="$emit('mark-site-done', keyword.keyword)"
              >
                Mark site built
              </button>
              <button
                :data-test="`remove-${keyword.keyword}`"
                type="button"
                class="rounded-lg bg-dark-blue px-3 py-2 text-xs font-semibold text-white hover:bg-medium-blueHover"
                @click="$emit('remove', keyword.keyword)"
              >
                Delete
              </button>
            </div>
          </article>
        </div>
      </div>

      <div data-test="saved-site-done">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-[0.22em] text-grey">Site built</h3>
          <span class="text-sm text-orange">{{ siteDoneKeywords.length }}</span>
        </div>
        <div class="space-y-3">
          <article
            v-for="keyword in siteDoneKeywords"
            :key="keyword.keyword"
            class="rounded-2xl bg-dark-blue p-4 opacity-80"
          >
            <div class="flex items-start justify-between gap-3">
              <a
                class="text-sm font-bold text-white underline"
                :href="keyword.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ keyword.keyword }}
              </a>
              <span class="shrink-0 text-sm font-bold text-orange">{{
                formatScore(keyword.roi)
              }}</span>
            </div>
            <div class="mt-3 text-xs text-grey">
              {{ statusLabel(keyword.status) }} · Volume {{ keyword.volume }} · KD {{ keyword.kd }}
            </div>
            <div class="mt-4 flex gap-2">
              <button
                :data-test="`mark-not-started-${keyword.keyword}`"
                type="button"
                class="rounded-lg bg-medium-blue px-3 py-2 text-xs font-semibold text-white hover:bg-medium-blueHover"
                @click="$emit('mark-not-started', keyword.keyword)"
              >
                Mark not built
              </button>
              <button
                :data-test="`remove-${keyword.keyword}`"
                type="button"
                class="rounded-lg bg-dark-medium-blue px-3 py-2 text-xs font-semibold text-white hover:bg-medium-blueHover"
                @click="$emit('remove', keyword.keyword)"
              >
                Delete
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { SAVED_KEYWORD_STATUSES } from '~/utils/savedKeywords'
import { calculateEkgr, calculateKgr, getKgrDifficultyBand } from '~/utils/keywordResearch'

export default {
  name: 'SavedKeywordsPanel',

  props: {
    keywords: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      statuses: SAVED_KEYWORD_STATUSES
    }
  },

  computed: {
    notStartedKeywords() {
      return this.keywords.filter((keyword) => keyword.status !== SAVED_KEYWORD_STATUSES.SITE_DONE)
    },

    siteDoneKeywords() {
      return this.keywords.filter((keyword) => keyword.status === SAVED_KEYWORD_STATUSES.SITE_DONE)
    },

    researchedKeywords() {
      return this.keywords.filter(
        (keyword) => keyword.intitleResults !== undefined && keyword.intitleResults !== null
      )
    }
  },

  methods: {
    statusLabel(status) {
      return status === SAVED_KEYWORD_STATUSES.SITE_DONE ? 'Site built' : 'Not built'
    },

    formatScore(score) {
      if (score >= 1000) {
        return `${Number(score / 1000).toFixed(score >= 10000 ? 1 : 2)}k`
      }

      return Number(score).toLocaleString('en-US')
    },

    intitleValue(keyword) {
      return keyword.intitleResults === undefined || keyword.intitleResults === null
        ? ''
        : String(keyword.intitleResults)
    },

    intitleSearchUrl(keyword) {
      return `https://www.google.com/search?q=${encodeURIComponent(`intitle:"${keyword}"`)}`
    },

    kgr(keyword) {
      return calculateKgr({
        intitleResults: keyword.intitleResults,
        volume: keyword.volume
      })
    },

    ekgr(keyword) {
      return calculateEkgr({
        intitleResults: keyword.intitleResults,
        volume: keyword.volume,
        kd: keyword.kd
      })
    },

    formatResearchScore(score) {
      return score === null ? '--' : Number(score).toFixed(3)
    },

    formatKgr(keyword) {
      return this.formatResearchScore(this.kgr(keyword))
    },

    formatEkgr(keyword) {
      return this.formatResearchScore(this.ekgr(keyword))
    },

    researchBand(keyword) {
      return getKgrDifficultyBand(this.ekgr(keyword))
    },

    researchBandClass(keyword) {
      const tone = this.researchBand(keyword).tone

      if (tone === 'low') {
        return 'bg-green-900/40 text-green-200'
      }

      if (tone === 'medium') {
        return 'bg-orange/20 text-orange'
      }

      if (tone === 'high') {
        return 'bg-red-900/40 text-red-200'
      }

      return 'bg-medium-blue text-grey'
    },

    emitResearchUpdate(keyword, rawIntitleResults) {
      const intitleResults = rawIntitleResults === '' ? undefined : Number(rawIntitleResults)

      this.$emit('update-research', {
        keyword,
        intitleResults
      })
    }
  }
}
</script>
