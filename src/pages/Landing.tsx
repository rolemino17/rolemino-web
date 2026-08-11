import { useQuery } from "@tanstack/react-query";
import { Hero } from "../components/Hero";
import { Statistics } from "../components/Statistics";
import { UserJourney } from "../components/UserJourney";
import { WhyRolemino } from "../components/WhyRolemino";
import { FAQ } from "../components/FAQ";
import { JobCard } from "../components/JobCard";
import { Footer } from "../components/Footer";
import { getJobs } from "../api/api";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";

export function Landing() {
  const navigate = useNavigate();

  // Fetching jobs using Tanstack Query
  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: getJobs,
  });

  return (
    <div>
      <div>
        <Hero />
      </div>
      <div>
        <Statistics />
      </div>
      <div>
        <UserJourney />
      </div>
      <div>
        <WhyRolemino />
      </div>
      <div id="faq">
        <FAQ />
      </div>
      <section className="py-10 bg-secondary font-readexpro">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            Featured Jobs
          </h2>
          {jobs?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.slice(0, 3).map((job) => (
                <div key={job.id}>
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-center mt-9">
          <Button variant="accent" onClick={() => navigate(`/jobs`)}>
            Explore All Jobs
          </Button>
        </div>
      </section>
      <div>
        <Footer />
      </div>
    </div>
  );
}
