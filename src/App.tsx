import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { JobListing } from './pages/JobListing';
import { JobDetails } from './pages/JobDetails';
import { JobApplication } from './pages/JobApplication';
import { DocumentUpload } from './pages/DocumentUpload';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/jobs" element={<JobListing />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/jobs/:id/apply" element={<JobApplication />} />
          <Route path="/document-upload" element={<DocumentUpload />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;