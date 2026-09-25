import { Link } from 'react-router-dom';

import { DND_CATEGORIES } from '../constants/dndApi';
import { wikiCategoryPath } from '../constants/routes';

function WikiHomePage() {
  return (
    <div className="wiki-home">
      <h1>D&D 5e Wiki</h1>
      <p className="wiki-home__intro">
        Browse the System Reference Document by section, or use the search bar
        above to find spells, classes, monsters, and more.
      </p>
      <ul className="wiki-home__grid">
        {DND_CATEGORIES.map((category) => (
          <li key={category.value}>
            <Link
              className="wiki-home__card"
              to={wikiCategoryPath(category.value)}
            >
              {category.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WikiHomePage;
