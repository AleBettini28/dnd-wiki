import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import { fetchCategoryList } from '../../api/dndApi';
import { DND_CATEGORIES } from '../../constants/dndApi';
import {
  wikiCategoryPath,
  wikiDetailPath,
} from '../../constants/routes';
import type { ApiResourceRef } from '../../types/api';

type WikiSidebarProps = {
  readonly isOpen?: boolean;
  readonly onNavigate?: () => void;
};

function WikiSidebar({
  isOpen = false,
  onNavigate,
}: Readonly<WikiSidebarProps>) {
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

  const sidebarClass = isOpen
    ? 'wiki-sidebar wiki-sidebar--open'
    : 'wiki-sidebar';

  return (
    <aside
      id="wiki-sidebar"
      className={sidebarClass}
      aria-label="Wiki sections"
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
    >
      <div className="wiki-sidebar__header">
        <NavLink to="/" className="wiki-sidebar__home" onClick={onNavigate}>
          Wiki Home
        </NavLink>
      </div>
      <nav className="wiki-sidebar__nav">
        {DND_CATEGORIES.map((category) => {
          const isSectionOpen = expanded === category.value;
          const items = itemsByCategory[category.value] ?? [];
          const isLoading = loadingCategory === category.value;
          const hasError = errorCategory === category.value;

          return (
            <div key={category.value} className="wiki-sidebar__section">
              <div className="wiki-sidebar__section-row">
                <button
                  type="button"
                  className="wiki-sidebar__toggle"
                  aria-expanded={isSectionOpen}
                  onClick={() => toggleCategory(category.value)}
                >
                  {isSectionOpen ? '▾' : '▸'}
                </button>
                <NavLink
                  to={wikiCategoryPath(category.value)}
                  className={({ isActive }) =>
                    isActive
                      ? 'wiki-sidebar__link wiki-sidebar__link--active'
                      : 'wiki-sidebar__link'
                  }
                  onClick={onNavigate}
                >
                  {category.label}
                </NavLink>
              </div>

              {isSectionOpen && (
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
                          onClick={onNavigate}
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
