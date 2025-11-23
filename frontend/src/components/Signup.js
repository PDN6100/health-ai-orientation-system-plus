import React, { useState } from 'react';
import '../styles/Signup.css';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from './utils';
const API_BASE = 'http://localhost:8080';

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo({ ...signupInfo, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      return handleError('Nom, email et mot de passe requis');
    }
    try {
      const url = `${API_BASE}/auth/signup`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupInfo),
      });
      const result = await response.json();
      const { success, message, error } = result;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else if (error) {
        const details = error?.details?.[0]?.message;
        handleError(details || message);
      } else {
        handleError(message);
      }
    } catch (err) {
      handleError(err.message || 'Erreur serveur');
    }
  };

  return (
    <div className="signup-modern-bg">
      <div className="signup-modern-container">
        {/* Partie image/animation à gauche */}
        <div className="signup-modern-visual">
          <img
            src="https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&w=600"
            alt="African woman using computer"
            className="signup-modern-img"
          />
          <div className="signup-modern-animation">
            <svg width="120" height="120">
              <circle cx="60" cy="60" r="50" fill="#00b8d9" opacity="0.15">
                <animate attributeName="r" values="50;60;50" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
            <p className="signup-modern-quote">
              “Inscrivez-vous et prenez soin de votre santé.”
              <br />
              <span>- HealthyAI</span>
            </p>
          </div>
        </div>
        {/* Partie formulaire à droite */}
        <div className="signup-modern-form">
          <div className="glass-card">
            <h2>Créer un compte 👋</h2>
            <p>Rejoignez la communauté HealthyAI</p>
            <form onSubmit={handleSignup}>
              <input
                onChange={handleChange}
                type="text"
                name="name"
                autoFocus
                placeholder="Votre nom"
                value={signupInfo.name}
              />
              <input
                onChange={handleChange}
                type="email"
                name="email"
                placeholder="Votre email"
                value={signupInfo.email}
              />
              <input
                onChange={handleChange}
                type="password"
                name="password"
                placeholder="Votre mot de passe"
                value={signupInfo.password}
              />
              <button type="submit" className="signup-btn">
                S’inscrire
              </button>
              <p className="login-text">
                Déjà inscrit ? <Link to="/login">Se connecter</Link>
              </p>
            </form>
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
