import React from 'react';
import { User, Screen } from '../types';

interface NavbarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ currentScreen, onNavigate, user, onLogout }: NavbarProps) {
  // If no user resides in session yet, don't show navigation rails
  if (!user || currentScreen === 'welcome' || currentScreen === 'auth') return null;

  return (
    <>
      {/* 1. Desktop TOP Navbar Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Name */}
          <div 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-emerald-800 text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>schema</span>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">
              Contracheque <span className="text-emerald-700 font-medium">AI</span>
            </span>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentScreen === 'dashboard' || currentScreen === 'month_details'
                  ? 'bg-emerald-50 text-emerald-800' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => onNavigate('calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentScreen === 'calendar' 
                  ? 'bg-emerald-50 text-emerald-800' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Calendário
            </button>

            <button
              onClick={() => onNavigate('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentScreen === 'history' 
                  ? 'bg-emerald-50 text-emerald-800' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Histórico Anual
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentScreen === 'settings' 
                  ? 'bg-emerald-50 text-emerald-800' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Configurações
            </button>
          </nav>

          {/* User profile & action CTA package */}
          <div className="flex items-center gap-4">
            {/* Quick CTA to Upload */}
            <button
              onClick={() => onNavigate('upload')}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span className="hidden sm:inline">Enviar contracheque</span>
              <span className="sm:hiddenInline">+ Enviar</span>
            </button>

            {/* Quick mini-profile */}
            <div className="hidden sm:flex items-center gap-2.5 border-l border-slate-100 pl-4">
              <div 
                className="w-8.5 h-8.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                onClick={() => onNavigate('settings')}
              >
                {user.nome.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left leading-none">
                <p className="text-[11px] font-bold text-slate-800">{user.nome}</p>
                <button 
                  onClick={onLogout}
                  className="text-[9px] text-red-500 hover:underline font-semibold block mt-0.5"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 2. Mobile BOTTOM docks nav bar layout */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2 z-40 flex justify-between items-center shadow-[0_-4px_16px_0_rgba(15,23,42,0.04)] pb-[calc(1.2rem+env(safe-area-inset-bottom,0px))]">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 ${
            currentScreen === 'dashboard' || currentScreen === 'month_details' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={currentScreen === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : undefined}>dashboard</span>
          <span className="text-[9px] font-bold">Início</span>
        </button>

        <button
          onClick={() => onNavigate('calendar')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 ${
            currentScreen === 'calendar' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={currentScreen === 'calendar' ? { fontVariationSettings: "'FILL' 1" } : undefined}>calendar_today</span>
          <span className="text-[9px] font-bold">Escala</span>
        </button>

        {/* Central floated trigger to Upload */}
        <button
          onClick={() => onNavigate('upload')}
          className={`flex flex-col items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-full -mt-6 shadow-md border-4 border-slate-50 transition-all active:scale-95 ${
            currentScreen === 'upload' ? 'bg-emerald-800' : 'bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] font-bold">add</span>
        </button>

        <button
          onClick={() => onNavigate('history')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 ${
            currentScreen === 'history' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={currentScreen === 'history' ? { fontVariationSettings: "'FILL' 1" } : undefined}>timeline</span>
          <span className="text-[9px] font-bold">Histórico</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 ${
            currentScreen === 'settings' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={currentScreen === 'settings' ? { fontVariationSettings: "'FILL' 1" } : undefined}>settings</span>
          <span className="text-[9px] font-bold">Ajustes</span>
        </button>
      </div>
    </>
  );
}
