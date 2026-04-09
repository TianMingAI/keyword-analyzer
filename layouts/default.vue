<template>
  <div class="overflow-x-hidden bg-dark-blue">
    <header>
      <div class="relative bottom-0 font-rubik text-base font-normal text-white">
        <div
          class="realtive mx-auto flex max-w-7xl items-center justify-between py-6 px-4 sm:px-6 md:space-x-10 lg:px-8"
        >
          <a href="/" class="flex text-base text-white font-bold">
            <span class="text-orange">Keyword &nbsp;</span>Analyzer
          </a>
          <a
            data-test="github-repo-link"
            class="inline-flex items-center gap-2 rounded-full bg-dark-medium-blue px-4 py-2 text-sm font-bold text-grey transition-colors duration-100 hover:text-white"
            href="https://github.com/TianMingAI/keyword-analyzer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M8 0.2C3.6 0.2 0 3.8 0 8.2c0 3.5 2.3 6.5 5.5 7.6 0.4 0.1 0.5-0.2 0.5-0.4v-1.5c-2.2 0.5-2.7-1-2.7-1-0.4-0.9-0.9-1.2-0.9-1.2-0.7-0.5 0.1-0.5 0.1-0.5 0.8 0.1 1.2 0.8 1.2 0.8 0.7 1.2 1.9 0.9 2.3 0.7 0.1-0.5 0.3-0.9 0.5-1.1-1.8-0.2-3.6-0.9-3.6-3.9 0-0.9 0.3-1.6 0.8-2.1-0.1-0.2-0.4-1 0.1-2.1 0 0 0.7-0.2 2.2 0.8 0.6-0.2 1.3-0.3 2-0.3s1.4 0.1 2 0.3c1.5-1 2.2-0.8 2.2-0.8 0.5 1.1 0.2 1.9 0.1 2.1 0.5 0.6 0.8 1.3 0.8 2.1 0 3-1.8 3.7-3.6 3.9 0.3 0.3 0.6 0.8 0.6 1.7v2.5c0 0.2 0.1 0.5 0.5 0.4 3.2-1.1 5.5-4.1 5.5-7.6C16 3.8 12.4 0.2 8 0.2Z"
              />
            </svg>
            GitHub
          </a>
          <div
            class="absolute bottom-0 left-0 h-[1px] w-screen bg-medium-blue sm:-translate-x-10"
          ></div>
        </div>
      </div>
    </header>

    <nuxt />

    <footer
      class="mt-24 flex w-full flex-col items-center justify-center space-y-16 bg-gradient-to-br from-[#222839] to-[#12151E] px-4 pt-20 pb-20 font-rubik text-grey sm:mt-32 sm:space-y-20"
    >
      <div class="flex w-full max-w-7xl flex-col items-center justify-center space-y-16">
        <div class="flex flex-col items-center justify-center space-y-4 text-center">
          <p class="text-base font-semibold text-white">Keyword Analyzer</p>
          <p class="max-w-xl text-sm">
            Local-first Semrush keyword analysis. Excel import and saved keywords stay in your
            browser.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: 'Keyword Analyzer',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Import Semrush Excel, analyze keyword opportunities, and save target keywords.'
        }
      ]
    }
  }
}
</script>
