import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './Button'; 

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleFaqClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    if (location.pathname === "/") {
      // Already on landing, just scroll
      const faqSection = document.getElementById("faq");
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Navigate to landing with hash, then scroll after navigation
      navigate("/#faq");
      setTimeout(() => {
        const faqSection = document.getElementById("faq");
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-surface border-b border-subtle shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link to="/">
          <span
            aria-label="Rolemino home"
            className="w-20 h-12 flex items-center text-xl font-bold tracking-tight text-brand"
          >
            Rolemino
          </span>
        </Link>
        <div className="flex space-x-4 items-center">
          <a
            href="/#faq"
            className="text-secondary hover:text-brand transition duration-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
            onClick={handleFaqClick}
          >
            FAQ
          </a>
          <Button variant="primary" onClick={() => window.location.href = '/jobs'}>
            View Projects
          </Button>
        </div>
      </div>
    </nav>
  );
}
