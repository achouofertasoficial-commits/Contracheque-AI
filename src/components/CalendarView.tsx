import React, { useState, useEffect } from 'react';
import { Screen, User } from '../types';

interface CalendarReminder {
  id: string;
  year: number;
  month: number; // 0-indexed
  day: number;
  title: string;
  type: 'work' | 'rest' | 'cancelled' | 'payment' | 'holiday' | 'reminder';
}

interface CalendarViewProps {
  onNavigate: (screen: Screen) => void;
  user: User | null;
}

export default function CalendarView({ onNavigate, user }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(() => new Date().getDate());

  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();

  const userEmail = user?.email || 'joao.silva@exemplo.com.br';

  const [reminders, setReminders] = useState<CalendarReminder[]>(() => {
    const cached = localStorage.getItem(`contracheque_ai_reminders_${userEmail}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    // Beautiful initial scenarios matching standard calendar expectations
    return [
      {
        id: '1',
        year: 2023,
        month: 9, // October (0-indexed 9 means October)
        day: 12,
        title: 'Folga Programada - Feriado Nacional',
        type: 'holiday'
      },
      {
        id: '2',
        year: 2023,
        month: 9,
        day: 27,
        title: 'Depósito de Salário Processado',
        type: 'payment'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`contracheque_ai_reminders_${userEmail}`, JSON.stringify(reminders));
  }, [reminders, userEmail]);

  const monthNamesPT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const currentMonthName = monthNamesPT[currentMonthIdx];

  const daysInMonthCount = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  // Day of week of index 1
  const startDayOfWeek = new Date(currentYear, currentMonthIdx, 1).getDay();
  const offsetSquares = Array.from({ length: startDayOfWeek });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIdx - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIdx + 1, 1));
    setSelectedDay(null);
  };

  const getDayStatusClass = (dayNum: number) => {
    const ev = reminders.find(e => e.year === currentYear && e.month === currentMonthIdx && e.day === dayNum);
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
        return "bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold";
    }
  };

  const getDayEventMarker = (dayNum: number) => {
    const ev = reminders.find(e => e.year === currentYear && e.month === currentMonthIdx && e.day === dayNum);
    if (!ev) return null;

    switch(ev.type) {
      case 'work':
        return <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />;
      case 'cancelled':
        return <div className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500" />;
      case 'rest':
        return <div className="absolute bottom-1 w-1 h-1 rounded-full bg-slate-400" />;
      case 'payment':
        return <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600" />;
      case 'holiday':
        return <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />;
      default:
        return <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-700" />;
    }
  };

  const handleAddReminder = () => {
    if (selectedDay === null) {
      alert("Por favor, selecione um dia no calendário clicando nele primeiro!");
      return;
    }
    const title = prompt("Digite o título do lembrete:");
    if (!title || !title.trim()) return;

    const typePrompt = prompt(
      "Selecione o estilo visual do lembrete digite uma das opções abaixo:\n- trabalho\n- cancelado\n- pagamento\n- feriado\n- padrao",
      "padrao"
    );

    let type: 'work' | 'rest' | 'cancelled' | 'payment' | 'holiday' | 'reminder' = 'reminder';
    if (typePrompt) {
      const norm = typePrompt.toLowerCase().trim();
      if (norm === 'trabalho') type = 'work';
      if (norm === 'folga') type = 'rest';
      if (norm === 'cancelado') type = 'cancelled';
      if (norm === 'pagamento') type = 'payment';
      if (norm === 'feriado') type = 'holiday';
    }

    const newReminder: CalendarReminder = {
      id: `rem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      year: currentYear,
      month: currentMonthIdx,
      day: selectedDay,
      title: title.trim(),
      type
    };

    setReminders(prev => [...prev, newReminder]);
  };

  const handleRemoveReminder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja remover este lembrete do calendário?")) {
      setReminders(prev => prev.filter(r => r.id !== id));
    }
  };

  // Stats Counters
  const workDaysCount = reminders.filter(r => r.year === currentYear && r.month === currentMonthIdx && r.type === 'work').length;
  const holidaysCount = reminders.filter(r => r.year === currentYear && r.month === currentMonthIdx && (r.type === 'holiday' || r.type === 'rest')).length;
  const cancelledDaysCount = reminders.filter(r => r.year === currentYear && r.month === currentMonthIdx && r.type === 'cancelled').length;
  const paymentDaysCount = reminders.filter(r => r.year === currentYear && r.month === currentMonthIdx && r.type === 'payment').length;

  const selectedDayReminders = reminders.filter(r => r.year === currentYear && r.month === currentMonthIdx && r.day === selectedDay);

  return (
    <div className="space-y-6 text-left">
      {/* Header section with Prev / Next Buttons */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer"
              title="Mês Anterior"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-900">{currentMonthName} {currentYear}</h1>
            <button 
              onClick={handleNextMonth}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer"
              title="Próximo Mês"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">Escala mensal e lembretes de depósitos, plantões e vencimentos.</p>
        </div>
        <button 
          onClick={handleAddReminder}
          disabled={selectedDay === null}
          className="bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
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

            {/* Monthly grid */}
            <div className="grid grid-cols-7 gap-2">
              {offsetSquares.map((_, idx) => (
                <div key={`offset-${idx}`} className="aspect-square bg-slate-50/20 rounded-xl" />
              ))}

              {daysInMonth.map((day) => {
                const isSelected = selectedDay === day;
                const statusClasses = getDayStatusClass(day);

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square relative flex items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all hover:bg-slate-100 active:scale-95 cursor-pointer ${statusClasses} ${
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
              <span className="text-slate-500">Folga/Feriado</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-xs text-xs font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-500">Cancelado</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-xs text-xs font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-650" />
              <span className="text-slate-500">Pagamento</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-xs text-xs font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              <span className="text-slate-500 font-bold text-emerald-800">Lembrete Geral</span>
            </div>
          </div>
        </div>

        {/* Sidebar Schedule detail area */}
        <div className="md:col-span-4 flex flex-col gap-4">
          
          {/* Monthly counters */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs text-slate-800">
            <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-50 pb-2">Eventos de {currentMonthName}</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100/50">
                <span className="text-slate-555 flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-blue-500">work</span>
                  Plantões / Trabalho
                </span>
                <span className="font-bold text-slate-900">{workDaysCount}</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100/50">
                <span className="text-slate-555 flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-slate-450">weekend</span>
                  Folgas / Feriados
                </span>
                <span className="font-bold text-slate-900">{holidaysCount}</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100/50">
                <span className="text-slate-555 flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-red-500">cancel</span>
                  Escalas Canceladas
                </span>
                <span className="font-bold text-slate-900">{cancelledDaysCount}</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-555 flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-indigo-650">payments</span>
                  Depósitos previstos
                </span>
                <span className="font-bold text-slate-900">{paymentDaysCount}</span>
              </div>
            </div>
          </div>

          {/* Events for selected day */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex-grow text-slate-800">
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                {selectedDay === null ? "Selecione uma data" : `${selectedDay} de ${currentMonthName}`}
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {selectedDay === null ? (
                <p className="text-xs text-slate-450 italic">Escolha um dia no calendário para ver e criar lembretes personalizados.</p>
              ) : selectedDayReminders.length > 0 ? (
                selectedDayReminders.map(rem => (
                  <div 
                    key={rem.id} 
                    className={`p-3 rounded-lg border-l-4 flex items-start justify-between gap-3 ${
                      rem.type === 'work' ? 'bg-blue-50/50 border-blue-500' :
                      rem.type === 'cancelled' ? 'bg-red-50/50 border-red-500' :
                      rem.type === 'payment' ? 'bg-indigo-50/50 border-indigo-600 animate-pulse' :
                      rem.type === 'holiday' ? 'bg-slate-50 border-slate-900' :
                      'bg-emerald-50/50 border-emerald-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold text-slate-900 break-words leading-tight">{rem.title}</p>
                      <p className="text-[9px] text-slate-450 mt-1 uppercase font-semibold">
                        {rem.type === 'work' ? 'escala' : rem.type === 'payment' ? 'pagamento' : rem.type === 'holiday' ? 'feriado/folga' : 'lembrete'}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => handleRemoveReminder(rem.id, e)}
                      className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1 rounded-md transition-colors shrink-0 cursor-pointer"
                      title="Remover"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-450 italic mb-3">Nenhum evento ou lembrete programado.</p>
                  <button 
                    onClick={handleAddReminder}
                    className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center justify-center gap-1 mx-auto bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-100 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                    <span>Criar Lembrete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
