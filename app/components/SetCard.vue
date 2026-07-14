<script lang="ts" setup>
import { useGame } from '~/composables/useGame';
import { useIcons } from '~/composables/useIcons';
import { useToasts } from '~/composables/useToasts';
import { useTranslation } from '~/composables/useTranslation';
import { useSets, type SavedSet } from '~/composables/useSets';
import SkillPill from '~/components/SkillPill.vue';
import ConfirmDialog from '~/components/ConfirmDialog.vue';
import { computed, ref } from 'vue';
import { formatNumber } from '~/format';
import {
  resolveArmour,
  resolveDecorations,
  setSharePath,
  setShareURL,
  setSkills,
} from '~/set';

const icons = useIcons();
const { translate } = useTranslation();
const toasts = useToasts();
const { removeSet } = useSets();
const { data, slug } = useGame();

const props = defineProps<{ set: SavedSet }>();
const copied = ref(false);
const confirmDelete = ref(false);

const armour = computed(() => resolveArmour(props.set.armour, data.value!));
const decorations = computed(() =>
  resolveDecorations(props.set.decorations, data.value!),
);
const sharePath = computed(() =>
  slug.value ? setSharePath(slug.value, props.set, props.set.name) : '',
);

const skills = computed(() => setSkills(armour.value, decorations.value));

async function copyLink() {
  if (!slug.value) return;

  try {
    await navigator.clipboard.writeText(
      setShareURL(window.location.origin, slug.value, props.set, props.set.name),
    );
    copied.value = true;
    toasts.success(translate('set-link-copied'));
    setTimeout(() => (copied.value = false), 1500);
  } catch (error) {
    toasts.error(translate('set-copy-link-error'));
  }
}

function deleteSet() {
  removeSet(props.set.id);
  confirmDelete.value = false;
}

const groupedDecorations = computed(() => {
  const grouped = new Map<string, { slug: string; count: number }>();

  for (const collection of Object.values(props.set.decorations)) {
    for (const id of collection) {
      const decoration = data.value?.decorations.find((d) => d.id === id);

      if (!decoration) continue;

      const group = grouped.get(decoration.slug);

      if (group) ++group.count;
      else grouped.set(decoration.slug, { slug: decoration.slug, count: 1 });
    }
  }

  return [...grouped.values()];
});
</script>

<template>
  <div
    class="bg-stone-100 dark:bg-stone-800 rounded-xl p-2 flex flex-wrap gap-2"
  >
    <div class="w-full flex justify-between items-center gap-3">
      <span class="min-w-0 flex-1 truncate">{{ set.name || translate('set-unnamed') }}</span>
      <div class="flex shrink-0 justify-between items-center gap-3">
        <NuxtLink
          class="size-10 bg-stone-200 dark:bg-stone-700 rounded-xl flex items-center justify-center"
          :to="sharePath"
        >
          <Icon name="lucide:view" />
        </NuxtLink>
        <button
          type="button"
          class="size-10 bg-stone-200 dark:bg-stone-700 rounded-xl flex items-center justify-center"
          :title="translate(copied ? 'set-link-copied' : 'set-copy-link')"
          @click="copyLink"
        >
          <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" />
        </button>
        <button
          type="button"
          class="size-10 bg-stone-200 dark:bg-stone-700 rounded-xl flex items-center justify-center"
          :title="translate('set-delete')"
          @click="confirmDelete = true"
        >
          <Icon name="lucide:trash" />
        </button>
      </div>
    </div>
    <ConfirmDialog
      :open="confirmDelete"
      :title="translate('set-delete-title')"
      :message="translate('set-delete-message')"
      :confirm="translate('set-delete')"
      :cancel="translate('common-cancel')"
      danger
      @cancel="confirmDelete = false"
      @confirm="deleteSet"
    />
    <div class="w-full flex flex-wrap gap-1">
      <SkillPill
        v-for="(points, skill) in skills"
        :skill="skill"
        :points="points"
      />
    </div>
    <div class="min-w-0 flex-1">
      <div v-for="(piece, slot) in armour" class="flex gap-2 items-center">
        <img :src="icons.armour(slot)" class="w-4 shrink-0" />
        <span class="truncate">{{ translate(`armour-${slot}-${piece.slug}`) }}</span>
      </div>
    </div>
    <div
      v-if="groupedDecorations.length > 0"
      class="flex w-full flex-wrap gap-1"
    >
      <div
        v-for="decoration in groupedDecorations"
        :key="decoration.slug"
        class="rounded-full bg-stone-200 px-2 py-0.5 text-sm text-stone-800 dark:bg-stone-700 dark:text-stone-100"
      >
        {{ translate(`decoration-${decoration.slug}`) }}
        <span
          v-if="decoration.count > 1"
          class="text-xs text-stone-600 dark:text-stone-300"
        >
          {{ translate('set-decoration-quantity', { formatted: formatNumber(decoration.count) }) }}
        </span>
      </div>
    </div>
  </div>
</template>
