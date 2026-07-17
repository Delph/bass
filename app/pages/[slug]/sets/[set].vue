<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useGame, useIcons } from '#imports';
import { useLanguage } from '~/composables/useLanguage';
import { useSets } from '~/composables/useSets';
import { useToasts } from '~/composables/useToasts';
import {
  defence,
  effective,
  groupDecorations,
  parseWireID,
  resistance,
  resistances,
  resolveArmour,
  resolveDecorations,
  setSharePath,
  setShareURL,
  setSkills,
  validateArmourSet,
} from '~/set';
import Field from '~/components/Field.vue';
import { getEffect, getSkillEffectKey } from '~/skills';
import Textarea from '~/components/Textarea.vue';
import ConfirmDialog from '~/components/ConfirmDialog.vue';

const route = useRoute();
const router = useRouter();

const game = useGame();
const icons = useIcons();
const { formatDateTime, formatNumber, translate } = useLanguage();
const { findSet, removeSet, saveSet } = useSets();
const toasts = useToasts();

const wireId = computed(() => {
  const set = route.params.set;

  if (Array.isArray(set)) return set[0] ?? '';

  return set;
});

const resolved = ref<ReturnType<typeof resolveSet> | null>(null);
const set = computed(() => resolved.value?.set ?? null);
const saved = computed(() => (set.value ? findSet(set.value) : null));
const sharedName = computed(() => {
  const value = route.query.name;

  return typeof value === 'string' ? value : '';
});

const rename = ref(false);
const name = ref('');
const notes = ref('');
const copied = ref(false);
const confirmDelete = ref(false);
const displayName = computed(() => name.value || translate('set-unnamed'));
const dirty = computed(
  () =>
    !saved.value ||
    saved.value.name !== name.value.trim() ||
    saved.value.notes !== notes.value,
);
const stats = computed(() => {
  if (!resolved.value || !game.game.value) return null;

  const pieces = Object.values(resolved.value.armour);
  const rawDefence = defence(pieces);

  return {
    rawDefence,
    resistances: resistances(pieces),
    effectiveDefence: effective(rawDefence, 0),
    effectiveResistances: game.game.value.elements.map((element) =>
      effective(rawDefence, resistance(pieces, element)),
    ),
  };
});
const skillEffects = computed(() => {
  if (!resolved.value || !game.data.value) return [];

  return Object.entries(
    setSkills(resolved.value.armour, resolved.value.decorations),
  )
    .map(([skill, points]) => getEffect(game.data.value!.skills, skill, points))
    .filter((effect) => effect !== null);
});

function resolveSet() {
  if (!game.data.value) throw new Error('Game data is not loaded');

  const id = wireId.value;
  if (!id) throw new Error('Missing set ID');

  const set = parseWireID(id);
  const armour = resolveArmour(set.armour, game.data.value);
  const decorations = resolveDecorations(set.decorations, game.data.value);

  if (!validateArmourSet(armour, decorations))
    throw new Error('Invalid armour set');

  return { set, armour, decorations };
}

function loadSet() {
  try {
    resolved.value = resolveSet();
  } catch (error) {
    resolved.value = null;
    toasts.error(translate('set-invalid'));

    if (game.slug.value)
      void router.replace(`/${encodeURIComponent(game.slug.value)}/sets`);
  }
}

watch(
  [wireId, () => game.data.value],
  ([, data]) => {
    if (!data) {
      resolved.value = null;
      return;
    }

    loadSet();
  },
  { immediate: true },
);

watch(
  [wireId, () => saved.value?.id],
  () => {
    name.value = saved.value?.name || sharedName.value;
    notes.value = saved.value?.notes ?? '';
    rename.value = false;
    syncNameQuery();
  },
  { immediate: true },
);

watch(name, syncNameQuery);

function save() {
  if (!set.value) return;

  saveSet(set.value, { name: name.value, notes: notes.value });
  toasts.success(translate('set-saved'));
  rename.value = false;
}

function deleteSet() {
  if (!saved.value || !game.slug.value) return;

  removeSet(saved.value.id);
  confirmDelete.value = false;
  void router.replace(`/${encodeURIComponent(game.slug.value)}/sets`);
}

function syncNameQuery() {
  if (!set.value || !game.slug.value) return;

  const path = setSharePath(game.slug.value, set.value, name.value);

  if (route.fullPath !== path) void router.replace(path);
}

async function copyLink() {
  if (!set.value || !game.slug.value) return;

  try {
    await navigator.clipboard.writeText(
      setShareURL(
        window.location.origin,
        game.slug.value,
        set.value,
        name.value,
      ),
    );
    copied.value = true;
    toasts.success(translate('set-link-copied'));
    setTimeout(() => (copied.value = false), 1500);
  } catch (error) {
    toasts.error(translate('set-copy-link-error'));
  }
}
</script>

<template>
  <template v-if="resolved">
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-3">
        <h2 v-if="!rename" class="min-w-0 flex-1 truncate text-2xl font-bold">
          {{ displayName }}
        </h2>
        <Field
          v-else
          name="set-name"
          :value="name"
          :placeholder="translate('set-unnamed')"
          @change="(s) => (name = s)"
        />
        <button
          v-if="!rename"
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-200 dark:bg-stone-800"
          @click="rename = true"
        >
          <Icon name="lucide:pencil" />
        </button>
        <button
          v-if="rename"
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-200 dark:bg-stone-800"
          @click="rename = false"
        >
          <Icon name="lucide:check" />
        </button>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <button
          type="button"
          class="flex h-10 items-center justify-center gap-2 rounded-xl bg-stone-200 px-2 text-sm dark:bg-stone-800"
          :class="dirty ? 'text-amber-700 dark:text-amber-300' : ''"
          @click="save"
        >
          <Icon :name="saved ? 'lucide:save' : 'lucide:bookmark-plus'" />
          <span>{{ translate('set-save') }}</span>
        </button>
        <button
          type="button"
          class="flex h-10 items-center justify-center gap-2 rounded-xl bg-stone-200 px-2 text-sm dark:bg-stone-800"
          :title="translate(copied ? 'set-link-copied' : 'set-copy-link')"
          @click="copyLink"
        >
          <Icon
            :name="copied ? 'lucide:check' : 'lucide:copy'"
            :class="copied ? 'text-emerald-700 dark:text-emerald-300' : ''"
          />
          <span>{{ translate('set-copy-link') }}</span>
        </button>
        <button
          v-if="saved"
          type="button"
          class="flex h-10 items-center justify-center gap-2 rounded-xl bg-stone-200 px-2 text-sm dark:bg-stone-800"
          :title="translate('set-delete')"
          @click="confirmDelete = true"
        >
          <Icon name="lucide:trash" />
          <span>{{ translate('set-delete') }}</span>
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

    <h3 class="font-semibold text-stone-900 dark:text-stone-100">
      {{ translate('set-section-armour') }}
    </h3>
    <div class="flex flex-col gap-2">
      <div
        v-for="(piece, slot) in resolved.armour"
        class="flex items-center gap-2 w-full rounded-xl bg-stone-200 dark:bg-stone-800 p-2"
      >
        <img class="h-6 w-6" :src="icons.armour(slot)" /> {{ translate(`armour-${slot}-${piece.slug}`) }}
      </div>
    </div>

    <h3 class="font-semibold text-stone-900 dark:text-stone-100">
      {{ translate('set-section-decorations') }}
    </h3>
    <div class="flex flex-col gap-2">
      <div
        v-for="{ decoration, quantity } in groupDecorations(
          Object.values(resolved.decorations).flat(),
        )"
        class="bg-stone-200 dark:bg-stone-800 p-2 rounded-xl"
      >
        {{
          translate('set-decoration-skill', {
            formatted: formatNumber(quantity),
            decoration: translate(`decoration-${decoration.slug}`),
            skill: translate(`skill-${decoration.skill.skill}`),
          })
        }}
      </div>
    </div>

    <h3 class="font-semibold text-stone-900 dark:text-stone-100">
      {{ translate('set-section-defence') }}
    </h3>
    <table
      class="w-full border-collapse overflow-hidden rounded-xl text-sm text-stone-800 dark:text-stone-100"
    >
      <thead>
        <tr class="border-b border-stone-300 dark:border-stone-700">
          <th
            class="border-r border-stone-300 p-1 text-left text-[0.65rem] uppercase text-stone-500 dark:border-stone-700 dark:text-stone-400"
          ></th>
          <th
            class="border-r border-stone-300 p-1 text-center dark:border-stone-700"
          >
            <img class="w-6 h-6 mx-auto" :src="icons.defence()" />
          </th>
          <th
            class="border-r border-stone-300 p-1 text-center last:border-r-0 dark:border-stone-700"
            v-for="element in game.game.value?.elements"
          >
            <img class="w-6 h-6 mx-auto" :src="icons.element(element)" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b border-stone-300 dark:border-stone-700">
          <th
            scope="row"
            class="border-r border-stone-300 p-1 text-left text-[0.65rem] uppercase text-stone-500 dark:border-stone-700 dark:text-stone-400"
          >
            {{ translate('set-stat-raw') }}
          </th>
          <td
            class="border-r border-stone-300 p-1 text-right dark:border-stone-700"
          >
            {{ formatNumber(stats?.rawDefence ?? 0) }}
          </td>
          <td
            v-for="element of game.game.value?.elements"
            :key="element"
            class="border-r border-stone-300 p-1 text-right last:border-r-0 dark:border-stone-700"
          >
            {{ formatNumber(stats?.resistances[element] ?? 0) }}
          </td>
        </tr>
        <tr>
          <th
            scope="row"
            class="border-r border-stone-300 p-1 text-left text-[0.65rem] uppercase text-stone-500 dark:border-stone-700 dark:text-stone-400"
          >
            {{ translate('set-stat-effective') }}
          </th>
          <td
            class="border-r border-stone-300 p-1 text-right dark:border-stone-700"
          >
            {{ formatNumber(stats?.effectiveDefence ?? 0) }}
          </td>
          <td
            v-for="efd of stats?.effectiveResistances ?? []"
            class="border-r border-stone-300 p-1 text-right last:border-r-0 dark:border-stone-700"
          >
            {{ formatNumber(efd) }}
          </td>
        </tr>
      </tbody>
    </table>

    <h3 class="font-semibold text-stone-900 dark:text-stone-100">
      {{ translate('set-section-skills') }}
    </h3>
    <div class="flex flex-wrap gap-1">
      <div v-for="effect in skillEffects">
        <div
          class="text-lg"
          :class="
            effect.points < 0
              ? 'text-rose-700 dark:text-rose-300'
              : 'text-emerald-700 dark:text-emerald-300'
          "
        >
          {{ translate(`skill-${effect.skill}`) }}
        </div>
        <div class="pl-4">
          {{ translate(getSkillEffectKey(effect.skill, effect.points)) }}
        </div>
      </div>
    </div>

    <h3 class="font-semibold text-stone-900 dark:text-stone-100">
      {{ translate('set-section-notes') }}
    </h3>
    <Textarea
      name="set-notes"
      :value="notes"
      :placeholder="translate('set-notes')"
      @change="(s) => (notes = s)"
      class="h-16"
    />

    <div v-if="saved" class="text-gray-500 text-center">
      <div>
        {{
          translate('set-created-at', {
            timestamp: formatDateTime(new Date(saved.createdAt)),
          })
        }}
      </div>
      <div v-if="saved.updatedAt">
        {{
          translate('set-updated-at', {
            timestamp: formatDateTime(new Date(saved.updatedAt)),
          })
        }}
      </div>
    </div>
  </template>
</template>
