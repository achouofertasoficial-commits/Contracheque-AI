import React from 'react';

export default function DecimalHoursHint() {
  return (
    <div className="mt-1.5 p-3 bg-slate-50 border border-slate-100 rounded-xl flex gap-2.5 text-left text-[11px] text-slate-500 font-medium leading-relaxed shadow-2xs">
      <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5 shrink-0 select-none">info</span>
      <div className="space-y-1">
        <p className="font-bold text-slate-700">Informe as horas já convertidas em decimal.</p>
        <p className="text-[10px] text-slate-400">
          Exemplo: <span className="font-semibold text-slate-600">30 minutos = 0,50</span> | <span className="font-semibold text-slate-600">8h30 = 8,50</span> | <span className="font-semibold text-slate-600">2h30 = 2,50</span>
        </p>
        <p className="text-[9px] text-slate-400 italic">
          Exemplo: 18 dias × 2H50 de adicional noturno = 45 horas
        </p>
      </div>
    </div>
  );
}
