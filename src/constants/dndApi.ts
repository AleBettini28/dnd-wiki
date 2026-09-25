export const DND_API_BASE = 'https://www.dnd5eapi.co';
export const DND_API_PREFIX = `${DND_API_BASE}/api/2014`;

export const DND_CATEGORIES = [
  { value: 'ability-scores', label: 'Ability Scores' },
  { value: 'alignments', label: 'Alignments' },
  { value: 'backgrounds', label: 'Backgrounds' },
  { value: 'classes', label: 'Classes' },
  { value: 'conditions', label: 'Conditions' },
  { value: 'damage-types', label: 'Damage Types' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'equipment-categories', label: 'Equipment Categories' },
  { value: 'feats', label: 'Feats' },
  { value: 'features', label: 'Features' },
  { value: 'languages', label: 'Languages' },
  { value: 'magic-items', label: 'Magic Items' },
  { value: 'magic-schools', label: 'Magic Schools' },
  { value: 'monsters', label: 'Monsters' },
  { value: 'proficiencies', label: 'Proficiencies' },
  { value: 'races', label: 'Races' },
  { value: 'rules', label: 'Rules' },
  { value: 'skills', label: 'Skills' },
  { value: 'spells', label: 'Spells' },
  { value: 'subclasses', label: 'Subclasses' },
  { value: 'subraces', label: 'Subraces' },
  { value: 'traits', label: 'Traits' },
  { value: 'weapon-properties', label: 'Weapon Properties' },
] as const;

export type DndCategoryValue = (typeof DND_CATEGORIES)[number]['value'];

export function isDndCategory(value: string): value is DndCategoryValue {
  return DND_CATEGORIES.some((category) => category.value === value);
}

export function getCategoryLabel(value: string): string {
  const found = DND_CATEGORIES.find((category) => category.value === value);
  return found ? found.label : value;
}
