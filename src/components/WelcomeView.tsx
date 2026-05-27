import React, { useState } from 'react';
import { User, Screen } from '../types';

interface WelcomeViewProps {
  onLogin: (user: User) => void;
  onNavigate: (screen: Screen) => void;
}

export default function WelcomeView({ onLogin, onNavigate }: WelcomeViewProps) {
  const [subMode, setSubMode] = useState<'onboarding' | 'login' | 'register'>('onboarding');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subMode === 'login') {
      onLogin({
        nome: email.split('@')[0] || "Usuário",
        email: email || "usuario@exemplo.com.br"
      });
    } else {
      onLogin({
        nome: name || "João Silva",
        email: email || "joao.silva@exemplo.com.br"
      });
    }
    onNavigate('dashboard');
  };

  const loginWithGoogle = () => {
    onLogin({
      nome: "João Silva",
      email: "joao.silva@gmail.com"
    });
    onNavigate('dashboard');
  };

  if (subMode === 'onboarding') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto py-12">
        {/* Background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Brand Logo Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100 mb-2">
            <span className="material-symbols-outlined text-4xl font-semibold">schema</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Contracheque <span className="text-emerald-700">AI</span>
          </h2>
        </div>

        {/* Headline */}
        <div className="max-w-md mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
            Entenda seu salário, descontos, adicionais e horas trabalhadas em poucos segundos.
          </h1>
          <p className="mt-4 text-sm md:text-base text-slate-500 leading-relaxed">
            Seu assistente financeiro pessoal para decodificar sua folha de pagamento com precisão e clareza de forma imediata.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center w-full max-w-xs gap-4">
          <button
            onClick={() => onNavigate('upload')}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">document_scanner</span>
            <span className="font-semibold text-sm">Enviar contracheque</span>
          </button>

          <div className="flex w-full gap-2 mt-2">
            <button
              onClick={() => setSubMode('login')}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => setSubMode('register')}
              className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              Criar conta
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex items-center gap-1.5 text-slate-400 text-xs">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span>Seus dados são criptografados e 100% seguros.</span>
        </div>
      </div>
    );
  }

  // Auth Layout (Login / Register)
  return (
    <div className="flex-grow flex items-center justify-center p-4 py-12 relative">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div 
          onClick={() => setSubMode('onboarding')}
          className="flex items-center justify-center gap-2 mb-8 cursor-pointer"
        >
          <span className="material-symbols-outlined text-3xl text-slate-900 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>schema</span>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            Contracheque <span className="text-emerald-700">AI</span>
          </span>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-slate-900">
              {subMode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {subMode === 'login' ? 'Bem-vindo de volta! Acesse seus contracheques.' : 'Comece a organizar sua vida financeira hoje.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            {subMode === 'register' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600 font-semibold" htmlFor="name">Nome completo</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person</span>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white outline-none transition-all"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    required
                    type="text"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600 font-semibold" htmlFor="email">E-mail corporativo ou pessoal</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white outline-none transition-all"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@empresa.com"
                  required
                  type="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600 font-semibold" htmlFor="password">Senha</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white outline-none transition-all"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {subMode === 'login' && (
              <div className="flex justify-end -mt-2">
                <a href="#" className="text-xs text-slate-500 hover:text-slate-900 hover:underline">Esqueci minha senha</a>
              </div>
            )}

            <button
              className="h-11 w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-2"
              type="submit"
            >
              {subMode === 'login' ? 'Entrar' : 'Cadastrar'}
              <span className="material-symbols-outlined text-md">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-3 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">ou</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={loginWithGoogle}
            className="h-11 w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2.5 shadow-xs"
            type="button"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Entrar com Google
          </button>
        </div>

        {/* Footer Toggle */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            {subMode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
            <button
              onClick={() => setSubMode(subMode === 'login' ? 'register' : 'login')}
              className="ml-1 text-emerald-800 hover:text-emerald-950 font-semibold hover:underline"
            >
              {subMode === 'login' ? 'Cadastrar' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
