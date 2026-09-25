import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import { fetchCategoryList } from '../../api/dndApi';
import { DND_CATEGORIES } from '../../constants/dndApi';
import {
  wikiCategoryPath,
  wikiDetailPath,
} from '../../constants/routes';
import type { ApiResourceRef } from '../../types/api';

function WikiSidebar() {
  const { category: activeCategory } = useParams<{ category?: string }>();
  const [expanded, setExpanded] = useState<string | null>(
    activeCategory ?? null
  );
  const [itemsByCategory, setItemsByCategory] = useState<
    Record<string, ApiResourceRef[]>
  >({});
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [errorCategory, setErrorCategory] = useState<string | null>(null);

  useEffect(() => {
    if (activeCategory) {
      setExpanded(activeCategory);
    }
  }, [activeCategory]);

  const hasItemsForExpanded = expanded
    ? Boolean(itemsByCategory[expanded])
    : true;

  useEffect(() => {
    if (!expanded || hasItemsForExpanded) {
      return;
    }

    let cancelled = false;
    setLoadingCategory(expanded);
    setErrorCategory(null);

    void fetchCategoryList(expanded)
      .then((results) => {
        if (cancelled) {
          return;
        }
        setItemsByCategory((prev) => ({ ...prev, [expanded]: results }));
        setLoadingCategory(null);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setErrorCategory(expanded);
        setLoadingCategory(null);
      });

    return () => {
      cancelled = true;
    };
  }, [expanded, hasItemsForExpanded]);

  function toggleCategory(categoryValue: string) {
    setExpanded((prev) => (prev === categoryValue ? null : categoryValue));
  }

  return (
    <aside className="wiki-sidebar" aria-label="Wiki sections">
      <div className="wiki-sidebar__header">
        <NavLink to="/" className="wiki-sidebar__home">
          Wiki Home
        </NavLink>
      </div>
      <nav className="wiki-sidebar__nav">
        {DND_CATEGORIES.map((category) => {
          const isOpen = expanded === category.value;
          const items = itemsByCategory[category.value] ?? [];
          const isLoading = loadingCategory === category.value;
          const hasError = errorCategory === category.value;

          return (
            <div key={category.value} className="wiki-sidebar__section">
              <div className="wiki-sidebar__section-row">
                <button
                  type="button"
                  className="wiki-sidebar__toggle"
                  aria-expanded={isOpen}
                  onClick={() => toggleCategory(category.value)}
                >
                  {isOpen ? '▾' : '▸'}
                </button>
                <NavLink
                  to={wikiCategoryPath(category.value)}
                  className={({ isActive }) =>
                    isActive
                      ? 'wiki-sidebar__link wiki-sidebar__link--active'
                      : 'wiki-sidebar__link'
                  }
                >
                  {category.label}
                </NavLink>
              </div>

              {isOpen && (
                <ul className="wiki-sidebar__items">
                  {isLoading && (
                    <li className="wiki-sidebar__status">Loading...</li>
                  )}
                  {hasError && (
                    <li className="wiki-sidebar__status wiki-sidebar__status--error">
                      Failed to load
                    </li>
                  )}
                  {!isLoading &&
                    !hasError &&
                    items.map((item) => (
                      <li key={item.index}>
                        <NavLink
                          to={wikiDetailPath(category.value, item.index)}
                          className={({ isActive }) =>
                            isActive
                              ? 'wiki-sidebar__item wiki-sidebar__item--active'
                              : 'wiki-sidebar__item'
                          }
                        >
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default WikiSidebar;
