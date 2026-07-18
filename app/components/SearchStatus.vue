<script lang="ts" setup>
import { useSearch } from '~/composables/useSearch';
import { useLanguage } from '~/composables/useLanguage';
import ProgressRing from '~/components/ProgressRing.vue';

const search = useSearch();
const { formatNumber, formatPercent, translate } = useLanguage();
</script>

<template>
  <NuxtLink
    v-if="search.hasSession.value"
    :to="`/${encodeURIComponent(search.session.value.slug!)}/search/results`"
    :aria-label="
      translate('search-status-label', {
        status: translate(`search-status-${search.session.value.status}`),
        progress: formatPercent(search.progress.value, 0, {
          roundingMode: 'floor',
        }),
        count: search.results.value.length,
        formatted: formatNumber(search.results.value.length),
      })
    "
    :title="
      translate('search-status-label', {
        status: translate(`search-status-${search.session.value.status}`),
        progress: formatPercent(search.progress.value, 0, {
          roundingMode: 'floor',
        }),
        count: search.results.value.length,
        formatted: formatNumber(search.results.value.length),
      })
    "
    class="flex items-center justify-end gap-2 rounded-full px-1 py-0.5 text-white hover:bg-emerald-800 dark:hover:bg-emerald-800"
  >
    <ProgressRing
      :value="search.progress.value"
      class="size-8 rounded-full"
      :class="{
        'text-emerald-300': search.session.value.status === 'completed',
        'text-red-300': search.session.value.status === 'error',
        'text-white': !['completed', 'error'].includes(
          search.session.value.status,
        ),
      }"
    >
      <span
        class="flex size-6 items-center justify-center rounded-full bg-emerald-700 text-sm dark:bg-emerald-900"
      >
        <Icon
          :name="
            search.session.value.status === 'completed'
              ? 'lucide:check'
              : search.session.value.status === 'error'
                ? 'lucide:triangle-alert'
                : 'lucide:search'
          "
        />
      </span>
    </ProgressRing>
    <span class="hidden text-xs font-semibold sm:block">
      {{ formatPercent(search.progress.value, 0, { roundingMode: 'floor' }) }} /
      {{ formatNumber(search.results.value.length) }}
    </span>
  </NuxtLink>
</template>
