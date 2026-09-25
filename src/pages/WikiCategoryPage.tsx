import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { fetchCategoryList } from '../api/dndApi';
import {
  getCategoryLabel,
  isDndCategory,
} from '../constants/dndApi';
import { wikiDetailPath } from '../constants/routes';
import type { ApiResourceRef } from '../types/api';

function WikiCategoryPage() {
  const { category = '' } = useParams<{ category: string }>();
  const [items, setItems] = useState<ApiResourceRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!isDndCategory(category)) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);
    setFilter('');

    void fetchCategoryList(category)
      .then((results) => {
        if (cancelled) {
          return;
        }
        setItems(results);
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
  }, [category]);

  if (!isDndCategory(category)) {
    return <Navigate to="/" replace />;
  }

  const normalizedFilter = filter.trim().toLowerCase();
  const visibleItems =
    normalizedFilter === ''
      ? items
      : items.filter((item) =>
          item.name.toLowerCase().includes(normalizedFilter)
        );

  return (
    <div className="wiki-category">
      <h1>{getCategoryLabel(category)}</h1>
      <p className="wiki-category__count">
        {loading ? 'Loading...' : `${items.length} entries`}
      </p>

      {!loading && !error && (
        <input
          className="wiki-category__filter"
          type="search"
          placeholder={`Filter ${getCategoryLabel(category).toLowerCase()}...`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      )}

      {error && (
        <p className="wiki-status wiki-status--error">
          Could not load this section.
        </p>
      )}

      {!loading && !error && (
        <ul className="wiki-category__list">
          {visibleItems.map((item) => (
            <li key={item.index}>
              <Link to={wikiDetailPath(category, item.index)}>{item.name}</Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && visibleItems.length === 0 && (
        <p className="wiki-status">No matching entries.</p>
      )}
    </div>
  );
}

export default WikiCategoryPage;
