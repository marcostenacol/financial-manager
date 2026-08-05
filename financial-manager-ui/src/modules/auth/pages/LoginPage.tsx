import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../contexts/useAuth';
import { useToast } from '../../../shared/components/useToast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn({ email, password });
      navigate('/');
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || 'Erro ao realizar login. Tente novamente.');
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
            <p className="text-app-ink">Um livro-caixa simples pra sua vida financeira.</p>
            <p>Carteiras, transações e metas — tudo num só lugar.</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 bg-app-surface p-8 sm:p-10">
          <div>
            <h1 className="font-display text-2xl font-medium text-app-ink">Bem-vindo de volta</h1>
            <p className="mt-1 text-sm text-app-muted">Acesse sua conta para continuar</p>
          </div>

          {error && (
            <div className="rounded-md bg-app-danger/10 p-3 text-sm text-app-danger ring-1 ring-app-danger/20">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="group relative">
              <div className="absolute inset-y-0 left-0 flex items-center text-app-muted transition-colors group-focus-within:text-app-accent">
                <Mail size={17} />
              </div>
              <input
                type="email"
                required
                className="block w-full border-b border-app-border bg-transparent py-2.5 pl-7 text-app-ink placeholder-app-muted transition-colors focus:border-app-accent focus:outline-none"
                placeholder="Seu e-mail"
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
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end text-sm">
              <button
                type="button"
                onClick={() => showToast('Recuperação de senha ainda não está disponível. Entre em contato com o suporte.', 'info')}
                className="font-medium text-app-muted transition-colors hover:text-app-accent"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-sm bg-app-accent py-3 text-sm font-bold uppercase tracking-wide text-app-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-app-muted">
            Ainda não tem uma conta?{' '}
            <Link to="/register" className="font-medium text-app-accent hover:opacity-80 transition-opacity">
              Cadastre-se agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
