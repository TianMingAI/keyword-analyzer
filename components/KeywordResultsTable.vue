<template>
  <table class="min-w-full rounded-lg bg-medium-blue">
    <thead>
      <tr>
        <th
          class="sticky top-0 z-10 bg-dark-medium-blue py-4 px-4 text-left text-medium text-white"
        >
          Keyword
        </th>
        <th
          class="sticky top-0 z-10 bg-dark-medium-blue py-4 px-8 text-center text-medium text-white"
        >
          Volume
        </th>
        <th
          class="sticky top-0 z-10 bg-dark-medium-blue py-4 px-8 text-center text-medium text-white"
        >
          KD
        </th>
        <th
          class="sticky top-0 z-10 bg-dark-medium-blue py-4 px-8 text-center text-medium text-white"
        >
          CPC
        </th>
        <th
          class="sticky top-0 z-10 bg-dark-medium-blue py-4 px-8 text-center text-medium text-white"
        >
          Score
        </th>
        <th
          class="sticky top-0 z-10 bg-dark-medium-blue py-4 px-8 text-center text-medium text-white"
        >
          Action
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item, index) in rows"
        :key="`${item.keyword}-${index}`"
        :class="{ 'bg-dark-medium-blue': index % 2 === 1 }"
      >
        <td class="max-w-xs break-words py-4 px-4 text-left text-medium text-origin">
          <a class="underline" :href="item.url" target="_blank" rel="noopener noreferrer">
            {{ item.keyword }}
          </a>
        </td>
        <td class="py-4 px-8 text-medium text-white text-center">
          {{ item.volume }}
        </td>
        <td class="py-4 px-8 text-medium text-white text-center">
          {{ item.kd }}
        </td>
        <td class="py-4 px-8 text-medium text-white text-center">
          {{ item.cpc }}
        </td>
        <td class="py-4 px-8 text-medium text-orange text-center font-bold">
          {{ formatScore(item.roi) }}
        </td>
        <td class="py-4 px-8 text-center">
          <button
            type="button"
            data-test="keyword-save-action"
            :aria-label="
              isSaved(item) ? `Remove ${item.keyword} from saved keywords` : `Save ${item.keyword}`
            "
            class="text-2xl font-bold leading-none text-orange transition-transform duration-100 hover:scale-125 focus-visible:ring-2 focus-visible:ring-orange"
            @click="toggleSaved(item)"
          >
            {{ isSaved(item) ? '★' : '☆' }}
          </button>
        </td>
      </tr>
      <tr v-if="!rows.length">
        <td colspan="6" class="py-16 px-4 text-center text-sm text-grey">
          <div
            data-test="keyword-results-empty"
            class="mx-auto max-w-md rounded-[2rem] border border-dashed border-grey/40 bg-dark-blue p-8"
          >
            <p class="text-xl font-bold text-white">No matching keywords</p>
            <p class="mt-3 leading-6">
              Try to clear search, choose All keywords, or loosen the KD / Volume filters.
            </p>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'KeywordResultsTable',

  props: {
    rows: {
      type: Array,
      default: () => []
    },
    savedKeywordKeys: {
      type: Object,
      default: () => ({})
    }
  },

  methods: {
    isSaved(item) {
      return Boolean(this.savedKeywordKeys[item.keyword.toLowerCase()])
    },

    toggleSaved(item) {
      if (this.isSaved(item)) {
        this.$emit('remove-row', item.keyword)
        return
      }

      this.$emit('save-row', item)
    },

    formatScore(score) {
      if (score >= 1000) {
        return `${Number(score / 1000).toFixed(score >= 10000 ? 1 : 2)}k`
      }

      return Number(score).toLocaleString('en-US')
    }
  }
}
</script>
