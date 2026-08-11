import { Button } from './Button';

export function Footer() {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span
              aria-label="Rolemino"
              className="h-10 mb-4 inline-flex items-center text-2xl font-bold tracking-tight text-white"
            >
              Rolemino
            </span>
            <p className="text-gray-300">Empowering remote work worldwide.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#hero" className="text-gray-300 hover:text-white">Home</a></li>
              <li><a href="#statistics" className="text-gray-300 hover:text-white">Community</a></li>
              <li><a href="#user-journey" className="text-gray-300 hover:text-white">Journey</a></li>
              <li><a href="#why-rolemino" className="text-gray-300 hover:text-white">Why Rolemino</a></li>
              <li><a href="#faq" className="text-gray-300 hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Get Started</h3>
            <Button variant="accent" onClick={() => window.location.href = '/jobs'}>
              Apply for Jobs
            </Button>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-300">
          <p>&copy; 2025 Rolemino. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
