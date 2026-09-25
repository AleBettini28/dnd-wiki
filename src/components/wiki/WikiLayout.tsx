import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import TopNav from '../layout/TopNav';
import WikiSidebar from './WikiSidebar';

const MOBILE_NAV_MQ = '(max-width: 900px)';

function WikiLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(
    () => window.matchMedia(MOBILE_NAV_MQ).matches
  );

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_NAV_MQ);

    function handleChange(event: MediaQueryListEvent) {
      setIsMobileNav(event.matches);
      if (!event.matches) {
        setSidebarOpen(false);
      }
    }

    media.addEventListener('change', handleChange);
    return () => {
      media.removeEventListener('change', handleChange);
    };
  }, []);

  const sidebarVisible = !isMobileNav || sidebarOpen;

  return (
    <div className="wiki-shell">
      <TopNav
        showSearch
        menuOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((open) => !open)}
      />
      <div className="wiki-body">
        {sidebarOpen && (
          <button
            type="button"
            className="wiki-sidebar-backdrop"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <WikiSidebar
          isOpen={sidebarVisible}
          onNavigate={() => setSidebarOpen(false)}
        />
        <main className="wiki-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default WikiLayout;
