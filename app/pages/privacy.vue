<script lang="ts" setup>
import { definePageMeta, useSeoMeta } from '#imports';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useLanguage } from '~/composables/useLanguage';

definePageMeta({ privacyUpdatedAt: '2026-07-23T12:00:00Z' });

const route = useRoute();
const { formatDateTime } = useLanguage();
const privacyUpdated = computed(() =>
  formatDateTime(new Date(String(route.meta.privacyUpdatedAt)), {
    month: 'long',
    hour: undefined,
    minute: undefined,
    second: undefined,
  }),
);

useSeoMeta({
  title: 'Privacy notice | BASS',
});
</script>

<template>
  <!-- translation-audit: ignore-start -->
  <article class="flex flex-col gap-6 pb-8 leading-relaxed">
    <div>
      <h2 class="text-2xl font-bold">Privacy notice</h2>
      <p class="mt-1 text-sm text-stone-600 dark:text-stone-400">
        Last updated: {{ privacyUpdated }}
      </p>
    </div>

    <p>
      This notice explains how the BASS project handles information when you use
      the BASS armour set search tool. The BASS project is the data controller
      for the processing described here. Privacy questions can be sent to
      <a
        class="font-semibold text-emerald-700 underline dark:text-emerald-400"
        href="mailto:privacy@bobbo.dev"
      >
        privacy@bobbo.dev</a
      >.
    </p>

    <section class="flex flex-col gap-2">
      <h3 class="text-xl font-semibold">Information stored on your device</h3>
      <p>
        BASS stores preferences, saved sets, search history, and related tool
        data in your browser so that its features work. This information remains
        on your device and does not leave your device.
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h3 class="text-xl font-semibold">Error reporting</h3>
      <p>
        BASS collects diagnostic information when a technical failure occurs so
        that problems can be identified and fixed. A crash report may include
        details of the failure and its technical context, such as the BASS
        version, browser or device information, the affected part of the tool,
        and related connectivity information.
      </p>
      <p>
        Reports are not linked to an account or known individual and are
        configured to avoid the content you enter or save in BASS. The
        crash-reporting provider receives the connection information needed to
        deliver a report, but BASS does not use crash reports to identify users
        or build user profiles.
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h3 class="text-xl font-semibold">Why this information is processed</h3>
      <p>
        The project has a legitimate interest in diagnosing failures,
        maintaining security, and providing a reliable service. Crash-report
        information is used only for those purposes.
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h3 class="text-xl font-semibold">Service providers and transfers</h3>
      <p>
        A specialist crash-reporting provider processes reports on behalf of the
        project. This processing may take place in the United States. The
        provider uses contractual and other safeguards for international data
        transfers. Further information about the current provider and safeguards
        is available from the project contact address.
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h3 class="text-xl font-semibold">Retention</h3>
      <p>
        Crash reports are kept only for as long as they are reasonably needed to
        investigate and prevent technical failures, and then expire or are
        deleted under the crash-reporting provider's retention settings.
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h3 class="text-xl font-semibold">Your rights</h3>
      <p>
        Data protection law gives you rights over your personal information. The
        rights that apply depend on the circumstances and the reason the
        information is processed. To ask a privacy question or make a request,
        contact
        <a
          class="font-semibold text-emerald-700 underline dark:text-emerald-400"
          href="mailto:privacy@bobbo.dev"
        >
          privacy@bobbo.dev</a
        >. You can also raise a concern with the
        <a
          class="font-semibold text-emerald-700 underline dark:text-emerald-400"
          href="https://ico.org.uk/make-a-complaint/"
        >
          Information Commissioner's Office</a
        >.
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h3 class="text-xl font-semibold">Changes to this notice</h3>
      <p>
        This notice will be updated when the project's information handling
        changes. The date at the top shows when it was last revised.
      </p>
    </section>
  </article>
  <!-- translation-audit: ignore-end -->
</template>
