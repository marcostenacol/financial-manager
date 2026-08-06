import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useRegister } from '../hooks/useRegister';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.register.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password });
      navigate('/login', { state: { message: t('auth.register.success') } });
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || t('auth.register.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-10">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-app-border shadow-app-card md:grid-cols-[1fr_1.15fr]">
        <div className="hidden flex-col justify-between border-r border-app-border bg-app-surface-2 p-9 md:flex">
          <div className="font-display text-2xl text-app-ink">
            Croesus<span className="text-app-accent">.</span>
          </div>
          <div className="space-y-3 border-t border-app-border pt-5 font-mono text-xs text-app-muted">
            <p className="text-app-ink">{t('auth.brand.taglinePrimary')}</p>
            <p>{t('auth.brand.taglineSecondary')}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 bg-app-surface p-8 sm:p-10">
          <div>
            <h1 className="font-display text-2xl font-medium text-app-ink">{t('auth.register.title')}</h1>
            <p className="mt-1 text-sm text-app-muted">{t('auth.register.subtitle')}</p>
          </div>

          {error && (
            <div className="rounded-md bg-app-danger/10 p-3 text-sm text-app-danger ring-1 ring-app-danger/20">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="group relative">
              <div className="absolute inset-y-0 left-0 flex items-center text-app-muted transition-colors group-focus-within:text-app-accent">
                <User size={17} />
              </div>
              <input
                type="text"
                required
                className="block w-full border-b border-app-border bg-transparent py-2.5 pl-7 text-app-ink placeholder-app-muted transition-colors focus:border-app-accent focus:outline-none"
                placeholder={t('auth.register.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="group relative">
              <div className="absolute inset-y-0 left-0 flex items-center text-app-muted transition-colors group-focus-within:text-app-accent">
                <Mail size={17} />
              </div>
              <input
                type="email"
                required
                className="block w-full border-b border-app-border bg-transparent py-2.5 pl-7 text-app-ink placeholder-app-muted transition-colors focus:border-app-accent focus:outline-none"
                placeholder={t('auth.register.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="group relative">
              <div className="absolute inset-y-0 left-0 flex items-center text-app-muted transition-colors group-focus-within:text-app-accent">
                <Lock size={17} />
              </div>
              <input
                type="password"
                required
                className="block w-full border-b border-app-border bg-transparent py-2.5 pl-7 text-app-ink placeholder-app-muted transition-colors focus:border-app-accent focus:outline-none"
                placeholder={t('auth.register.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="group relative">
              <div className="absolute inset-y-0 left-0 flex items-center text-app-muted transition-colors group-focus-within:text-app-accent">
                <Lock size={17} />
              </div>
              <input
                type="password"
                required
                className="block w-full border-b border-app-border bg-transparent py-2.5 pl-7 text-app-ink placeholder-app-muted transition-colors focus:border-app-accent focus:outline-none"
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-sm bg-app-accent py-3 text-sm font-bold uppercase tracking-wide text-app-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : t('auth.register.submit')}
            </button>
          </form>

          <p className="text-center text-sm text-app-muted">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-app-accent hover:opacity-80 transition-opacity">
              {t('auth.register.signInLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
