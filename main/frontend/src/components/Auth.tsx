import React, { useState } from 'react';
import '../styles/Auth.css';

interface AuthProps {
  onLoginSuccess: (userId: number, username: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Hiba történt');
        return;
      }

      if (isLogin) {
        onLoginSuccess(data.userId, data.username);
        if (rememberMe) {
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('username', data.username);
        } else {
          sessionStorage.setItem('userId', data.userId);
          sessionStorage.setItem('username', data.username);
        }
      } else {
        setIsLogin(true);
        setPassword('');
        setSuccess('Sikeres regisztráció! Kérjük, lépjen be.');
      }
    } catch (err) {
      setError('Hálózati hiba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isLogin ? 'Üdv újra!' : 'Csatlakozz hozzánk'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Jelentkezz be a folytatáshoz' : 'Hozz létre egy fiókot'}
          </p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Felhasználónév</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="pl. johndoe"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {isLogin && (
            <div className="checkbox-group">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="rememberMe">Maradjak bejelentkezve</label>
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Feldolgozás...' : isLogin ? 'Bejelentkezés' : 'Regisztráció'}
          </button>
        </form>

        <div className="toggle-auth">
          {isLogin ? (
            <p>
              Nincs még fiókod?{' '}
              <button onClick={() => setIsLogin(false)} className="toggle-button">
                Regisztrálj
              </button>
            </p>
          ) : (
            <p>
              Van már fiókod?{' '}
              <button onClick={() => setIsLogin(true)} className="toggle-button">
                Lépj be
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};