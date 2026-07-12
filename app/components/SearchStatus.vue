<script lang="ts" setup>
import { useSearch } from '~/composables/useSearch';
import { useTranslation } from '~/composables/useTranslation';
import { formatNumber, formatPercent } from '~/format';

const search = useSearch();
const { translate } = useTranslation();
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
    <span
      class="search-dial relative flex size-8 shrink-0 items-center justify-center rounded-full"
      :class="{
        'text-emerald-300': search.session.value.status === 'completed',
        'text-red-300': search.session.value.status === 'error',
        'text-white': !['completed', 'error'].includes(
          search.session.value.status,
        ),
      }"
      :style="{
        '--search-progress': `${Math.floor(search.progress.value * 100)}%`,
      }"
    >
      <span
        class="absolute inset-1 flex items-center justify-center rounded-full bg-emerald-700 text-sm dark:bg-emerald-900"
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
    </span>
    <span class="hidden text-xs font-semibold sm:block">
      {{ formatPercent(search.progress.value, 0, { roundingMode: 'floor' }) }} /
      {{ formatNumber(search.results.value.length) }}
    </span>
  </NuxtLink>
</template>

<style scoped>
.search-dial {
  background: conic-gradient(
    currentColor var(--search-progress),
    rgb(128 128 128) 0
  );
}
</style>
