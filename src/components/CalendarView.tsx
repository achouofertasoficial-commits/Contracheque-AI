import React, { useState } from 'react';
import { CALENDAR_EVENTS } from '../data';
import { Screen } from '../types';

interface CalendarViewProps {
  onNavigate: (screen: Screen) => void;
}

export default function CalendarView({ onNavigate }: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(12);

  const getDayStatusClass = (dayNum: number) => {
    const ev = CALENDAR_EVENTS.find(e => e.day === dayNum && e.type !== 'rest');
    if (!ev) return "";

    switch(ev.type) {
      case 'work':
        return "bg-blue-50 text-slate-800 border border-blue-100 font-bold";
      case 'cancelled':
        return "text-red-500 font-semibold";
      case 'payment':
        return "bg-indigo-50 text-indigo-800 border border-indigo-100 font-bold animate-pulse";
      case 'holiday':
        return "bg-slate-900 text-white font-bold shadow-sm";
      default:
        return "";
    }
  };

  const getDayEventMarker = (dayNum: number) => {
    const ev = CALENDAR_EVENTS.find(e => e.day === dayNum);
    if (!ev) return null;

    switch(ev.type) {
      case 'work':
        return <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-700" />;
      case 'cancelled':
        return <div className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500" />;
      case 'rest':
        return <div className="absolute bottom-1 w-1 h-1 rounded-full bg-slate-400" />;
      case 'payment':
        return <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600" />;
      case 'holiday':
        return <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />;
      default:
        return null;
    }
  };

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Pad start blank squares (October 2023 starts on Sunday, so Sunday=1, Monday=2, etc. Wait! Outubro 23 starts on a Sunday, so D=1)
  const offsetSquares = Array.from({ length: 0 }); // none needed for Sunday start layout

  const handleAddReminder = () => {
    const title = prompt("Digite o título do lembrete:");
    if (title) {
      alert("Lembrete '" + title + "' cadastrado com sucesso para o dia selecionado!");
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Outubro 2023</h1>
          <p className="text-sm text-slate-500 mt-1">Visão geral da sua escala mensal de horas e plantões.</p>
        </div>
        <button 
          onClick={handleAddReminder}
          className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Adicionar Lembrete</span>
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Calendar Grid Area */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-xs">
            {/* Days of Week */}
            <div className="grid grid-cols-7 text-center mb-4 gap-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                <div key={idx} className="text-xs font-bold text-slate-400 select-none">{day}</div>
              ))}
            </div>

            {/* October calendar layout */}
            <div className="grid grid-cols-7 gap-2">
              {/* offset padding space if any */}
              {offsetSquares.map((_, idx) => (
                <div key={idx} className="aspect-square" />
              ))}

              {daysInMonth.map((day) => {
                const isSelected = selectedDay === day;
                let statusClasses = getDayStatusClass(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square relative flex items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all hover:bg-slate-100 active:scale-95 ${statusClasses} ${
                      isSelected ? 'ring-2 ring-emerald-800 ring-offset-2 scale-102 border-transparent' : ''
                    }`}
                  >
                    <span>{day}</span>
                    {getDayEventMarker(day)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Legend section */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-xs text-xs font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-500">Trabalhado</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-xs text-xs font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-500">Folga</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-xs text-xs font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-500">Cancelado</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-xs text-xs font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span className="text-slate-500">Pagamento</span>
            </div>
          </div>
        </div>

        {/* Sidebar Schedule detail area */}
        <div className="md:col-span-4 flex flex-col gap-4">
          
          {/* Monthly counters */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-50 pb-2">Resumo do Mês</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100/50 pink">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">work</span>
                  Dias Trabalhados
                </span>
                <span className="font-bold text-slate-800">22</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100/50">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">weekend</span>
                  Folgas
                </span>
                <span className="font-bold text-slate-800">8</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-red-500">cancel</span>
                  Dias Cancelados
                </span>
                <span className="font-bold text-slate-800">1</span>
              </div>
            </div>
          </div>

          {/* Events for selected day (highlights standard October 12 events) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex-grow">
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
              <h3 className="text-sm font-bold text-slate-800">{selectedDay || 12} de Outubro</h3>
              {selectedDay === 12 && (
                <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">Feriado</span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {selectedDay === 12 ? (
                <>
                  <div className="bg-slate-50 p-3 rounded-lg border-l-4 border-slate-400">
                    <p className="text-xs font-bold text-slate-800">Folga Programada</p>
                    <p className="text-[10px] text-slate-400 mt-1">Feriado Nacional - Nossa Sra/ Aparecida</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-600">
                    <p className="text-xs font-bold text-slate-800">Enviar Contracheque</p>
                    <p className="text-[10px] text-slate-400 mt-1 mb-2">Lembrete automático para enviar documento da 1ª quinzena.</p>
                    <button
                      onClick={() => onNavigate('upload')}
                      className="text-[10px] font-bold text-indigo-700 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">upload_file</span>
                      <span>Enviar Agora</span>
                    </button>
                  </div>
                </>
              ) : selectedDay === 27 ? (
                <div className="bg-slate-50 p-3 rounded-lg border-l-4 border-emerald-700">
                  <p className="text-xs font-bold text-slate-800">Depósito Bancário de Salário</p>
                  <p className="text-[10px] text-slate-500 mt-1">Sua folha de pagamento foi processada pela empresa Tech Solutions S.A.</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Nenhum evento ou lembrete programado para esta data.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
