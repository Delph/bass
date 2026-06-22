<script lang="ts" setup>
import { useTranslation } from "~/composables/useTranslation";

const { translate } = useTranslation();
</script>

<template>
  <h2 class="text-2xl font-bold">
    {{ translate("navigation-tab-home") }}
  </h2>
</template>
