import { NavLink } from 'react-router-dom';

import { ROUTES } from '../../constants/routes';
import WikiSearchBar from '../wiki/WikiSearchBar';

type TopNavProps = {
  readonly showSearch?: boolean;
};

function TopNav({ showSearch = true }: Readonly<TopNavProps>) {
  return (
    <header className="app-header">
      <nav className="app-header__nav" aria-label="Main navigation">
        <NavLink to={ROUTES.wiki} className="dnd-button dnd-button--active">
          D&D Wiki
        </NavLink>
      </nav>
      {showSearch && (
        <div className="app-header__search">
          <WikiSearchBar />
        </div>
      )}
    </header>
  );
}

export default TopNav;
