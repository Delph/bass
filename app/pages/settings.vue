<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import ConfirmDialog from '~/components/ConfirmDialog.vue';
import LanguageSelector from '~/components/LanguageSelector.vue';
import NumberInput from '~/components/NumberInput.vue';
import Textarea from '~/components/Textarea.vue';
import { usePersistence } from '~/composables/usePersistence';
import { usePreferences } from '~/composables/usePreferences';
import { useTheme } from '~/composables/useTheme';
import { useToasts } from '~/composables/useToasts';
import { useLanguage } from '~/composables/useLanguage';
import { maxCutoff, minCutoff } from '~/persistence/buckets/preferences';
import { exportText, importText, prune, reset } from '~/persistence/storage';
import { maxWorkers } from '~/workers/pool';

const { formatNumber, translate } = useLanguage();
const { workers, setWorkers, cutoff, setCutoff } = usePreferences();
const { theme, set } = useTheme();
const toasts = useToasts();
const {
  check: checkPersistence,
  dismiss: dismissPersistenceReminder,
  pending: persistencePending,
  persistent,
  reminder: persistenceReminder,
  request: requestPersistence,
  supported: persistenceSupported,
} = usePersistence();
const confirmDelete = ref(false);
const confirmImport = ref(false);
const dataText = ref('');
const persistenceMessage = computed(() => {
  const status = !persistenceSupported.value
    ? 'unsupported'
    : persistent.value === undefined
      ? 'checking'
      : persistent.value
        ? 'persistent'
        : 'best-effort';

  return translate(`settings-storage-status-${status}`);
});
const persistenceRecommended = computed(
  () =>
    persistenceSupported.value &&
    persistent.value === false &&
    persistenceReminder.value,
);
const cutoffTicks = Array.from(
  { length: (maxCutoff - minCutoff) / 5 + 1 },
  (_, index) => minCutoff + index * 5,
);

function deleteAllData() {
  reset();
  confirmDelete.value = false;
  window.location.reload();
}

function dismissReminder() {
  try {
    dismissPersistenceReminder();
  } catch (err) {
    toasts.error(translate('settings-storage-dismiss-error'));
    console.error(err);
  }
}

async function protectLocalData() {
  try {
    const granted = await requestPersistence();

    if (granted)
      toasts.success(translate('settings-storage-protect-success'));
    else {
      dismissReminder();
      toasts.add({
        type: 'warning',
        text: translate('settings-storage-protect-denied'),
      });
    }
  } catch (err) {
    dismissReminder();
    toasts.error(translate('settings-storage-protect-error'));
    console.error(err);
  }
}

function pruneDeletedData() {
  try {
    const removed = prune();

    if (removed === 0) {
      toasts.add({
        type: 'information',
        text: translate('settings-prune-data-empty'),
      });
      return;
    }

    toasts.success(
      translate('settings-prune-data-success', {
        count: removed,
        formatted: formatNumber(removed),
      }),
    );
  } catch {
    toasts.error(translate('settings-prune-data-error'));
  }
}

async function exportData() {
  try {
    dataText.value = await exportText();
  } catch {
    toasts.error(translate('settings-export-data-error'));
  }
}

async function importData() {
  try {
    await importText(dataText.value);
    confirmImport.value = false;
    window.location.reload();
  } catch {
    toasts.error(translate('settings-import-data-error'));
  }
}

function setWorkersFromInput(event: Event) {
  setWorkers(Number((event.target as HTMLInputElement).value));
}

function setCutoffFromInput(event: Event) {
  setCutoff(Number((event.target as HTMLInputElement).value));
}

function setCutoffFromNumber(value: number | null) {
  if (value !== null) setCutoff(Math.round(value));
}

onMounted(checkPersistence);
</script>

<template>
  <h2 class="text-2xl font-bold">
    {{ translate('settings') }}
  </h2>

  <h3 class="font-semibold">
    {{ translate('settings-preferences') }}
  </h3>

  <section class="rounded-xl bg-stone-100 p-2 dark:bg-stone-800">
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <h4 class="font-semibold">
          {{ translate('language') }}
        </h4>
        <LanguageSelector class="sm:w-64" />
      </div>

      <div class="border-t border-stone-200 dark:border-stone-700" />

      <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
      >
        <div>
          <h4 class="font-semibold">
            {{ translate('settings-workers') }}
          </h4>
        </div>
        <div class="flex min-w-0 flex-col gap-2 sm:w-64">
          <div
            class="flex items-center justify-between text-sm text-stone-600 dark:text-stone-400"
          >
            <span>
              {{
                translate('settings-workers-count', {
                  count: workers,
                  formatted: formatNumber(workers),
                })
              }}
            </span>
            <span>
              {{
                translate('settings-workers-max', {
                  formatted: formatNumber(maxWorkers),
                })
              }}
            </span>
          </div>
          <input
            type="range"
            name="workers"
            :value="workers"
            :min="1"
            :max="maxWorkers"
            :step="1"
            class="accent-emerald-700 dark:accent-emerald-500"
            @input="setWorkersFromInput"
          />
          <p class="text-sm text-stone-600 dark:text-stone-400">
            {{ translate('settings-workers-message') }}
          </p>
        </div>
      </div>

      <div class="border-t border-stone-200 dark:border-stone-700" />

      <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
      >
        <div>
          <h4 id="settings-cutoff-label" class="font-semibold">
            {{ translate('settings-cutoff') }}
          </h4>
        </div>
        <div class="flex min-w-0 flex-col gap-2 sm:w-80">
          <div class="text-sm text-stone-600 dark:text-stone-400">
            <span>
              {{
                translate('settings-cutoff-count', {
                  formatted: formatNumber(cutoff),
                })
              }}
            </span>
          </div>
          <div class="grid grid-cols-[minmax(0,1fr)_5rem] items-center gap-x-3">
            <input
              type="range"
              name="cutoff"
              :value="cutoff"
              :min="minCutoff"
              :max="maxCutoff"
              :step="1"
              aria-labelledby="settings-cutoff-label"
              class="col-start-1 row-start-1 m-0 block w-full accent-emerald-700 dark:accent-emerald-500"
              @input="setCutoffFromInput"
            />
            <label class="col-start-2 row-start-1">
              <span class="sr-only">
                {{ translate('settings-cutoff-value') }}
              </span>
              <NumberInput
                name="cutoff-value"
                :value="cutoff"
                :min="minCutoff"
                :max="maxCutoff"
                :step="1"
                class="w-full py-1 text-right tabular-nums"
                @change="setCutoffFromNumber"
              />
            </label>
            <div
              class="relative col-start-1 row-start-2 mx-2 mt-1 h-6 text-xs text-stone-500 dark:text-stone-400"
              aria-hidden="true"
            >
              <span
                v-for="tick of cutoffTicks"
                :key="tick"
                class="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-0.5"
                :style="{
                  left: `${((tick - minCutoff) / (maxCutoff - minCutoff)) * 100}%`,
                }"
              >
                <span class="h-1.5 w-px bg-stone-400 dark:bg-stone-500" />
                <span>{{ formatNumber(tick) }}</span>
              </span>
            </div>
          </div>
          <p class="text-sm text-stone-600 dark:text-stone-400">
            {{ translate('settings-cutoff-message') }}
          </p>
        </div>
      </div>

      <div class="border-t border-stone-200 dark:border-stone-700" />

      <div class="flex flex-col gap-2">
        <h4 class="font-semibold">
          {{ translate('settings-theme') }}
        </h4>
        <div
          class="grid grid-cols-3 gap-2 rounded-lg bg-stone-200 p-2 text-sm font-semibold text-stone-800 dark:bg-stone-800 dark:text-stone-100"
        >
          <button
            type="button"
            @click="() => set('system')"
            class="flex flex-col items-center justify-center gap-2 rounded-xl px-3 py-3"
            :class="{
              'bg-emerald-100': theme === 'system',
              'dark:bg-emerald-700': theme === 'system',
            }"
          >
            <Icon name="lucide:computer" class="text-xl" />
            <span>{{ translate('theme-system') }}</span>
          </button>
          <button
            type="button"
            @click="() => set('dark')"
            class="flex flex-col items-center justify-center gap-2 rounded-xl px-3 py-3"
            :class="{
              'bg-emerald-100': theme === 'dark',
              'dark:bg-emerald-700': theme === 'dark',
            }"
          >
            <Icon name="lucide:moon" class="text-xl" />
            <span>{{ translate('theme-dark') }}</span>
          </button>
          <button
            type="button"
            @click="() => set('light')"
            class="flex flex-col items-center justify-center gap-2 rounded-xl px-3 py-3"
            :class="{
              'bg-emerald-100': theme === 'light',
              'dark:bg-emerald-700': theme === 'light',
            }"
          >
            <Icon name="lucide:sun" class="text-xl" />
            <span>{{ translate('theme-light') }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>

  <h3 class="font-semibold">
    {{ translate('settings-data') }}
  </h3>

  <section
    class="rounded-xl bg-stone-100 p-2 dark:bg-stone-800"
    :class="{
      'ring-2 ring-amber-400 dark:ring-amber-500': persistenceRecommended,
    }"
  >
    <div class="flex items-center justify-between gap-3">
      <h4 class="font-semibold">
        {{ translate('settings-storage-protection') }}
      </h4>
      <span
        v-if="persistenceRecommended"
        class="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-950 dark:bg-amber-700 dark:text-amber-50"
      >
        {{ translate('settings-storage-recommended') }}
      </span>
    </div>
    <p class="mt-1 text-sm text-stone-600 dark:text-stone-400">
      {{ translate('settings-storage-protection-message') }}
    </p>
    <p class="mt-3 text-sm" aria-live="polite">
      {{ persistenceMessage }}
    </p>
    <div
      v-if="persistenceSupported && persistent !== true"
      class="mt-3 flex flex-wrap gap-2"
    >
      <button
        type="button"
        class="rounded-xl bg-stone-200 px-3 py-2 font-semibold disabled:opacity-50 dark:bg-stone-700"
        :disabled="persistencePending || persistent === undefined"
        @click="protectLocalData"
      >
        {{
          translate(
            persistencePending ? 'common-loading' : 'settings-storage-protect',
          )
        }}
      </button>
      <button
        v-if="persistenceRecommended"
        type="button"
        class="rounded-xl px-3 py-2 font-semibold text-stone-600 disabled:opacity-50 dark:text-stone-300"
        :disabled="persistencePending"
        @click="dismissReminder"
      >
        {{ translate('settings-storage-dismiss') }}
      </button>
    </div>
  </section>

  <section class="rounded-xl bg-stone-100 p-2 dark:bg-stone-800">
    <h4 class="font-semibold">
      {{ translate('settings-import-export-data') }}
    </h4>
    <p class="mt-1 text-sm text-stone-600 dark:text-stone-400">
      {{ translate('settings-import-export-data-message') }}
    </p>
    <Textarea
      name="settings-data"
      :value="dataText"
      :placeholder="translate('settings-data-placeholder')"
      class="mt-3 h-48 font-mono text-xs"
      @change="(value) => (dataText = value)"
    />
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-xl bg-stone-200 px-3 py-2 font-semibold dark:bg-stone-700"
        @click="exportData"
      >
        {{ translate('settings-export-data') }}
      </button>
      <button
        type="button"
        class="rounded-xl bg-stone-200 px-3 py-2 font-semibold dark:bg-stone-700"
        :disabled="dataText.trim().length === 0"
        @click="confirmImport = true"
      >
        {{ translate('settings-import-data') }}
      </button>
    </div>
  </section>

  <section class="rounded-xl bg-stone-100 p-2 dark:bg-stone-800">
    <h4 class="font-semibold">
      {{ translate('settings-prune-data') }}
    </h4>
    <p class="mt-1 text-sm text-stone-600 dark:text-stone-400">
      {{ translate('settings-prune-data-message') }}
    </p>
    <button
      type="button"
      class="mt-3 rounded-xl bg-stone-200 px-3 py-2 font-semibold dark:bg-stone-700"
      @click="pruneDeletedData"
    >
      {{ translate('settings-prune-data') }}
    </button>

    <div class="my-3 border-t border-stone-200 dark:border-stone-700" />

    <h4 class="font-semibold">
      {{ translate('settings-delete-data') }}
    </h4>
    <p class="mt-1 text-sm text-stone-600 dark:text-stone-400">
      {{ translate('settings-delete-data-message') }}
    </p>
    <button
      type="button"
      class="mt-3 rounded-xl bg-rose-700 px-3 py-2 font-semibold text-white"
      @click="confirmDelete = true"
    >
      {{ translate('settings-delete-data') }}
    </button>
  </section>

  <ConfirmDialog
    :open="confirmImport"
    :title="translate('settings-import-data-title')"
    :message="translate('settings-import-data-confirm')"
    :confirm="translate('settings-import-data')"
    :cancel="translate('common-cancel')"
    danger
    @cancel="confirmImport = false"
    @confirm="importData"
  />

  <ConfirmDialog
    :open="confirmDelete"
    :title="translate('settings-delete-data-title')"
    :message="translate('settings-delete-data-confirm')"
    :confirm="translate('settings-delete-data')"
    :cancel="translate('common-cancel')"
    danger
    @cancel="confirmDelete = false"
    @confirm="deleteAllData"
  />
</template>
