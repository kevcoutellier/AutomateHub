import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { HelmetProvider } from 'react-helmet-async'; // Temporairement commenté
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import PerformanceMonitor from './components/PerformanceMonitor';
// import './styles/responsive.css'; // Temporairement commenté
import { HomePage } from './pages/HomePage';
import { ExpertProfilePage } from './pages/ExpertProfilePage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ExpertsPage } from './pages/ExpertsPage';
import { DashboardPage } from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminPage from './pages/AdminPage';
import BillingPage from './pages/BillingPage';
import { ExpertServicesPage } from './pages/ExpertServicesPage';
import { ExpertProjectsPage } from './pages/ExpertProjectsPage';
import { ClientProjectsPage } from './pages/ClientProjectsPage';
import { ClientBillingPage } from './pages/ClientBillingPage';
import { ClientOnlyRoute, ExpertOnlyRoute, AdminOnlyRoute, AuthenticatedRoute } from './components/auth/ProtectedRoute';
import { AnalyticsTestPage } from './components/analytics/AnalyticsTestPage';

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
            <Route path="/dashboard" element={
              <AuthenticatedRoute>
                <DashboardPage />
              </AuthenticatedRoute>
            } />
            <Route path="/profile" element={
              <AuthenticatedRoute>
                <ProfilePage />
              </AuthenticatedRoute>
            } />
            <Route path="/project/:id" element={
              <AuthenticatedRoute>
                <ProjectDetailPage />
              </AuthenticatedRoute>
            } />
            <Route path="/admin" element={
              <AdminOnlyRoute>
                <AdminPage />
              </AdminOnlyRoute>
            } />
            <Route path="/billing" element={
              <AuthenticatedRoute>
                <BillingPage />
              </AuthenticatedRoute>
            } />
            <Route path="/analytics-test" element={
              <AuthenticatedRoute>
                <AnalyticsTestPage />
              </AuthenticatedRoute>
            } />
            {/* Expert-specific routes */}
            <Route path="/expert/services" element={
              <ExpertOnlyRoute>
                <ExpertServicesPage />
              </ExpertOnlyRoute>
            } />
            <Route path="/expert/projects" element={
              <ExpertOnlyRoute>
                <ExpertProjectsPage />
              </ExpertOnlyRoute>
            } />
            {/* Client-specific routes */}
            <Route path="/client/projects" element={
              <ClientOnlyRoute>
                <ClientProjectsPage />
              </ClientOnlyRoute>
            } />
            <Route path="/client/billing" element={
              <ClientOnlyRoute>
                <ClientBillingPage />
              </ClientOnlyRoute>
            } />
            {/* Settings route */}
            <Route path="/settings" element={
              <AuthenticatedRoute>
                <ProfilePage />
              </AuthenticatedRoute>
            } />
          </Routes>
        </main>
        <Footer />
        
        {/* Performance Monitor - Only in development */}
        {import.meta.env.DEV && (
          <PerformanceMonitor enabled={true} showDebugInfo={false} />
        )}
      </div>
    </Router>
  );
}

export default App;