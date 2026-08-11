import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { Loading } from './components/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

const Landing = lazy(() => import('./pages/Landing').then(({ Landing }) => ({ default: Landing })));
const JobListing = lazy(() => import('./pages/JobListing').then(({ JobListing }) => ({ default: JobListing })));
const JobDetails = lazy(() => import('./pages/JobDetails').then(({ JobDetails }) => ({ default: JobDetails })));
const JobApplication = lazy(() =>
  import('./pages/JobApplication').then(({ JobApplication }) => ({ default: JobApplication }))
);
const DocumentUpload = lazy(() =>
  import('./pages/DocumentUpload').then(({ DocumentUpload }) => ({ default: DocumentUpload }))
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Navbar />
        <Toaster position="top-right" />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/jobs" element={<JobListing />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/jobs/:id/apply" element={<JobApplication />} />
            <Route path="/document-upload" element={<DocumentUpload />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
