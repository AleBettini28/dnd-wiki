import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { wikiSearchPath } from '../../constants/routes';

function WikiSearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }
    navigate(wikiSearchPath(trimmed));
  }

  return (
    <form className="wiki-search" onSubmit={handleSubmit} role="search">
      <label className="visually-hidden" htmlFor="wiki-search-input">
        Search the wiki
      </label>
      <input
        id="wiki-search-input"
        className="wiki-search__input"
        type="search"
        placeholder="Search the wiki..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="wiki-search__button">
        Search
      </button>
    </form>
  );
}

export default WikiSearchBar;
