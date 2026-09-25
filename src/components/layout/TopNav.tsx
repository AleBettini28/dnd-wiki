import { NavLink } from 'react-router-dom';

import { ROUTES } from '../../constants/routes';
import WikiSearchBar from '../wiki/WikiSearchBar';

type TopNavProps = {
  readonly showSearch?: boolean;
  readonly menuOpen?: boolean;
  readonly onMenuToggle?: () => void;
};

function TopNav({
  showSearch = true,
  menuOpen = false,
  onMenuToggle,
}: Readonly<TopNavProps>) {
  return (
    <header className="app-header">
      <div className="app-header__start">
        {onMenuToggle && (
          <button
            type="button"
            className="app-header__menu"
            aria-label={menuOpen ? 'Close sections menu' : 'Open sections menu'}
            aria-expanded={menuOpen}
            aria-controls="wiki-sidebar"
            onClick={onMenuToggle}
          >
            <span className="app-header__menu-bar" aria-hidden="true" />
            <span className="app-header__menu-bar" aria-hidden="true" />
            <span className="app-header__menu-bar" aria-hidden="true" />
          </button>
        )}
        <nav className="app-header__nav" aria-label="Main navigation">
          <NavLink to={ROUTES.wiki} className="dnd-button dnd-button--active">
            D&D Wiki
          </NavLink>
        </nav>
      </div>
      {showSearch && (
        <div className="app-header__search">
          <WikiSearchBar />
        </div>
      )}
    </header>
  );
}

export default TopNav;
