import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { ExpertProfilePage } from './pages/ExpertProfilePage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ExpertsPage } from './pages/ExpertsPage';
import { DashboardPage } from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminPage from './pages/AdminPage';
import BillingPage from './pages/BillingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScrollToTop />
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/experts" element={<ExpertsPage />} />
            <Route path="/expert/:id" element={<ExpertProfilePage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/project/:id" element={<ProjectDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/billing" element={<BillingPage />} />
            {/* Expert-specific routes */}
            <Route path="/expert/services" element={<DashboardPage />} />
            <Route path="/expert/projects" element={<DashboardPage />} />
            {/* Client-specific routes */}
            <Route path="/client/projects" element={<DashboardPage />} />
            <Route path="/client/billing" element={<BillingPage />} />
            {/* Settings route */}
            <Route path="/settings" element={<ProfilePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;