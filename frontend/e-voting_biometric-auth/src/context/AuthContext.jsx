import { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        role: action.payload.role,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// API service functions
const authService = {
  // Check if user is authenticated on app load
  checkAuthStatus: async () => {
    try {
      const response = await fetch('/Projects/biometric-evoting/api/auth/check_role.php', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            user: data.user_data,
            role: data.role
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Auth check failed:', error);
      return null;
    }
  },

  // Login with password
  loginWithPassword: async (email, password) => {
    try {
      const response = await fetch('/Projects/biometric-evoting/api/user/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Login with biometric
  loginWithBiometric: async (fingerprintTemplate) => {
    try {
      const response = await fetch('/Projects/biometric-evoting/api/user/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          biometric: true,
          template: fingerprintTemplate
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Biometric login failed:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Logout
  logout: async () => {
    try {
      // For PHP sessions, we can just clear the session
      const response = await fetch('/Projects/biometric-evoting/api/logout.php', {
        method: 'POST',
        credentials: 'include'
      });
      return response.ok;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      try {
        const authData = await authService.checkAuthStatus();

        if (authData) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: authData
          });
        } else {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_FAILURE,
            payload: 'Session expired'
          });
        }
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: 'Authentication check failed'
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials, type = 'password') => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      let result;
      if (type === 'password') {
        result = await authService.loginWithPassword(credentials.email, credentials.password);
      } else if (type === 'biometric') {
        result = await authService.loginWithBiometric(credentials.template);
      }

      if (result.success) {
        const authData = await authService.checkAuthStatus();
        if (authData) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: authData
          });
          return { success: true };
        }
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: result.message || 'Login failed'
      });
      return { success: false, message: result.message || 'Login failed' };

    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: 'Network error'
      });
      return { success: false, message: 'Network error' };
    }
  };

  // Logout function
  const logout = async () => {
    await authService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Value object to be provided to consumers
  const value = {
    ...state,
    login,
    logout,
    clearError,
    isAuthenticated: state.isAuthenticated && !state.isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;