import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJobs } from '../api/api';
import { Section, Eyebrow, SectionHeading } from '../components/Section';
import { Footer } from '../components/Footer';
import { OpportunityPreviewCard, OpportunityCardSkeleton, EmptyState, ErrorState } from '../components/OpportunityPreviewCard';
import { FAQAccordion } from '../components/FAQAccordion';

const FAQ_ITEMS = [
  {
    q: 'What does Rolemino do?',
    a: 'Rolemino publishes project opportunities, processes contributor applications and identifies candidates whose qualifications align with project requirements. Qualified candidates are introduced to the relevant project owner for final selection and onboarding. Rolemino continues tracking contributor progress after the introduction.',
  },
  {
    q: 'Does Rolemino charge contributors?',
    a: 'No. Contributors are not required to pay an application, registration or placement fee. If anyone requests payment while claiming to represent Rolemino, do not send money and contact Rolemino at careers@rolemino.com.',
  },
  {
    q: 'Does applying guarantee selection?',
    a: 'No. Applications are assessed against the requirements of each opportunity. Qualified candidates may be introduced to the project owner, who makes the final selection decision.',
  },
  {
    q: 'What types of opportunities are available?',
    a: 'Opportunities may include language, data, research, content evaluation, digital operations and subject-matter projects. Availability changes according to project needs.',
  },
  {
    q: 'How will I be paid?',
    a: 'Rolemino handles contributor payments through its verified project-owner pipeline. Supported methods include direct bank transfer, PayPal and Payoneer. Available methods, currencies and payment schedules may vary by project and contributor location.',
  },
  {
    q: 'Why might Rolemino request personal documents?',
    a: 'Some projects require identity, location or qualification verification. The purpose and requirements should be explained before documents are submitted.',
  },
  {
    q: 'How will I know whether a message is genuinely from Rolemino?',
    a: 'Official contributor communication is sent through careers@rolemino.com. Rolemino does not request application or placement fees.',
  },
];

export function Landing() {
  const { data: jobs, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    document.title = 'Rolemino | Professional Project Opportunities';
    const desc = 'Discover professional opportunities in language, data, research and digital evaluation. Rolemino reviews applications and connects qualified contributors with project owners.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    const setMeta = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('og:title', 'Rolemino | Professional Project Opportunities');
    setMeta('og:description', desc);
    let theme = document.querySelector('meta[name="theme-color"]');
    if (!theme) {
      theme = document.createElement('meta');
      theme.setAttribute('name', 'theme-color');
      document.head.appendChild(theme);
    }
    theme.setAttribute('content', '#18324A');
  }, []);

  const previewJobs = jobs?.slice(0, 6) ?? [];

  return (
    <div className="bg-canvas">
      <main id="main-content" className="pt-16">
        {/* HERO — typography-led, no imagery */}
        <section id="hero" className="bg-canvas scroll-mt-[68px] border-b border-subtle">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main hero composition */}
            <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-8 lg:gap-10 xl:gap-14 py-10 sm:py-12 lg:py-14 xl:py-16 items-start">
              {/* Left: positioning and conversion */}
              <div className="min-w-0">
                <Eyebrow>Professional project opportunities</Eyebrow>
                <h1
                  className="mt-4 font-bold tracking-[-0.03em] text-primary [text-wrap:balance] max-w-[14ch]"
                  style={{ fontSize: 'clamp(2.75rem, 6vw, 4.75rem)', lineHeight: '0.96' }}
                >
                  Put your skills to work on projects that matter.
                </h1>
                <p
                  className="mt-5 text-secondary max-w-[58ch] [text-wrap:pretty]"
                  style={{ fontSize: 'clamp(0.9375rem, 1.2vw, 1.0625rem)', lineHeight: '1.65' }}
                >
                  Discover opportunities in language, data, research and digital evaluation. Rolemino reviews applications and connects qualified
                  contributors with project owners worldwide.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/jobs"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-[10px] text-[15px] font-medium bg-[var(--color-action-primary)] text-inverse hover:bg-[var(--color-action-primary-hover)] active:bg-[var(--color-action-primary-active)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[44px] sm:w-auto w-full"
                  >
                    Explore opportunities
                  </Link>
                  <a
                    href="#how-it-works"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-[10px] text-[15px] font-medium bg-surface text-brand border border-brand hover:bg-brand-subtle active:bg-brand-selected transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[44px] sm:w-auto w-full"
                  >
                    How it works
                  </a>
                </div>
                
              </div>

              {/* Right: structured opportunity pathway */}
              <div className="min-w-0 lg:pt-1">
                <div className="bg-surface border border-default rounded-[14px] overflow-hidden">
                  <div className="px-6 sm:px-7 pt-6 sm:pt-7 pb-2">
                    <h2 id="how-opportunities-work-title" className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand flex items-center gap-2">
                      <span aria-hidden="true" className="h-px w-6 bg-decorative shrink-0" />
                      How opportunities work
                    </h2>
                  </div>

                  <ol className="px-6 sm:px-7" aria-labelledby="how-opportunities-work-title">
                    <li className="py-5 flex gap-4 sm:gap-5">
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-[12px] font-semibold tracking-[0.08em] text-decorative leading-none pt-1"
                      >
                        01
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-semibold text-primary leading-tight">Discover</h3>
                        <p className="mt-1 text-[13px] leading-[1.6] text-secondary">
                          Explore active professional opportunities matched to different skills and domains.
                        </p>
                      </div>
                    </li>
                    <li className="border-t border-subtle py-5 flex gap-4 sm:gap-5">
                      <span aria-hidden="true" className="shrink-0 text-[12px] font-semibold tracking-[0.08em] text-decorative leading-none pt-1">
                        02
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-semibold text-primary leading-tight">Apply</h3>
                        <p className="mt-1 text-[13px] leading-[1.6] text-secondary">Submit your application and required information at no cost.</p>
                      </div>
                    </li>
                    <li className="border-t border-subtle py-5 flex gap-4 sm:gap-5">
                      <span aria-hidden="true" className="shrink-0 text-[12px] font-semibold tracking-[0.08em] text-decorative leading-none pt-1">
                        03
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-semibold text-primary leading-tight">Qualify</h3>
                        <p className="mt-1 text-[13px] leading-[1.6] text-secondary">
                          Rolemino reviews applications and contacts qualified candidates about the next step.
                        </p>
                      </div>
                    </li>
                  </ol>

                  
                </div>

              </div>
            </div>

            {/* Credibility rail — integrated, not floating cards */}
            <div className="border-t border-subtle">
              <div className="grid grid-cols-1 sm:grid-cols-3">
                <div className="flex flex-row sm:flex-col lg:flex-row items-baseline sm:items-start lg:items-baseline gap-3 sm:gap-1 lg:gap-3 py-5 sm:py-6 border-b sm:border-b-0 sm:border-r border-subtle pr-0 sm:pr-6 last:border-0 last:pr-0">
                  <p className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold tracking-tight text-primary leading-none shrink-0">$100+/hr</p>
                  <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-secondary leading-tight">Top hourly pay</p>
                </div>
                <div className="flex flex-row sm:flex-col lg:flex-row items-baseline sm:items-start lg:items-baseline gap-3 sm:gap-1 lg:gap-3 py-5 sm:py-6 border-b sm:border-b-0 sm:border-r border-subtle sm:px-6 last:border-0">
                  <p className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold tracking-tight text-primary leading-none shrink-0">20,000+</p>
                  <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-secondary leading-tight">Contributors paid</p>
                </div>
                <div className="flex flex-row sm:flex-col lg:flex-row items-baseline sm:items-start lg:items-baseline gap-3 sm:gap-1 lg:gap-3 py-5 sm:py-6 sm:pl-6">
                  <p className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold tracking-tight text-primary leading-none shrink-0">50+</p>
                  <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-secondary leading-tight">Countries represented</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <Section id="about" variant="surface" className="border-y border-subtle">
          <SectionHeading eyebrow="About Rolemino" title="Professional opportunities begin with clear expectations." />
          <p className="text-[15px] leading-[1.7] text-secondary max-w-[68ch] -mt-4 mb-8">
            Rolemino helps contributors understand project requirements, present their qualifications and progress through an organized application process. Qualified candidates are introduced to the relevant project owner for final selection and onboarding.
          </p>
          <div className="grid md:grid-cols-3 gap-0 border border-default rounded-[12px] overflow-hidden bg-surface divide-y md:divide-y-0 md:divide-x divide-default">
            <div className="p-6 sm:p-7">
              <div className="w-8 h-px bg-decorative mb-4" aria-hidden="true" />
              <h3 className="text-[14px] font-semibold text-primary">Clear requirements</h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-secondary">Review the expected skills, eligibility and project information before applying.</p>
            </div>
            <div className="p-6 sm:p-7">
              <div className="w-8 h-px bg-decorative mb-4" aria-hidden="true" />
              <h3 className="text-[14px] font-semibold text-primary">Structured qualification</h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-secondary">Applications are assessed against the requirements of each opportunity.</p>
            </div>
            <div className="p-6 sm:p-7">
              <div className="w-8 h-px bg-decorative mb-4" aria-hidden="true" />
              <h3 className="text-[14px] font-semibold text-primary">Continued coordination</h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-secondary">Rolemino tracks contributor progress through qualification, project-owner review and participation.</p>
            </div>
          </div>
        </Section>

        {/* OPPORTUNITIES */}
        <Section id="opportunities" variant="subtle">
          <SectionHeading
            eyebrow="Current opportunities"
            title="Find work suited to your experience."
            description="Explore available projects across professional disciplines. Requirements, eligibility and compensation vary by opportunity."
          />
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <OpportunityCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} message={error instanceof Error ? error.message : undefined} />
          ) : previewJobs.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {previewJobs.map((job) => (
                  <div key={job.id} className="relative">
                    <OpportunityPreviewCard job={job} />
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Link
                  to="/jobs"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-[10px] text-[15px] font-medium bg-[var(--color-action-primary)] text-inverse hover:bg-[var(--color-action-primary-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[44px]"
                >
                  View all opportunities
                </Link>
              </div>
            </>
          )}
        </Section>

        {/* HOW IT WORKS */}
        <Section id="how-it-works" variant="canvas" className="border-y border-subtle">
          <SectionHeading
            eyebrow="The contributor journey"
            title="A clear process from application to project consideration."
          />
          <div className="relative">
            <ol className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-4">
              {[
                { title: 'Explore opportunities', desc: 'Review the project scope, eligibility requirements and available compensation information.' },
                { title: 'Submit your application', desc: 'Provide the experience, skills and availability relevant to the opportunity.' },
                { title: 'Complete qualification', desc: 'Rolemino reviews your application and may request an assessment, identity verification or supporting documents where required.' },
                { title: 'Meet the project owner', desc: 'Qualified candidates are introduced to the project owner, who may complete additional assessment and makes the final selection decision.' },
                { title: 'Begin contributing', desc: 'Selected contributors receive project-specific onboarding, working expectations and payment terms before participation begins.' },
              ].map((step, idx) => (
                <li key={idx} className="relative flex gap-4 lg:flex-col lg:gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-brand text-inverse flex items-center justify-center text-[12px] font-semibold ring-4 ring-brand-subtle">
                    {idx + 1}
                  </div>
                  <div className="lg:pt-1">
                    <h3 className="text-[14px] font-semibold text-primary leading-snug">{step.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-[1.6] text-secondary">{step.desc}</p>
                  </div>
                  {/* mobile vertical line */}
                  {idx !== 4 && (
                    <div className="lg:hidden absolute left-[13px] top-[32px] bottom-[-24px] w-px bg-default" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </Section>

        {/* WHY ROLEMINO */}
        <Section id="why-rolemino" variant="surface">
          <SectionHeading eyebrow="Designed for contributors" title="Opportunity discovery with clarity and support." align="left" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-2">
            {[
              { t: 'Relevant opportunities', d: 'Explore projects requiring specific language, professional, technical and research capabilities.' },
              { t: 'Clear requirements', d: 'Understand the expected qualifications, eligibility and application process before proceeding.' },
              { t: 'Structured review', d: 'Applications are assessed against defined project requirements before qualified candidates are introduced to project owners.' },
              { t: 'Continued coordination', d: 'Rolemino tracks contributor progress through application review, project-owner selection and project participation.' },
              { t: 'Verified payment pipeline', d: 'Rolemino handles contributor payments through its verified project-owner pipeline.' },
              { t: 'No contributor fees', d: 'Rolemino does not charge contributors application, registration or placement fees.' },
            ].map((b) => (
              <div key={b.t} className="group">
                <div className="w-8 h-px bg-decorative mb-3 group-hover:w-10 transition-all" aria-hidden="true" />
                <h3 className="text-[14px] font-semibold text-primary">{b.t}</h3>
                <p className="mt-1.5 text-[13px] leading-[1.65] text-secondary">{b.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* TRUST & SAFETY — inverse */}
        <Section id="trust-and-safety" variant="inverse">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-start">
            <div>
              <Eyebrow variant="inverse">Trust &amp; Safety</Eyebrow>
              <h2 className="mt-3 text-[28px] sm:text-[32px] font-semibold tracking-tight leading-[1.15] text-inverse">Your information should be handled with care.</h2>
              <p className="mt-4 text-[14px] sm:text-[15px] leading-[1.65] text-inverse-secondary max-w-[56ch]">
                Some opportunities require identity, location or qualification verification. Rolemino requests information as part of the application and qualification process and explains why it is required before submission.
              </p>
              <a
                href="mailto:careers@rolemino.com"
                className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-[10px] text-[14px] font-medium bg-surface text-brand hover:bg-subtle transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 min-h-[44px]"
              >
                Contact Rolemino
              </a>
              <p className="mt-3 text-[11px] text-inverse-secondary">Official contributor communication is sent through careers@rolemino.com.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-0 border border-inverse rounded-[12px] overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-inverse bg-brand/40">
              {[
                { t: 'No application fees', d: 'Rolemino does not require contributors to pay to apply, qualify or be introduced to a project owner.' },
                { t: 'Verification with context', d: 'When verification is required, the purpose and requested information should be explained before submission.' },
                { t: 'Official communication', d: 'Official contributor communication is sent by Rolemino through careers@rolemino.com.' },
                { t: 'Continued application tracking', d: 'Rolemino tracks contributor progress after qualified candidates are introduced to project owners.' },
              ].map((item) => (
                <div key={item.t} className="p-5 sm:p-6">
                  <h3 className="text-[13px] font-semibold text-inverse">{item.t}</h3>
                  <p className="mt-1.5 text-[12px] leading-[1.6] text-inverse-secondary">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* PAYMENTS */}
        <Section id="payments" variant="canvas" className="border-b border-subtle">
          <SectionHeading eyebrow="Payments" title="Payment options communicated before work begins." />
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10">
            <div>
              <p className="text-[15px] leading-[1.65] text-secondary max-w-[62ch]">
                Rolemino handles contributor payments through its verified project-owner pipeline. Supported payment methods include direct bank transfer, PayPal and Payoneer.
              </p>
              <p className="mt-3 text-[13px] leading-[1.6] text-secondary bg-subtle border border-default rounded-[10px] px-4 py-3 max-w-[62ch]">
                Available methods, currency and payment schedules may vary by project and contributor location. Applicable terms are communicated before project participation begins.
              </p>
            </div>
            <div className="bg-surface border border-default rounded-[12px] p-6 sm:p-7">
              <h3 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-strong-secondary">Supported methods</h3>
              <ul className="mt-4 space-y-3">
                {['Direct bank transfer', 'PayPal', 'Payoneer'].map((m) => (
                  <li key={m} className="flex items-center gap-3 text-[14px] text-primary">
                    <span className="w-7 h-7 rounded-full bg-subtle border border-default flex items-center justify-center shrink-0" aria-hidden="true">
                      <span className="w-1.5 h-1.5 rounded-full bg-decorative" />
                    </span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* CONTRIBUTOR EXPECTATIONS */}
        <Section id="contributor-expectations" variant="subtle">
          <SectionHeading eyebrow="What to expect" title="A professional process at every stage." />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-default rounded-[12px] overflow-hidden bg-surface divide-y md:divide-y-0 md:divide-x divide-default">
            {[
              { k: 'Before applying', t: 'Review the opportunity requirements and confirm that your experience, location and availability are suitable.' },
              { k: 'During review', t: 'Respond accurately to qualification questions and provide supporting information only through official Rolemino channels.' },
              { k: 'After qualification', t: 'Qualified candidates may complete additional review with the project owner before a final decision is made.' },
              { k: 'During participation', t: 'Follow the onboarding, quality and delivery requirements provided for the project. Rolemino continues tracking contributor progress and coordinates payment through its verified project-owner pipeline.' },
            ].map((s) => (
              <div key={s.k} className="p-6">
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand">{s.k}</p>
                <p className="mt-2 text-[13px] leading-[1.65] text-secondary">{s.t}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" variant="canvas" className="border-y border-subtle">
          <div className="max-w-[760px]">
            <Eyebrow>Support</Eyebrow>
            <h2 className="mt-3 text-[28px] sm:text-[32px] font-semibold tracking-tight text-primary">Frequently asked questions</h2>
            <div className="mt-8">
              <FAQAccordion items={FAQ_ITEMS} />
            </div>
          </div>
        </Section>

        {/* FINAL CTA */}
        <Section variant="surface" noPadding className="border-b border-subtle">
          <div className="py-12 sm:py-14 lg:py-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-tight text-primary">Find your next professional opportunity.</h2>
              <p className="mt-2 text-[14px] sm:text-[15px] leading-[1.6] text-secondary max-w-[58ch]">
                Explore available projects and apply for opportunities suited to your experience, location and availability.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center px-6 py-3 rounded-[10px] text-[15px] font-medium bg-[var(--color-action-primary)] text-inverse hover:bg-[var(--color-action-primary-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[44px] w-full sm:w-auto"
              >
                Explore opportunities
              </Link>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-6 py-3 rounded-[10px] text-[15px] font-medium bg-surface text-brand border border-brand hover:bg-brand-subtle transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[44px] w-full sm:w-auto"
              >
                How applications work
              </a>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
