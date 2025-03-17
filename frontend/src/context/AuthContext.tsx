import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Create axios instance with default config
export const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Set up axios interceptor for auth and error handling
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // If token expired, try to refresh or logout
          if (token) {
            try {
              const response = await api.post('/auth/refresh', { token });
              const { token: newToken } = response.data;
              
              setToken(newToken);
              localStorage.setItem('token', newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              return api(originalRequest);
            } catch (refreshError) {
              handleLogout();
              return Promise.reject(refreshError);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common.Authorization;
    navigate('/login', { replace: true });
  };

  // Check token validity and auto-login
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          // Verify token hasn't expired
          const decoded = jwtDecode(storedToken);
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            throw new Error('Token expired');
          }

          // Verify token with backend
          await api.get('/auth/verify', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          setIsAuthenticated(true);
          api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        } catch (error) {
          console.error('Auto-login failed:', error);
          handleLogout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token: newToken } = response.data;
      
      setUser(userData);
      setToken(newToken);
      setIsAuthenticated(true);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { email, password });
      const { user: userData, token: newToken } = response.data;
      
      setUser(userData);
      setToken(newToken);
      setIsAuthenticated(true);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      isAuthenticated,
      login, 
      register, 
      logout: handleLogout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
