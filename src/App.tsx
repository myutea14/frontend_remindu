import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import DashboardPage  from './pages/DashboardPage';
import ReminderPage   from './pages/ReminderPage';
import KalenderPage   from './pages/KalenderPage';
import KomunitasPage  from './pages/KomunitasPage';
import HistoryPage    from './pages/HistoryPage';
import ProfilPage     from './pages/ProfilPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import LandingPage    from './pages/LandingPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

import AdminGroupsPage from './pages/admin/AdminGroupsPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Loading...</div>;
  }
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Loading...</div>;
  }
  
  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

import ChatPanel from './components/layout/ChatPanel';

const AppLayout = () => {
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#E3FDFA' }}>
      {/* Fixed sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main workspace */}
      <main className="flex-1 flex flex-col lg:ml-[280px] h-screen overflow-hidden transition-all duration-300">
        {/* Sticky top navbar */}
        <Navbar 
          onOpenChat={() => setIsChatOpen(true)} 
          onToggleSidebar={() => setIsMobileMenuOpen(true)}
        />

        {/* Chat Panel */}
        <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/reminders"   element={<ReminderPage />} />
            <Route path="/calendar"    element={<KalenderPage />} />
            <Route path="/communities" element={<KomunitasPage />} />
            <Route path="/history"     element={<HistoryPage />} />
            <Route path="/profile"     element={<ProfilPage />} />
            <Route path="*"            element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Admin Routes */}
          <Route path="/admin">
            <Route path="login" element={<AdminLoginPage />} />
            <Route element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="groups" element={<AdminGroupsPage />} />
            </Route>
          </Route>
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
// Refactor global provider wrapper
//pembaruan terbaru route
