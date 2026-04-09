<template>
  <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
    <label class="min-w-0 flex-1 lg:max-w-sm">
      <span class="sr-only">Search keywords</span>
      <input
        data-test="keyword-search"
        type="search"
        name="keyword-search"
        autocomplete="off"
        class="w-full rounded-lg bg-medium-blue px-4 py-2 text-sm text-white ring-1 ring-grey/10 focus-visible:ring-2 focus-visible:ring-orange"
        placeholder="Search keyword…"
        :value="query"
        @input="$emit('update:query', $event.target.value)"
      />
    </label>

    <select
      data-test="saved-filter"
      name="saved-filter"
      autocomplete="off"
      class="rounded-lg bg-medium-blue px-4 py-2 text-sm font-bold text-white ring-1 ring-grey/10 focus-visible:ring-2 focus-visible:ring-orange"
      :value="savedFilter"
      @change="$emit('update:saved-filter', $event.target.value)"
    >
      <option value="all">All keywords</option>
      <option value="saved">Saved only</option>
      <option value="unsaved">Unsaved only</option>
    </select>

    <div class="flex flex-wrap justify-end gap-3">
      <div class="relative flex items-center space-x-2">
        <button
          type="button"
          class="z-10 flex items-center px-4 py-2 font-medium text-center text-white bg-medium-blue border-medium-blue rounded-lg space-x-2"
          @click="kd.visible = !kd.visible"
        >
          <span v-if="kdRange.length" class="mr-2">KD: {{ kdRange[0] }}-{{ kdRange[1] }}%</span>
          <span v-else class="text-grey mr-6">KD %</span>
          <img src="~/assets/icons/drogdown.svg" width="12" alt="" />
        </button>
        <button
          v-if="kdRange.length"
          type="button"
          class="flex items-center justify-center rounded-lg bg-medium-blue p-2"
          aria-label="Clear KD filter"
          @click="clearKd"
        >
          <img src="~/assets/icons/close.svg" width="14" alt="" />
        </button>
        <div
          v-if="kd.visible"
          class="absolute top-full left-0 mt-2 bg-medium-blue rounded-lg shadow-lg py-2 z-20 w-full"
        >
          <button
            v-for="(item, index) in kd.selections"
            :key="`kd-${index}`"
            type="button"
            class="flex w-full justify-center px-4 py-2"
            @click="applyKd(item)"
          >
            <span class="text-grey cursor-pointer">{{ item[0] }}-{{ item[1] }}%</span>
          </button>

          <div class="border-t border-grey m-2"></div>

          <div class="px-2 py-1.5 space-y-2">
            <span class="text-white">Custom range</span>
            <input
              v-model="kd.min"
              type="number"
              class="w-full rounded-lg bg-dark-medium-blue px-4 py-2 text-sm text-white focus-visible:ring-2 focus-visible:ring-orange"
              name="kd-min"
              autocomplete="off"
              placeholder="From…"
            />
            <input
              v-model="kd.max"
              type="number"
              class="w-full rounded-lg bg-dark-medium-blue px-4 py-2 text-sm text-white focus-visible:ring-2 focus-visible:ring-orange"
              name="kd-max"
              autocomplete="off"
              placeholder="To…"
            />
            <button
              type="button"
              class="w-full py-1.5 items-center justify-center rounded-lg bg-orange text-sm font-medium text-white shadow-button-primary transition-colors duration-100 hover:bg-orangeHover active:bg-orange focus-visible:ring-2 focus-visible:ring-orange"
              @click="applyKd([kd.min, kd.max])"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div class="relative flex items-center space-x-2">
        <button
          type="button"
          class="z-10 flex items-center px-4 py-2 font-medium text-center text-white bg-medium-blue border-medium-blue rounded-lg space-x-2"
          @click="volume.visible = !volume.visible"
        >
          <span v-if="volumeRange.length && volumeRange[1] === 99999999" class="mr-2">
            Volume: {{ formatNumber(volumeRange[0]) }}+
          </span>
          <span v-else-if="volumeRange.length" class="mr-2">
            Volume: {{ formatNumber(volumeRange[0]) }}-{{ formatNumber(volumeRange[1]) }}
            &nbsp;
          </span>
          <span v-else class="text-grey mr-14">Volume</span>
          <img src="~/assets/icons/drogdown.svg" width="12" alt="" />
        </button>
        <button
          v-if="volumeRange.length"
          type="button"
          class="flex items-center justify-center rounded-lg bg-medium-blue p-2"
          aria-label="Clear volume filter"
          @click="clearVolume"
        >
          <img src="~/assets/icons/close.svg" width="14" alt="" />
        </button>
        <div
          v-if="volume.visible"
          class="absolute top-full left-0 mt-2 bg-medium-blue rounded-lg shadow-lg py-2 z-20 w-full"
        >
          <button
            v-for="(item, index) in volume.selections"
            :key="`volume-${index}`"
            type="button"
            class="flex w-full px-4 py-2"
            @click="applyVolume(item)"
          >
            <span v-if="item[1] === 99999999" class="text-grey cursor-pointer">
              {{ formatNumber(item[0]) }}+
            </span>
            <span v-else class="text-grey cursor-pointer">
              {{ formatNumber(item[0]) }}-{{ formatNumber(item[1]) }}
            </span>
          </button>

          <div class="border-t border-grey m-2"></div>

          <div class="px-2 py-1.5 space-y-2">
            <span class="text-white">Custom range</span>
            <input
              v-model="volume.min"
              type="number"
              class="w-full rounded-lg bg-dark-medium-blue px-4 py-2 text-sm text-white focus-visible:ring-2 focus-visible:ring-orange"
              name="volume-min"
              autocomplete="off"
              placeholder="From…"
            />
            <input
              v-model="volume.max"
              type="number"
              class="w-full rounded-lg bg-dark-medium-blue px-4 py-2 text-sm text-white focus-visible:ring-2 focus-visible:ring-orange"
              name="volume-max"
              autocomplete="off"
              placeholder="To…"
            />
            <button
              type="button"
              class="w-full py-1.5 items-center justify-center rounded-lg bg-orange text-sm font-medium text-white shadow-button-primary transition-colors duration-100 hover:bg-orangeHover active:bg-orange focus-visible:ring-2 focus-visible:ring-orange"
              @click="applyVolume([volume.min, volume.max])"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="flex w-full min-w-max flex-row items-center justify-center space-x-2 rounded-lg bg-medium-blue py-2 px-3 text-sm font-semibold text-white shadow-button-secondary transition-colors duration-100 hover:bg-medium-blueHover active:bg-medium-blue focus-visible:ring-2 focus-visible:ring-orange sm:w-fit sm:px-5 sm:text-base"
        @click="$emit('export')"
      >
        <span>Export Excel</span>
      </button>
    </div>
  </div>
</template>

<script>
const KD_SELECTIONS = [
  [85, 100],
  [70, 84],
  [50, 69],
  [30, 49],
  [15, 29],
  [0, 14]
]

const VOLUME_SELECTIONS = [
  [100001, 99999999],
  [10001, 100000],
  [1001, 10000],
  [101, 1000],
  [11, 100],
  [1, 10]
]

export default {
  name: 'KeywordFilters',

  props: {
    kdRange: {
      type: Array,
      default: () => []
    },
    volumeRange: {
      type: Array,
      default: () => []
    },
    query: {
      type: String,
      default: ''
    },
    savedFilter: {
      type: String,
      default: 'all'
    }
  },

  data() {
    return {
      kd: {
        visible: false,
        selections: KD_SELECTIONS,
        min: '',
        max: ''
      },
      volume: {
        visible: false,
        selections: VOLUME_SELECTIONS,
        min: '',
        max: ''
      }
    }
  },

  watch: {
    kdRange: {
      immediate: true,
      handler(range) {
        this.kd.min = range.length ? String(range[0]) : ''
        this.kd.max = range.length ? String(range[1]) : ''
      }
    },
    volumeRange: {
      immediate: true,
      handler(range) {
        this.volume.min = range.length ? String(range[0]) : ''
        this.volume.max = range.length ? String(range[1]) : ''
      }
    }
  },

  methods: {
    applyKd(range) {
      this.kd.visible = false
      this.$emit('update:kd-range', range)
    },

    clearKd() {
      this.applyKd([])
    },

    applyVolume(range) {
      this.volume.visible = false
      this.$emit('update:volume-range', range)
    },

    clearVolume() {
      this.applyVolume([])
    },

    formatNumber(value) {
      if (!value) {
        return '0'
      }

      return Number.parseInt(value, 10).toLocaleString('en-US')
    }
  }
}
</script>
