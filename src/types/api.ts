export type ApiResourceRef = {
  index: string;
  name: string;
  url: string;
};

export type ApiListResponse = {
  count: number;
  results: ApiResourceRef[];
};

export type ApiResult = {
  index?: string;
  name: string;
  image?: string;
  url?: string;
  [key: string]: unknown;
};

/** Match paths like /api/2014/classes/monk or /api/classes/monk */
export function parseApiResourceUrl(
  apiUrl: string
): { category: string; index: string } | null {
  const match = apiUrl.match(/\/api\/(?:2014\/)?([^/]+)\/([^/?#]+)/);
  if (!match) {
    return null;
  }

  return { category: match[1], index: match[2] };
}
