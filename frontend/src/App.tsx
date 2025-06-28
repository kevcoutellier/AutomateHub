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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;