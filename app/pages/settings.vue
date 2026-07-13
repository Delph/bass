<script lang="ts" setup>
import { ref } from 'vue';
import ConfirmDialog from '~/components/ConfirmDialog.vue';
import LanguageSelector from '~/components/LanguageSelector.vue';
import Textarea from '~/components/Textarea.vue';
import { usePreferences } from '~/composables/usePreferences';
import { useTheme } from '~/composables/useTheme';
import { useTranslation } from '~/composables/useTranslation';
import { exportText, importText, reset } from '~/persistence/storage';
import { maxWorkers } from '~/workers/pool';

const { translate } = useTranslation();
const { workers, setWorkers } = usePreferences();
const { theme, set } = useTheme();
const confirmDelete = ref(false);
const confirmImport = ref(false);
const dataText = ref('');

function deleteAllData() {
  reset();
  confirmDelete.value = false;
  window.location.reload();
}

async function exportData() {
  dataText.value = await exportText();
}

async function importData() {
  await importText(dataText.value);
  confirmImport.value = false;
  window.location.reload();
}

function setWorkersFromInput(event: Event) {
  setWorkers(Number((event.target as HTMLInputElement).value));
}
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
              {{ translate('settings-workers-count', { count: workers }) }}
            </span>
            <span>
              {{ translate('settings-workers-max', { count: maxWorkers }) }}
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

  <section class="rounded-xl bg-stone-100 p-2 dark:bg-stone-800">
    <h4 class="font-semibold">
      {{ translate('settings-import-export-data') }}
    </h4>
    <p class="mt-1 text-sm text-stone-600 dark:text-stone-400">
      {{ translate('settings-import-export-data-message') }}
    </p>
    <Textarea
      :name="translate('settings-data')"
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
