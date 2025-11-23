import React, { useState } from 'react';
import '../styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from './utils';
const API_BASE = 'http://localhost:8080';

function Login() {
  const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo({ ...loginInfo, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) return handleError('Email and password are required');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo),
      });
      const result = await response.json();
      const { success, message, jwtToken, name, error, userId, role } = result;
      if (success) {
        handleSuccess(message);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('userName', name);
        localStorage.setItem('userId', userId);
        localStorage.setItem('role', role);

        setTimeout(() => {
          if (role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/predict', { replace: true });
          }
        }, 1000);
      } else {
        handleError(error?.details?.[0]?.message || message);
      }
    } catch (err) {
      handleError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="login-modern-bg">
      <div className="login-modern-container">
        {/* Partie image/animation à gauche */}
        <div className="login-modern-visual">
          <img
            src="https://images.pexels.com/photos/1181353/pexels-photo-1181353.jpeg?auto=compress&w=600"
            alt="African man using computer"
            className="login-modern-img"
          />
          <div className="login-modern-animation">
            <svg width="120" height="120">
              <circle cx="60" cy="60" r="50" fill="#00b8d9" opacity="0.15">
                <animate attributeName="r" values="50;60;50" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
            <p className="login-modern-quote">
              “La santé, c’est la première richesse.”
              <br />
              <span>- Ralph Waldo Emerson</span>
            </p>
          </div>
        </div>

        {/* Partie formulaire à droite */}
        <div className="login-modern-form">
          <div className="glass-card">
            <h2>Bienvenue 👋</h2>
            <p>Connectez-vous à votre espace HealthyAI</p>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Adresse email"
                value={loginInfo.email}
                onChange={handleChange}
                autoComplete="username"
              />
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={loginInfo.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button type="submit" className="login-btn">
                Se connecter
              </button>
              <p className="signup-text">
                Pas de compte ? <Link to="/signup">Créer un compte</Link>
              </p>
            </form>
            <div className="or-divider">
              <span>OU</span>
            </div>
            <a href={`${API_BASE}/auth/google`} className="google-login-button">
              <img
                src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png"
                alt="Google Logo"
              />
              <span>Connexion avec Google</span>
            </a>
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
