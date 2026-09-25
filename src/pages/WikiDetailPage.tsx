import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { fetchResourceDetail } from '../api/dndApi';
import {
  getCategoryLabel,
  isDndCategory,
} from '../constants/dndApi';
import { wikiCategoryPath } from '../constants/routes';
import ResourceDetail from '../components/wiki/ResourceDetail';
import type { ApiResult } from '../types/api';

function WikiDetailPage() {
  const { category = '', index = '' } = useParams<{
    category: string;
    index: string;
  }>();
  const [data, setData] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isDndCategory(category) || !index) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);
    setData(null);

    void fetchResourceDetail(category, index)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setData(result);
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
  }, [category, index]);

  if (!isDndCategory(category)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="wiki-detail">
      <p className="wiki-detail__breadcrumb">
        <Link to={wikiCategoryPath(category)}>
          {getCategoryLabel(category)}
        </Link>
        <span> / </span>
        <span>{index}</span>
      </p>

      {loading && <p className="wiki-status">Loading...</p>}
      {error && (
        <p className="wiki-status wiki-status--error">
          Could not load this entry.
        </p>
      )}
      {!loading && !error && data && <ResourceDetail data={data} />}
    </div>
  );
}

export default WikiDetailPage;
