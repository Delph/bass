import { useState } from "#app";
import { computed, watch } from "vue";
import { useRoute } from "vue-router";

import { range } from "~/utility";
import { type LocaleSlug, type Translations } from '~/translation';

import { type Game, type GameData, ARMOUR_SLOTS, type ArmourPiece, type ArmourSlot, type SkillDefinition, type Decoration } from "~/game/types";
import { usePreferences } from './usePreferences';


type GameDataLoading = {
  done: number;
  total: number;
};

const games: Game[] = [
  // {
  //   slug: "mhf",
  //   village: [...range(1, 7).map(r => ({rank: r, label: `${r}★`}))],
  //   guild: [
  //     ...range(1, 4).map(r => ({rank: r, label: `${r}★`, group: 'low-rank'})),
  //     ...range(4, 6).map(r => ({rank: r, label: `${r}★`, group: 'high-rank'}))
  //   ],
    // elements: ['fire', 'water', 'thunder', 'dragon'],
  //   features: {
  //     decorations: true
  //   }
  // },
  {
    slug: "mhfu",
    village: [
      ...range(1, 7).map(r => ({rank: r, label: `${r}★`, group: "elder"})),
      ...range(7, 10).map(r => ({rank: r, label: `${r}★`, group: "nekoht"}))
    ],
    guild: [
      ...range(1, 4).map(r => ({rank: r, label: `${r}★`, group: 'low-rank'})),
      ...range(4, 7).map(r => ({rank: r, label: `${r}★`, group: 'high-rank'})),
      ...range(7, 10).map(r => ({rank: r, label: `G${r - 6}★`, group: 'g-rank'}))
    ],
    elements: ['fire', 'water', 'thunder', 'ice', 'dragon'],
    features: {
      decorations: true
    }
  }
];

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok)
    throw new Error(`Unable to load ${path}`);

  return await response.json() as T;
}

let currentLoad = 0;

export function useGame() {
  const route = useRoute();
  const { locale } = usePreferences();
  const loadedSlug = useState<string | undefined>("game-data-slug", () => undefined);
  const loadedLocale = useState<LocaleSlug | undefined>('game-data-locale', () => undefined);
  const rawData = useState<GameData | undefined>("game-data", () => undefined);
  const loadingState = useState<GameDataLoading>("game-data-loading", () => ({
    done: 0,
    total: 0,
  }));

  const slug = computed(() => {
    const slug = route.params.slug;

    if (Array.isArray(slug))
      return slug[0];

    return slug;
  });

  const game = computed(() => {
    return games.find((game) => game.slug === slug.value);
  });

  const data = computed(() => {
    if (!game.value || loadedSlug.value !== game.value.slug || loadedLocale.value !== locale.value)
      return;

    return rawData.value;
  });

  const loading = computed(() => ({
    done: loadingState.value.done,
    progress: loadingState.value.total === 0
      ? 0
      : loadingState.value.done / loadingState.value.total,
    total: loadingState.value.total,
  }));

  async function loadData() {
    const currentGame = game.value;

    if (!currentGame)
      return;

    const currentLocale = locale.value;

    if (loadedSlug.value === currentGame.slug && loadedLocale.value === currentLocale && rawData.value)
      return rawData.value;

    const load = ++currentLoad;
    const basePath = `/data/games/${encodeURIComponent(currentGame.slug)}`;
    const total = ARMOUR_SLOTS.length + 2 + (currentGame.features.decorations ? 1 : 0);

    loadingState.value = {
      done: 0,
      total,
    };

    async function track<T>(promise: Promise<T>) {
      const value = await promise;
      if (load === currentLoad) {
        loadingState.value = {
          ...loadingState.value,
          done: loadingState.value.done + 1,
        };
      }
      return value;
    }

    const nextData: GameData = {
      armour: Object.fromEntries(
        await Promise.all(
          ARMOUR_SLOTS.map(async (slot) => {
            return [
              slot,
              await track(fetchJson<ArmourPiece[]>(`${basePath}/${slot}.json`)),
            ] as const;
          }),
        ),
      ) as Record<ArmourSlot, ArmourPiece[]>,
      decorations: await (currentGame.features.decorations
        ? track(fetchJson<Decoration[]>(`${basePath}/decorations.json`))
        : Promise.resolve([])),
      skills: (await track(fetchJson<SkillDefinition[]>(`${basePath}/skills.json`))).map((skill) => {
        if (skill.categories.length > 0)
          return skill;

        return {
          ...skill,
          categories: ["uncategorized"],
        };
      }),
      translations: await track(fetchJson<Translations>(`${basePath}/translations/${encodeURIComponent(currentLocale)}.json`)),
    };

    if (load === currentLoad) {
      loadedSlug.value = currentGame.slug;
      loadedLocale.value = currentLocale;
      rawData.value = nextData;
    }
  }

  watch(
    () => [game.value?.slug, locale.value] as const,
    () => {
      void loadData();
    },
    { immediate: true }
  );

  return {
    data,
    game,
    games,
    loading,
    slug,
  };
}
