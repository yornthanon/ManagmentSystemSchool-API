# OAuth2 Frontend Implementation Guide

This guide shows how to implement Google OAuth2 login in your React frontend.

---

## Quick Start

### 1. Create OAuth2 Redirect Component

Create `src/pages/OAuth2Redirect.jsx`:

```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Your auth context

export function OAuth2Redirect() {
  const navigate = useNavigate();
  const { setAuthToken, setUser } = useAuth();

  useEffect(() => {
    const handleOAuth2Callback = async () => {
      try {
        // Extract URL parameters
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');
        const role = params.get('role');
        const error = params.get('error');

        if (error) {
          console.error('OAuth2 error:', error);
          handleError(error);
          return;
        }

        if (!token) {
          throw new Error('No token received from server');
        }

        // Store authentication data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', role);

        // Update auth context
        setAuthToken(token);
        setUser({ email, role });

        // Redirect to home or dashboard
        navigate('/', { replace: true });
      } catch (error) {
        console.error('OAuth2 callback error:', error);
        navigate('/login?error=oauth2_failed', { replace: true });
      }
    };

    handleOAuth2Callback();
  }, [navigate, setAuthToken, setUser]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>
        <h2>Authenticating...</h2>
        <p>Please wait while we complete your login.</p>
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function handleError(error) {
  const errorMessages = {
    'admin_cannot_use_oauth2': 'Admin users cannot login with OAuth2. Please use password login.',
    'user_not_found': 'User not found. Please contact support.',
    'oauth2_failed': 'OAuth2 authentication failed. Please try again.',
  };

  const message = errorMessages[error] || `Authentication error: ${error}`;
  // Show error notification to user
  console.error(message);
}
```

### 2. Create Login Page with OAuth2 Button

Create `src/pages/LoginPage.jsx`:

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth2 endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>School Management System</h1>

      {error && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: '#fee', 
          color: '#c33', 
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePasswordLogin}>
        <h2>Password Login</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <span>or</span>
      </div>

      <button
        onClick={handleGoogleLogin}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#ffffff',
          color: '#333',
          border: '2px solid #3498db',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}
      >
        <img 
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3C/svg%3E"
          alt="Google"
          style={{ width: '20px', height: '20px' }}
        />
        Login with Google
      </button>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        Google login does not require application password
      </p>
    </div>
  );
}
```

### 3. Setup Auth Context

Create `src/context/AuthContext.jsx`:

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');

    if (token && email) {
      setAuthToken(token);
      setUser({ email, role });
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setAuthToken(null);
    setUser(null);
  };

  const isAuthenticated = !!authToken;

  return (
    <AuthContext.Provider value={{
      authToken,
      setAuthToken,
      user,
      setUser,
      logout,
      isAuthenticated,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 4. Setup Router with OAuth2 Redirect

Create `src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { OAuth2Redirect } from './pages/OAuth2Redirect';
import { HomePage } from './pages/HomePage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### 5. Setup API Calls with JWT Token

Create `src/utils/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';

export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// Example usage:
export async function getStudents() {
  return apiCall('/students');
}

export async function createStudent(data) {
  return apiCall('/students', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### 6. Update Vite Config (if using Vite)

`vite.config.js`:

```javascript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});
```

---

## Complete App Example

```jsx
// src/App.jsx - Full application setup

import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { OAuth2Redirect } from './pages/OAuth2Redirect';
import { apiCall } from './utils/api';
import { useEffect, useState } from 'react';

function HomePage() {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      const data = await apiCall('/students');
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  }

  return (
    <div>
      <nav style={{ 
        backgroundColor: '#333', 
        color: 'white', 
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <h1>School Management System</h1>
        <div>
          <span>Welcome, {user?.email}!</span>
          <button 
            onClick={logout}
            style={{ marginLeft: '20px', padding: '5px 10px' }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: '20px' }}>
        <h2>Students</h2>
        <p>Total students: {students.length}</p>
        {students.map(student => (
          <div key={student.id} style={{ 
            padding: '10px', 
            margin: '10px 0', 
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            {student.fullName} - {student.email}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## Environment Variables

Create `.env`:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=School Management System
```

Use in frontend:

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

---

## Testing OAuth2 Flow

### Test in Development

1. Start backend:
   ```bash
   cd /home/yornthanon/IdeaProjects
   ./gradlew bootRun
   ```

2. Start frontend:
   ```bash
   npm start
   ```

3. Open `http://localhost:5173/login`

4. Click "Login with Google"

5. You'll be redirected to Google login screen

6. After login, you'll be redirected back to app with JWT token

### Test with cURL

```bash
# Get Google OAuth2 redirect URL
curl -I http://localhost:8080/oauth2/authorization/google
# Should return 302 with Location header

# Manual token test (if you have a token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/students
```

---

## Common Issues

### Issue: CORS Error

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
1. Verify frontend URL is in `SecurityConfig` allowed origins
2. Check backend logs for CORS configuration
3. Ensure frontend is on correct port (5173)

### Issue: Token Not Stored

**Error:** Token not appearing in localStorage

**Solution:**
1. Check browser console for errors
2. Verify `OAuth2Redirect.jsx` is being loaded
3. Check URL parameters: `?token=...`

### Issue: "unauthorized" when calling API

**Error:** 401 response from protected endpoints

**Solution:**
1. Verify token is in localStorage: `localStorage.getItem('authToken')`
2. Check Authorization header is correct: `Bearer TOKEN`
3. Verify token not expired

---

## Production Checklist

- [ ] Update `OAUTH2_REDIRECT_URL` to production domain
- [ ] Change `API_BASE_URL` to production backend
- [ ] Use secure storage for tokens (HttpOnly cookies)
- [ ] Enable HTTPS
-[ ] Add error boundaries
- [ ] Setup error logging/monitoring
- [ ] Test all OAuth2 flows
- [ ] Setup automated backups
- [ ] Configure rate limiting
- [ ] Update CORS allowed origins

---

**Last Updated:** June 1, 2026  
**Version:** 1.0

