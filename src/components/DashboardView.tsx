import React from 'react';
import { ContrachequeAnalise, User, Screen } from '../types';

interface DashboardViewProps {
  analysedList: ContrachequeAnalise[];
  user: User;
  onNavigate: (screen: Screen) => void;
  setSelectedMonthId: (id: string) => void;
}

export default function DashboardView({ analysedList, user, onNavigate, setSelectedMonthId }: DashboardViewProps) {
  // Use the first (latest) analysed item to populate wages
  const latestItem = analysedList[0];

  if (!latestItem) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Nenhum contracheque cadastrado. Carregue um documento para começar!</p>
      </div>
    );
  }

  // Format money function
  const formatCurrency = (val: number | null) => {
    if (val === null) return "R$ 0,00";
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Find percentage proportion of Proventos (salario_liquido / salario_bruto)
  const netRatio = latestItem.valores.salario_bruto 
    ? Math.round((latestItem.valores.salario_liquido! / latestItem.valores.salario_bruto!) * 100) 
    : 73;
  
  const discountRatio = 100 - netRatio;

  // Pie chart calculation
  const strokeDash = `${netRatio} ${discountRatio}`;

  // Month labels mapping for Portuguese
  const shortMonths: Record<string, string> = {
    "Janeiro": "Jan", "Fevereiro": "Fev", "Março": "Mar", "Abril": "Abr",
    "Maio": "Mai", "Junho": "Jun", "Julho": "Jul", "Agosto": "Ago",
    "Setembro": "Set", "Outubro": "Out", "Novembro": "Nov", "Dezembro": "Dez"
  };

  const getShortMonthName = (fullMonth: string | null) => {
    if (!fullMonth) return "Mês";
    return shortMonths[fullMonth] || fullMonth.substring(0, 3);
  };

  // Handle detailed month routing
  const viewMonthDetails = (id: string) => {
    setSelectedMonthId(id);
    onNavigate('month_details');
  };

  return (
    <div className="space-y-6">
      {/* Header section with notification badge */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 p-4 rounded-2xl border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Olá, {user.nome}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Aqui está o resumo financeiro consolidado do seu último contracheque.</p>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full shadow-xs">
          <span className="material-symbols-outlined text-emerald-700 text-sm">trending_up</span>
          <span className="text-xs text-emerald-800 font-semibold">+5% em relação ao mês anterior</span>
        </div>
      </section>

      {/* Main Income Bento Cards layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Salário Líquido Green highlight panel */}
        <div className="bg-emerald-800 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm transform transition-all hover:translate-y-[-2px]">
          {/* Ambient background blur circles */}
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h2 className="text-xs text-emerald-100 font-bold uppercase tracking-wider">Salário Líquido</h2>
            <span className="material-symbols-outlined text-emerald-200 text-xl font-light">account_balance_wallet</span>
          </div>
          <div className="relative z-10">
            <p className="text-3xl font-bold tracking-tight">{formatCurrency(latestItem.valores.salario_liquido)}</p>
          </div>
        </div>

        {/* Salário Bruto card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between min-h-[160px] shadow-xs hover:shadow-sm transition-all transform hover:translate-y-[-2px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Salário Bruto</h2>
            <span className="material-symbols-outlined text-slate-400 text-xl">payments</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(latestItem.valores.salario_bruto)}</p>
          </div>
        </div>

        {/* Descontos card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between min-h-[160px] shadow-xs hover:shadow-sm transition-all transform hover:translate-y-[-2px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total de Descontos</h2>
            <span className="material-symbols-outlined text-slate-400 text-xl">receipt_long</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(latestItem.valores.total_descontos)}</p>
          </div>
        </div>
      </div>

      {/* Row of Micro Averages stats */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Métricas Adicionais Extraídas</h3>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[150px] bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100">
            <span className="material-symbols-outlined text-lg">dark_mode</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Adicional Noturno</p>
            <p className="text-sm font-bold text-slate-800">{formatCurrency(latestItem.valores.adicional_noturno_valor)}</p>
          </div>
        </div>

        <div className="flex-1 min-w-[150px] bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100">
            <span className="material-symbols-outlined text-lg">more_time</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Horas Extras</p>
            <p className="text-sm font-bold text-slate-800">{formatCurrency(latestItem.valores.horas_extras_valor)}</p>
          </div>
        </div>

        <div className="flex-1 min-w-[150px] bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100">
            <span className="material-symbols-outlined text-lg">today</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Dias Trabalhados</p>
            <p className="text-sm font-bold text-slate-800">{latestItem.trabalho.dias_trabalhados || 22} dias</p>
          </div>
        </div>

        <div className="flex-1 min-w-[150px] bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100">
            <span className="material-symbols-outlined text-lg">calculate</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Média por Dia</p>
            <p className="text-sm font-bold text-slate-800">{formatCurrency(latestItem.trabalho.media_por_dia)}</p>
          </div>
        </div>

        <div className="flex-grow min-w-[150px] bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100">
            <span className="material-symbols-outlined text-lg">schedule</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Média por Hora</p>
            <p className="text-sm font-bold text-slate-800">{formatCurrency(latestItem.trabalho.media_por_hora)}</p>
          </div>
        </div>
      </div>

      {/* Row of visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Net Income Trend Bar Chart (8 Columns on md) */}
        <div className="md:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Evolução da Renda Líquida</h3>
            <button 
              onClick={() => onNavigate('history')}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold transition-colors"
            >
              Ver Histórico Completo
            </button>
          </div>

          {/* Graphical Bars Area */}
          <div className="h-60 w-full flex items-end justify-between gap-4 pt-4 relative border-b border-slate-200">
            {/* Background grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between z-0 pointer-events-none pb-8">
              <div className="w-full h-px bg-slate-100/50" />
              <div className="w-full h-px bg-slate-100/100" />
              <div className="w-full h-px bg-slate-100/100" />
              <div className="w-full h-px bg-slate-100/100" />
            </div>

            {/* Invert list to show chronologically if we have months */}
            {[...analysedList].reverse().map((item, index) => {
              // Scale bar height according to values (from R$ 3000 to R$ 7000)
              const baseValue = item.valores.salario_liquido || 3000;
              const barHeightPct = Math.min(Math.max(((baseValue) / 7500) * 100, 20), 100);
              const isLast = index === analysedList.length - 1;

              return (
                <div 
                  key={index} 
                  onClick={() => viewMonthDetails(item.id)}
                  className="flex-1 flex flex-col items-center gap-2 z-10 group cursor-pointer"
                >
                  <div 
                    className={`w-full max-w-[48px] rounded-t-sm transition-all duration-300 relative ${
                      isLast 
                        ? 'bg-emerald-700 shadow-md transform hover:-translate-y-1' 
                        : 'bg-emerald-600/30 hover:bg-emerald-600/75'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  >
                    {/* Tooltip detail block */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-955 text-white text-[10px] font-bold py-1 px-2.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-40 bg-slate-900">
                      {formatCurrency(baseValue)}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{getShortMonthName(item.competencia.mes)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proporção Bruta Donut Circle Chart (4 Columns on md) */}
        <div className="md:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="w-full text-left mb-6">
            <h3 className="font-bold text-slate-900">Proporção Bruta</h3>
          </div>

          <div className="relative w-48 h-48 rounded-full flex items-center justify-center mb-6">
            {/* SVG circle donut */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#e2e8f0" /* Neutral / Gray background ratio */
                strokeWidth="3.2"
              />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#006c49" /* Success Secondary Green */
                strokeWidth="3.2"
                strokeDasharray={`${netRatio} ${discountRatio}`}
                strokeDashoffset="25"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Inner detailed absolute tags */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400 font-semibold">Líquido</span>
              <span className="text-2xl font-bold text-emerald-800">{netRatio}%</span>
            </div>
          </div>

          {/* Legend indicator tags */}
          <div className="w-full flex justify-around border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              <span className="text-xs font-semibold text-slate-500">Líquido ({netRatio}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="text-xs font-semibold text-slate-500">Descontos ({discountRatio}%)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
