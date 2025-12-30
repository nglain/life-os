import React, { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

export function LoginPage() {
  const { signIn, signUp, loading, error } = useAuthContext();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [logoTaps, setLogoTaps] = useState(0);

  const handleLogoTap = () => {
    const newTaps = logoTaps + 1;
    setLogoTaps(newTaps);
    if (newTaps >= 5) {
      setEmail('demo@lifeos.app');
      setPassword('demo123');
      setLogoTaps(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Заполните все поля');
      return;
    }

    if (password.length < 6) {
      setLocalError('Пароль должен быть не менее 6 символов');
      return;
    }

    const success = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (!success && !error) {
      setLocalError(isSignUp ? 'Ошибка регистрации' : 'Неверные учетные данные');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo" onClick={handleLogoTap} style={{ cursor: 'pointer' }}>
          <Logo size={80} />
          <h1 className="login-title">
            <span className="logo-life">Life</span>
            <span className="logo-os">OS</span>
          </h1>
          <p className="login-subtitle">Система управления знаниями</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="login-field">
            <label className="login-label">Пароль</label>
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          {(error || localError) && (
            <p className="login-error">{error || localError}</p>
          )}

          {/* Submit */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Загрузка...' : isSignUp ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="login-toggle">
          {isSignUp ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
          <button className="login-toggle-btn" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </p>
      </div>
    </div>
  );
}
