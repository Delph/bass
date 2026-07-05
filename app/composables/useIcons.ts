import { useGame } from '~/composables/useGame';
import type { ArmourSlot, DamageType } from '~/game/types';

const icons = {
  armour: Object.fromEntries(
    Object.entries(
      import.meta.glob<string>('~/assets/images/*/armour/*.png', {
        eager: true,
        query: '?url',
        import: 'default',
      }),
    ).map(([path, url]) => {
      const [, game, slot] = path.match(
        /\/images\/([^/]+)\/armour\/([^/]+)\.png$/,
      )!;
      return [`${game}:${slot}`, url];
    }),
  ),
  elements: Object.fromEntries(
    Object.entries(
      import.meta.glob<string>('~/assets/images/*/elements/*.png', {
        eager: true,
        query: '?url',
        import: 'default',
      }),
    ).map(([path, url]) => {
      const [, game, element] = path.match(
        /\/images\/([^/]+)\/elements\/([^/]+)\.png$/,
      )!;
      return [`${game}:${element}`, url];
    }),
  ),
  defence: Object.fromEntries(
    Object.entries(
      import.meta.glob<string>('~/assets/images/*/defence.png', {
        eager: true,
        query: '?url',
        import: 'default',
      }),
    ).map(([path, url]) => {
      const [, game] = path.match(/\/images\/([^/]+)\/defence\.png$/)!;
      return [game, url];
    }),
  ),
  garbage: Object.fromEntries(
    Object.entries(
      import.meta.glob<string>('~/assets/images/*/garbage.png', {
        eager: true,
        query: '?url',
        import: 'default',
      }),
    ).map(([path, url]) => {
      const [, game] = path.match(/\/images\/([^/]+)\/garbage\.png$/)!;
      return [game!, url];
    }),
  ),
};

export function useIcons() {
  const { slug } = useGame();

  function garbage(): string {
    return icons.garbage[slug.value ?? '']!;
  }

  function armour(slot: ArmourSlot): string {
    return icons.armour[`${slug.value}:${slot}`] ?? garbage();
  }

  function element(element: DamageType): string {
    return icons.elements[`${slug.value}:${element}`] ?? garbage();
  }

  function defence(): string {
    return icons.defence[slug.value ?? ''] ?? garbage();
  }

  return {
    armour,
    element,
    defence,
  };
}
