import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './Button'; 
// import logo from '../assets/logo3.png';

const logo = "https://res.cloudinary.com/da8cw7lxs/image/upload/v1749055786/logo8_zsgxw8.png";

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
    <nav className="fixed top-0 w-full bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link to="/">
          <img src={logo} alt="Koovly Logo" className="w-20 h-12" />
        </Link>
        <div className="flex space-x-4 items-center">
          <a
            href="/#faq"
            className="text-gray-600 hover:text-primary hover:text-purple-500 transition duration-500 hover:underline"
            onClick={handleFaqClick}
          >
            FAQ
          </a>
          <Button variant="secondary" onClick={() => window.location.href = '/jobs'}>
            View Projects
          </Button>
        </div>
      </div>
    </nav>
  );
}