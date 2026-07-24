<script lang="ts" setup>
import { useNuxtApp, useRuntimeConfig } from '#app';

const { $rollbar } = useNuxtApp();
const configured = Boolean(useRuntimeConfig().public.rollbarAccessToken);
const text = {
  title: 'Rollbar diagnostics',
  description: 'These controls are available in development builds only.',
  unconfigured: 'Set ROLLBAR_CLIENT_TOKEN to enable test reports.',
  messageButton: 'Send test message',
  errorButton: 'Trigger test error',
};

function sendMessage() {
  $rollbar.info('Test message from Vue.js');
}

function triggerError() {
  throw new Error('Test error from Vue.js');
}
</script>

<template>
  <section class="rounded-xl border border-dashed border-amber-500 p-3">
    <h3 class="font-semibold"><span v-text="text.title" /></h3>
    <p class="mt-1 text-sm text-stone-600 dark:text-stone-400">
      <span v-text="text.description" />
    </p>
    <p
      v-if="!configured"
      class="mt-2 text-sm text-amber-700 dark:text-amber-300"
    >
      <span v-text="text.unconfigured" />
    </p>
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-xl bg-stone-200 px-3 py-2 font-semibold disabled:opacity-50 dark:bg-stone-700"
        :disabled="!configured"
        @click="sendMessage"
      >
        <span v-text="text.messageButton" />
      </button>
      <button
        type="button"
        class="rounded-xl bg-rose-700 px-3 py-2 font-semibold text-white disabled:opacity-50"
        :disabled="!configured"
        @click="triggerError"
      >
        <span v-text="text.errorButton" />
      </button>
    </div>
  </section>
</template>
