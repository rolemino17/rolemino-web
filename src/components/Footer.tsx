import { Button } from './Button';

export function Footer() {
  return (
    <footer className="bg-inverse text-inverse py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span
              aria-label="Rolemino"
              className="h-10 mb-4 inline-flex items-center text-2xl font-bold tracking-tight text-inverse"
            >
              Rolemino
            </span>
            <p className="text-inverse-secondary">Empowering remote work worldwide.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-inverse">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#hero" className="text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]">Home</a></li>
              <li><a href="#statistics" className="text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]">Community</a></li>
              <li><a href="#user-journey" className="text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]">Journey</a></li>
              <li><a href="#why-rolemino" className="text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]">Why Rolemino</a></li>
              <li><a href="#faq" className="text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-inverse">Get Started</h3>
            <Button variant="primary" onClick={() => window.location.href = '/jobs'}>
              Apply for Jobs
            </Button>
          </div>
        </div>
        <div className="mt-8 text-center text-inverse-secondary border-t border-inverse pt-8">
          <p>&copy; 2025 Rolemino. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
