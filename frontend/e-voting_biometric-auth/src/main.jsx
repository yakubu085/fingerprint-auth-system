import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'

// Import components
import Home from './components/Home.jsx'
import Scan from './components/Scan.jsx'
import Match from './components/Match.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Dashboard from './components/Dashboard.jsx'
import Voting from './components/Voting.jsx'

// Import protected route components
import { ProtectedRoute, AdminRoute, UserRoute, PublicRoute } from './components/ProtectedRoute.jsx'

// Import enhanced components (will be created)
import EnhancedNavbar from './components/EnhancedNavbar.jsx'

// Import admin components
import AdminDashboard from './components/Admin/Dashboard.jsx'
import ElectionManagement from './components/Admin/ElectionManagement.jsx'
import CandidateManagement from './components/Admin/CandidateManagement.jsx'
import ResultsAnalytics from './components/Admin/ResultsAnalytics.jsx'

// Import user components
import UserDashboard from './components/User/Dashboard.jsx'
import VotingInterface from './components/User/VotingInterface.jsx'
import ProfileSettings from './components/User/ProfileSettings.jsx'

// Import utility components
import ScannerDemo from './components/ScannerDemo.jsx'

// Import layout components
import AdminLayout from './components/Layouts/AdminLayout.jsx'
import UserLayout from './components/Layouts/UserLayout.jsx'
import PublicLayout from './components/Layouts/PublicLayout.jsx'

import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Create router with protected routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout><Home /></PublicLayout>
  },
  {
    path: '/login',
    element: <PublicRoute><PublicLayout><Login /></PublicLayout></PublicRoute>
  },
  {
    path: '/signup',
    element: <PublicRoute><PublicLayout><Signup /></PublicLayout></PublicRoute>
  },
  {
    path: '/scanner-demo',
    element: <PublicLayout><ScannerDemo /></PublicLayout>
  },
  {
    path: '/scan',
    element: <PublicLayout><Scan /></PublicLayout>
  },
  {
    path: '/match',
    element: <PublicLayout><Match /></PublicLayout>
  },
  // Admin routes
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      {
        index: true,
        element: <AdminDashboard />
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />
      },
      {
        path: 'elections',
        element: <ElectionManagement />
      },
      {
        path: 'candidates',
        element: <CandidateManagement />
      },
      {
        path: 'results',
        element: <ResultsAnalytics />
      }
    ]
  },
  // User routes
  {
    path: '/user',
    element: <UserRoute><UserLayout /></UserRoute>,
    children: [
      {
        index: true,
        element: <UserDashboard />
      },
      {
        path: 'dashboard',
        element: <UserDashboard />
      },
      {
        path: 'profile',
        element: <ProfileSettings />
      }
    ]
  },
  // Election routes (accessible by authenticated users)
  {
    path: '/election/:id/vote',
    element: <ProtectedRoute><VotingInterface /></ProtectedRoute>
  },
  {
    path: '/election/:id/results',
    element: <ProtectedRoute><ResultsAnalytics /></ProtectedRoute>
  },
  // Legacy routes for backward compatibility
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  {
    path: '/voting',
    element: <ProtectedRoute><Voting /></ProtectedRoute>
  },
  // 404 route
  {
    path: '*',
    element: (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <h1 className="display-1 text-primary">404</h1>
          <h2>Page Not Found</h2>
          <p className="text-muted">The page you're looking for doesn't exist.</p>
          <a href="/" className="btn btn-primary">Go Home</a>
        </div>
      </div>
    )
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)
