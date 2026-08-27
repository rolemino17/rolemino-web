import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import wordmark from '../assets/logo/rolemino-horizontal-wordmark.png';

type NavItem = {
  label: string;
  href: string;
  isRoute?: boolean;
  anchorId?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Opportunities', href: '/jobs', isRoute: true },
  { label: 'How it works', href: '/#how-it-works', anchorId: 'how-it-works' },
  { label: 'Why Rolemino', href: '/#why-rolemino', anchorId: 'why-rolemino' },
  { label: 'Trust & Safety', href: '/#trust-and-safety', anchorId: 'trust-and-safety' },
  { label: 'Help', href: '/#faq', anchorId: 'faq' },
  { label: 'About', href: '/#about', anchorId: 'about' },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => setMobileOpen(false);

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, anchorId: string) => {
    e.preventDefault();
    closeMenu();
    if (location.pathname === '/') {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth' });
      // update hash without reload
      window.history.pushState(null, '', `/#${anchorId}`);
    } else {
      navigate(`/#${anchorId}`);
      // wait for navigation then scroll
      setTimeout(() => {
        document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // handle direct hash on load / navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.pathname, location.hash]);

  // close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // body scroll lock when mobile open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-surface focus:text-primary focus:border focus:border-default focus:rounded-md focus:outline-2 focus:outline-[var(--color-focus-ring)]"
      >
        Skip to content
      </a>
      <header className="fixed top-0 w-full bg-surface/95 backdrop-blur-[6px] border-b border-subtle z-30">
        <nav
          aria-label="Primary"
          className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16"
        >
          <Link
            to="/"
            onClick={closeMenu}
            aria-label="Rolemino home"
            className="flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm"
          >
            <img
              src={wordmark}
              alt="Rolemino"
              width={1435}
              height={390}
              className="h-7 sm:h-8 w-auto object-contain"
              loading="eager"
              decoding="sync"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="px-3 py-2 text-[14px] font-medium text-secondary hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-md min-h-[44px] inline-flex items-center"
                  aria-current={location.pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleAnchor(e, item.anchorId!)}
                  className="px-3 py-2 text-[14px] font-medium text-secondary hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-md min-h-[44px] inline-flex items-center"
                >
                  {item.label}
                </a>
              )
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-[10px] text-[14px] font-medium bg-[var(--color-action-primary)] text-inverse hover:bg-[var(--color-action-primary-hover)] active:bg-[var(--color-action-primary-active)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[44px]"
            >
              Explore opportunities
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-default bg-surface text-primary hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
          >
            <span aria-hidden="true" className="relative w-5 h-5 flex flex-col justify-center items-center">
              <span className={`absolute h-0.5 w-5 bg-current rounded transition-all duration-200 ${mobileOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
              <span className={`absolute h-0.5 w-5 bg-current rounded transition-opacity duration-150 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute h-0.5 w-5 bg-current rounded transition-all duration-200 ${mobileOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
            </span>
          </button>
        </nav>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          ref={menuRef}
          className={`lg:hidden border-t border-subtle bg-surface ${mobileOpen ? 'block' : 'hidden'}`}
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={closeMenu}
                  className="px-3 py-3 text-[15px] font-medium text-primary hover:bg-subtle rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[44px] flex items-center"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleAnchor(e, item.anchorId!)}
                  className="px-3 py-3 text-[15px] font-medium text-primary hover:bg-subtle rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[44px] flex items-center"
                >
                  {item.label}
                </a>
              )
            )}
            <div className="pt-4 mt-2 border-t border-subtle">
              <Link
                to="/jobs"
                onClick={closeMenu}
                className="flex items-center justify-center w-full px-5 py-3 rounded-[10px] text-[15px] font-medium bg-[var(--color-action-primary)] text-inverse hover:bg-[var(--color-action-primary-hover)] active:bg-[var(--color-action-primary-active)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[44px]"
              >
                Explore opportunities
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* backdrop for mobile menu */}
      {mobileOpen && (
        <button
          aria-label="Close menu backdrop"
          onClick={closeMenu}
          className="fixed inset-0 top-16 bg-[var(--color-overlay)] backdrop-blur-[2px] z-20 lg:hidden"
          tabIndex={-1}
        />
      )}
    </>
  );
}
