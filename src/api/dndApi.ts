import { DND_API_BASE, DND_API_PREFIX, DND_CATEGORIES } from '../constants/dndApi';
import type { ApiListResponse, ApiResourceRef, ApiResult } from '../types/api';

export async function fetchCategoryList(
  category: string
): Promise<ApiResourceRef[]> {
  const res = await fetch(`${DND_API_PREFIX}/${category}`);
  if (!res.ok) {
    throw new Error(`Failed to load list for ${category}`);
  }

  const data = (await res.json()) as ApiListResponse;
  return data.results ?? [];
}

export async function fetchResourceDetail(
  category: string,
  index: string
): Promise<ApiResult> {
  const res = await fetch(`${DND_API_PREFIX}/${category}/${index}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${category}/${index}`);
  }

  return (await res.json()) as ApiResult;
}

export async function fetchByApiPath(apiPath: string): Promise<ApiResult> {
  const path = apiPath.startsWith('http')
    ? apiPath
    : `${DND_API_BASE}${apiPath}`;
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${apiPath}`);
  }

  return (await res.json()) as ApiResult;
}

export type WikiSearchHit = {
  category: string;
  categoryLabel: string;
  index: string;
  name: string;
};

let searchIndexPromise: Promise<WikiSearchHit[]> | null = null;

export function loadWikiSearchIndex(): Promise<WikiSearchHit[]> {
  if (!searchIndexPromise) {
    searchIndexPromise = buildSearchIndex().catch((error) => {
      searchIndexPromise = null;
      throw error;
    });
  }

  return searchIndexPromise;
}

async function buildSearchIndex(): Promise<WikiSearchHit[]> {
  const lists = await Promise.all(
    DND_CATEGORIES.map(async (category) => {
      const results = await fetchCategoryList(category.value);
      return results.map((item) => ({
        category: category.value,
        categoryLabel: category.label,
        index: item.index,
        name: item.name,
      }));
    })
  );

  return lists.flat();
}

export async function searchWiki(query: string): Promise<WikiSearchHit[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const index = await loadWikiSearchIndex();
  return index.filter((hit) => hit.name.toLowerCase().includes(normalized));
}

export function imageUrl(path: string | undefined): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith('http')) {
    return path;
  }

  return `${DND_API_BASE}${path}`;
}
