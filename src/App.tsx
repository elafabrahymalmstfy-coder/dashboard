import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManageData from './pages/ManageData';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Restricted Access: Only Login route exists (no public Sign-Up) */}
            <Route path="/login" element={<Login />} />

            {/* Protected Authenticated Shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route
                path="manage"
                element={
                  <ProtectedRoute requireAdmin>
                    <ManageData />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
