import type { SkillDefinition } from '~/game/types';
import type { SkillRequirement } from '~/query/types';

export type SkillOption = {
  label: string;
  points: number;
  requirement: SkillRequirement;
};

export type SkillCardDefinition = {
  options: SkillOption[];
  skill: SkillDefinition;
};

export function formatSkillPoints(points: number) {
  return points > 0 ? `+${points}` : String(points);
}

export function getSkillEffectKey(skill: string, points: number) {
  const threshold = points < 0 ? `minus-${Math.abs(points)}` : String(points);

  return `skill-${skill}-effect-${threshold}`;
}

export function getSkillOptions(
  skill: SkillDefinition,
  showNegativeSkills: boolean,
): SkillOption[] {
  return skill.effects
    .map((points) => {
      return {
        label: skill.slug,
        points,
        requirement: {
          skill: skill.slug,
          points,
        },
      };
    })
    .filter((option) => option.points > 0 || showNegativeSkills)
    .toSorted((a, b) => {
      if (a.points > 0 && b.points < 0) return -1;

      if (a.points < 0 && b.points > 0) return 1;

      return a.points - b.points;
    });
}

export function getEffect(
  skills: SkillDefinition[],
  slug: string,
  points: number,
) {
  const skill = skills.find((s) => s.slug === slug);
  if (!skill) return null;

  const thresholds = skill.effects;
  const threshold =
    points < 0
      ? thresholds
          .filter((threshold) => threshold < 0 && points <= threshold)
          .toSorted((a, b) => a - b)[0]
      : thresholds
          .filter((threshold) => threshold > 0 && points >= threshold)
          .toSorted((a, b) => b - a)[0];

  if (threshold === undefined) return null;

  return {
    skill: skill.slug,
    points: threshold,
  };
}

export function getSkillCategoryIcon(category: string) {
  switch (category) {
    case 'uncategorized':
      return 'lucide:circle-help';
    case 'offensive':
      return 'lucide:swords';
    case 'defensive':
      return 'lucide:shield';
    case 'combination':
      return 'lucide:combine';
    case 'resistance':
      return 'lucide:component';
    case 'bowgun':
      return 'lucide:bow-arrow';
    case 'bow':
      return 'lucide:bow-arrow';
    case 'blademaster':
      return 'lucide:sword';
    case 'treasure-hunting':
      return 'lucide:shovel';
    case 'farming':
      return 'lucide:tractor';
    default:
      return 'lucide:tag';
  }
}
