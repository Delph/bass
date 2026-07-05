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

export function getSkillOptions(
  skill: SkillDefinition,
  showNegativeSkills: boolean,
): SkillOption[] {
  return Object.entries(skill.effects)
    .map(([points, effect]) => {
      const value = Number(points);

      if (effect === undefined) return;

      return {
        label: effect.name,
        points: value,
        requirement: {
          skill: skill.name,
          points: value,
        },
      };
    })
    .filter((option): option is SkillOption => option !== undefined)
    .filter((option) => option.points > 0 || showNegativeSkills)
    .toSorted((a, b) => {
      if (a.points > 0 && b.points < 0) return -1;

      if (a.points < 0 && b.points > 0) return 1;

      return a.points - b.points;
    });
}

export function getEffect(
  skills: SkillDefinition[],
  name: string,
  points: number,
) {
  const skill = skills.find((s) => s.name === name);
  if (!skill) return null;

  const thresholds = Object.keys(skill.effects)
    .map((p) => Number(p))
    .toSorted((a, b) => b - a);
  for (const threshold of thresholds) {
    if (threshold < 0 && points <= threshold)
      return {
        skill: skill.name,
        effect: skill.effects[threshold]!,
        points: threshold,
      };
    else if (threshold > 0 && points >= threshold)
      return {
        skill: skill.name,
        effect: skill.effects[threshold]!,
        points: threshold,
      };
  }
  return null;
}

export function getSkillCategoryIcon(category: string) {
  switch (category) {
    case 'Uncategorised':
      return 'lucide:circle-help';
    case 'Offensive':
      return 'lucide:swords';
    case 'Defensive':
      return 'lucide:shield';
    case 'Resistance':
      return 'lucide:component';
    case 'Bowgun':
      return 'lucide:bow-arrow';
    case 'Bow':
      return 'lucide:bow-arrow';
    case 'Blademaster':
      return 'lucide:sword';
    case 'Treasure Hunting':
      return 'lucide:shovel';
    case 'Farming':
      return 'lucide:tractor';
    default:
      return 'lucide:tag';
  }
}
