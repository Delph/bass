<script lang="ts" setup>
import { useTranslation } from '~/composables/useTranslation';
import { languages, type LanguageSlug } from '~/translation';
import Select from "~/components/Select.vue";

const { language, pending, set, translate } = useTranslation();
</script>

<template>
  <label>
    <span class="sr-only">Language</span>
    <Select
      :name="translate('language')"
      :value="language"
      :disabled="pending"
      :options="Object.keys(languages).map(slug => ({value: slug, label: languages[slug as LanguageSlug].name}))"
      @change="
        (value) => set(value as LanguageSlug)
      "
    />
  </label>
</template>
