import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  const navigate = useNavigate();
  const { register } = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password });
      navigate('/login', { state: { message: 'Conta criada com sucesso! Faça login para continuar.' } });
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || 'Erro ao criar conta. Tente novamente.');
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
            <h1 className="font-display text-2xl font-medium text-app-ink">Criar nova conta</h1>
            <p className="mt-1 text-sm text-app-muted">Junte-se a nós e organize sua vida financeira</p>
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
                placeholder="Seu nome completo"
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
                placeholder="Crie uma senha"
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
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-sm bg-app-accent py-3 text-sm font-bold uppercase tracking-wide text-app-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Cadastrar'}
            </button>
          </form>

          <p className="text-center text-sm text-app-muted">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-app-accent hover:opacity-80 transition-opacity">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
