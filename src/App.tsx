import { Route, Routes } from 'react-router-dom';

import WikiLayout from './components/wiki/WikiLayout';
import { ROUTES } from './constants/routes';
import WikiCategoryPage from './pages/WikiCategoryPage';
import WikiDetailPage from './pages/WikiDetailPage';
import WikiHomePage from './pages/WikiHomePage';
import WikiSearchPage from './pages/WikiSearchPage';

function App() {
  return (
    <Routes>
      <Route element={<WikiLayout />}>
        <Route path={ROUTES.wiki} element={<WikiHomePage />} />
        <Route path={ROUTES.search} element={<WikiSearchPage />} />
        <Route path="/:category" element={<WikiCategoryPage />} />
        <Route path="/:category/:index" element={<WikiDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
