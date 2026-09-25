import { Outlet } from 'react-router-dom';

import TopNav from '../layout/TopNav';
import WikiSidebar from './WikiSidebar';

function WikiLayout() {
  return (
    <div className="wiki-shell">
      <TopNav showSearch />
      <div className="wiki-body">
        <WikiSidebar />
        <main className="wiki-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default WikiLayout;
