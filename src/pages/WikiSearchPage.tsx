import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { searchWiki, type WikiSearchHit } from '../api/dndApi';
import { wikiDetailPath } from '../constants/routes';

function WikiSearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [hits, setHits] = useState<WikiSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setHits([]);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    void searchWiki(trimmed)
      .then((results) => {
        if (cancelled) {
          return;
        }
        setHits(results);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="wiki-search-page">
      <h1>Search</h1>
      <p className="wiki-search-page__query">
        {query.trim()
          ? `Results for "${query.trim()}"`
          : 'Type a query in the search bar above.'}
      </p>

      {loading && (
        <p className="wiki-status">
          Searching the wiki index (first search may take a moment)...
        </p>
      )}
      {error && (
        <p className="wiki-status wiki-status--error">
          Search failed. Try again.
        </p>
      )}

      {!loading && !error && query.trim() && (
        <p className="wiki-category__count">{hits.length} matches</p>
      )}

      {!loading && !error && (
        <ul className="wiki-search-page__list">
          {hits.map((hit) => (
            <li key={`${hit.category}-${hit.index}`}>
              <Link to={wikiDetailPath(hit.category, hit.index)}>
                {hit.name}
              </Link>
              <span className="wiki-search-page__category">
                {hit.categoryLabel}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WikiSearchPage;
