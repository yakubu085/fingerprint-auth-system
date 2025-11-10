import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

// ProtectedRoute component for role-based access control
const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading, role, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role requirements
  if (requiredRole && role !== requiredRole) {
    // Show access denied message for wrong role
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center p-4">
          <div className="mb-4">
            <i className="bi bi-shield-exclamation text-danger" style={{ fontSize: '4rem' }}></i>
          </div>
          <h2 className="text-danger mb-3">Access Denied</h2>
          <p className="text-muted mb-4">
            You don't have permission to access this page.
            {requiredRole && (
              <span> This page requires <strong>{requiredRole}</strong> privileges.</span>
            )}
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
            {role === 'user' && (
              <button
                className="btn btn-outline-primary"
                onClick={() => window.location.href = '/user/dashboard'}
              >
                User Dashboard
              </button>
            )}
            {role === 'admin' && (
              <button
                className="btn btn-outline-primary"
                onClick={() => window.location.href = '/admin/dashboard'}
              >
                Admin Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role, render children
  return children;
};

// AdminRoute - specifically for admin-only pages
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin" redirectTo="/login">
    {children}
  </ProtectedRoute>
);

// UserRoute - specifically for user-only pages
export const UserRoute = ({ children }) => (
  <ProtectedRoute requiredRole="user" redirectTo="/login">
    {children}
  </ProtectedRoute>
);

// AuthRoute - for any authenticated user (admin or user)
export const AuthRoute = ({ children }) => (
  <ProtectedRoute redirectTo="/login">
    {children}
  </ProtectedRoute>
);

// PublicRoute - accessible to all, but redirects authenticated users to dashboard
export const PublicRoute = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Not authenticated, show public content
  return children;
};

export default ProtectedRoute;