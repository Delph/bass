import type { SkillDefinition } from "~/game/types";
import type { SkillRequirement } from "~/query/types";

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

export function getSkillRequirement(skill: SkillDefinition, points: number): SkillRequirement {
  return {
    skill: skill.name,
    points,
  };
}

export function getSkillOptions(skill: SkillDefinition, showNegativeSkills: boolean): SkillOption[] {
  return Object.entries(skill.skills)
    .map(([points, label]) => {
      const value = Number(points);

      if (label === undefined)
        return;

      return {
        label,
        points: value,
        requirement: getSkillRequirement(skill, value),
      };
    })
    .filter((option): option is SkillOption => option !== undefined)
    .filter((option) => option.points > 0 || showNegativeSkills)
    .toSorted((a, b) => {
      if (a.points > 0 && b.points < 0)
        return -1;

      if (a.points < 0 && b.points > 0)
        return 1;

      return a.points - b.points;
    });
}

export function getSkillLabel(requirement: SkillRequirement, skills: SkillDefinition[] | undefined) {
  const skill = skills?.find((definition) => definition.name === requirement.skill);

  return skill?.skills[requirement.points] ?? `${requirement.skill} ${formatSkillPoints(requirement.points)}`;
}

export function getSkillCategoryIcon(category: string) {
  switch (category) {
    case "Uncategorised":
      return "lucide:circle-help";
    case "Offensive":
      return "lucide:swords";
    case "Defensive":
      return "lucide:shield";
    case "Resistance":
      return "lucide:component";
    case "Bowgun":
      return "lucide:bow-arrow";
    case "Bow":
      return "lucide:bow-arrow";
    case "Blademaster":
      return "lucide:sword";
    case "Treasure Hunting":
      return "lucide:shovel";
    case "Farming":
      return "lucide:tractor";
    default:
      return "lucide:tag";
  }
}
