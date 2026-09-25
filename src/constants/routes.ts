export const ROUTES = {
  wiki: '/',
  search: '/search',
} as const;

export function wikiCategoryPath(category: string): string {
  return `/${category}`;
}

export function wikiDetailPath(category: string, index: string): string {
  return `/${category}/${index}`;
}

export function wikiSearchPath(query: string): string {
  return `${ROUTES.search}?q=${encodeURIComponent(query)}`;
}
