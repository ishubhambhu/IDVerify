import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { StudentEditor } from './pages/StudentEditor';
import { VerificationView } from './pages/VerificationView';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<StudentEditor />} />
            <Route path="/edit/:id" element={<StudentEditor />} />
            <Route path="/verify/:id" element={<VerificationView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;