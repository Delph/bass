<script lang="ts" setup>
import { useTranslation } from '~/composables/useTranslation';
import { locales, type LocaleSlug } from '~/translation';
import Select from "~/components/Select.vue";

const { locale, pending, set, translate } = useTranslation();
</script>

<template>
  <label>
    <span class="sr-only">{{ translate('language') }}</span>
    <Select
      name="language"
      :value="locale"
      :disabled="pending"
      :options="Object.keys(locales).map(slug => ({value: slug, label: locales[slug as LocaleSlug].name}))"
      @change="
        (value) => set(value as LocaleSlug)
      "
    />
  </label>
</template>
