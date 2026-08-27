import { Link } from 'react-router-dom';
import wordmark from '../assets/logo/rolemino-horizontal-wordmark.png';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-inverse text-inverse border-t border-inverse">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.9fr] gap-10 lg:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" aria-label="Rolemino home" className="inline-flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 rounded-sm">
              <img
                src={wordmark}
                alt="Rolemino"
                width={1435}
                height={390}
                className="h-7 w-auto object-contain brightness-0 invert"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="mt-3 text-[13px] leading-[1.6] text-inverse-secondary max-w-[36ch]">
              Rolemino connects qualified contributors with professional project opportunities.
            </p>
            <p className="mt-4 text-[12px] text-inverse-secondary">
              Official communication:{' '}
              <a
                href="mailto:careers@rolemino.com"
                className="underline underline-offset-4 hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 rounded-sm"
              >
                careers@rolemino.com
              </a>
            </p>
          </div>

          {/* Opportunity links */}
          <div>
            <h3 className="text-[12px] font-semibold tracking-[0.12em] uppercase text-inverse">Opportunities</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/jobs" className="text-[13px] text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 rounded-sm">
                  Explore opportunities
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="text-[13px] text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 rounded-sm">
                  How it works
                </a>
              </li>
              <li>
                <a href="/#why-rolemino" className="text-[13px] text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 rounded-sm">
                  Why Rolemino
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[12px] font-semibold tracking-[0.12em] uppercase text-inverse">Support</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href="/#faq" className="text-[13px] text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 rounded-sm">
                  Frequently asked questions
                </a>
              </li>
              <li>
                <a href="/#trust-and-safety" className="text-[13px] text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 rounded-sm">
                  Trust &amp; Safety
                </a>
              </li>
              <li>
                <a href="/#payments" className="text-[13px] text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 rounded-sm">
                  Payments
                </a>
              </li>
              <li>
                <a href="mailto:careers@rolemino.com" className="text-[13px] text-inverse-secondary hover:text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 rounded-sm">
                  Contact Rolemino
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-inverse flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-[12px] leading-relaxed text-inverse-secondary">© {year} Rolemino. All rights reserved.</p>
          <p className="text-[11px] leading-relaxed text-inverse-secondary max-w-[52ch]">
            Rolemino does not charge contributors application, registration or placement fees.
          </p>
        </div>
      </div>
    </footer>
  );
}
