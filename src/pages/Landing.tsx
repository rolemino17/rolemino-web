import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Hero } from "../components/Hero";
import { Statistics } from "../components/Statistics";
import { UserJourney } from "../components/UserJourney";
import { WhyKoovly } from "../components/WhyKoovly";
import { FAQ } from "../components/FAQ";
import { JobCard } from "../components/JobCard";
import { Footer } from "../components/Footer";
import { getJobs } from "../api/api";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";

// Import AOS (Animate On Scroll) library and styles
import AOS from "aos";
import "aos/dist/aos.css";

export function Landing() {
  const navigate = useNavigate();

  // Initialize AOS on mount
  useEffect(() => {
    AOS.init({ once: true, duration: 800, offset: 80 });
  }, []);

  // Fetching jobs using Tanstack Query
  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: getJobs,
  });

  return (
    <div>
      <div data-aos="fade-up">
        <Hero />
      </div>
      <div data-aos="fade-up" data-aos-delay="100">
        <Statistics />
      </div>
      <div data-aos="fade-up" data-aos-delay="200">
        <UserJourney />
      </div>
      <div data-aos="fade-up" data-aos-delay="300">
        <WhyKoovly />
      </div>
      <div data-aos="fade-up" data-aos-delay="400" id="faq">
        <FAQ />
      </div>
      <section
        className="py-10 bg-secondary font-readexpro"
        data-aos="fade-up"
        data-aos-delay="500"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            Featured Jobs
          </h2>
          {jobs?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.slice(0, 3).map((job, idx) => (
                <div key={job.id} data-aos="zoom-in" data-aos-delay={600 + idx * 100}>
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-center mt-9" data-aos="fade-up" data-aos-delay="800">
          <Button variant="accent" onClick={() => navigate(`/jobs`)}>
            Explore All Jobs
          </Button>
        </div>
      </section>
      <div data-aos="fade-up" data-aos-delay="900">
        <Footer />
      </div>
    </div>
  );
}