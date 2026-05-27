import React, { useState } from 'react';
import { ContrachequeAnalise, Screen } from '../types';

interface HistoryViewProps {
  analysedList: ContrachequeAnalise[];
  onNavigate: (screen: Screen) => void;
  setSelectedMonthId: (id: string) => void;
}

export default function HistoryView({ analysedList, onNavigate, setSelectedMonthId }: HistoryViewProps) {
  const [selectedYear, setSelectedYear] = useState("2023");

  // Sum annual calculations based on the analysed list
  const totalReceived = analysedList.reduce((acc, curr) => acc + (curr.valores.salario_liquido || 0), 0);
  const totalDeducted = analysedList.reduce((acc, curr) => acc + (curr.valores.total_descontos || 0), 0);
  
  const countMonths = analysedList.length || 1;
  const averageMonthly = Math.round(totalReceived / countMonths);

  const shortMonths: Record<string, string> = {
    "Janeiro": "Jan", "Fevereiro": "Fev", "Março": "Mar", "Abril": "Abr",
    "Maio": "Mai", "Junho": "Jun", "Julho": "Jul", "Agosto": "Ago",
    "Setembro": "Set", "Outubro": "Out", "Novembro": "Nov", "Dezembro": "Dez"
  };

  const getShortMonthName = (fullMonth: string | null) => {
    if (!fullMonth) return "Mês";
    return shortMonths[fullMonth] || fullMonth.substring(0, 3);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleMonthClick = (id: string) => {
    setSelectedMonthId(id);
    onNavigate('month_details');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header section with Year Picker */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:hidden">Resumo Anual</h1>
          <h1 className="text-2xl font-bold text-slate-900 hidden md:block">Histórico Anual de Holerites</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe sua trajetória financeira consolidada ao longo do ano.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-800 outline-none cursor-pointer shadow-xs"
          >
            <option value="2023">Exercício 2023</option>
            <option value="2022">Exercício 2022</option>
            <option value="2021">Exercício 2021</option>
          </select>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Span 8: Totals Cards and Annual Polyline Chart */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Received Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col relative overflow-hidden group shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-emerald-700 text-sm">arrow_upward</span> 
                Total Recebido Líquido
              </span>
              <div className="text-2xl font-bold text-slate-900 z-10">{formatCurrency(totalReceived)}</div>
              <div className="mt-4 flex items-center gap-1 text-emerald-700 text-[10px] font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>+12% vs 2022</span>
              </div>
            </div>

            {/* Total Deducted Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col relative overflow-hidden group shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-red-500 text-sm">arrow_downward</span> 
                Descontos Acumulados
              </span>
              <div className="text-2xl font-bold text-slate-900 z-10">{formatCurrency(totalDeducted)}</div>
              <div className="mt-4 flex items-center gap-1 text-red-600 text-[10px] font-bold">
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span>Retido IRRF & INSS</span>
              </div>
            </div>
          </div>

          {/* Graphical Area - Overlay Line Chart mimicking mockup */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 text-sm">Gráfico Anual de Fluxo de Caixa</h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">Líquido vs Descontos</span>
            </div>

            {/* Line Graph Canvas with mock wave polyline */}
            <div className="flex-1 w-full relative bg-slate-50/50 rounded-xl flex items-end p-4 pt-12 justify-between border border-slate-100">
              
              {/* Plotting points / columns backdrop */}
              {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mLabel, mIdx) => (
                <div key={mIdx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end z-10">
                  <div className="w-2.5 bg-emerald-700/10 group-hover:bg-emerald-700/30 rounded-t-xs transition-colors h-1/2" />
                  <span className="text-[10px] text-slate-400 font-bold hidden sm:block">{mLabel}</span>
                </div>
              ))}

              {/* Precise SVG Polyline Wave */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none p-4" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline 
                  fill="none" 
                  stroke="#0b1c30" 
                  strokeWidth="2" 
                  className="opacity-40 animate-pulse" 
                  points="2,80 10,65 18,70 26,50 34,55 42,35 50,40 58,25 66,30 74,45 82,15 95,5" 
                />
                <polyline 
                  fill="none" 
                  stroke="#006c49" 
                  strokeWidth="2.5" 
                  points="2,75 10,60 18,65 26,45 34,50 42,30 50,35 58,20 66,25 74,40 82,10 95,2" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Span 4: Extra statistics and Monthly List breakdown */}
        <div className="md:col-span-4 flex flex-col gap-4">
          
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400 mb-1">Média Mensal</span>
              <span className="text-sm font-bold text-slate-900">{formatCurrency(averageMonthly)}</span>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400 mb-1">13º Estimado</span>
              <span className="text-sm font-bold text-emerald-800">{formatCurrency(averageMonthly * 1.05)}</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-center col-span-2 relative overflow-hidden">
              <div className="absolute right-[-10px] top-[-10px] opacity-10">
                <span className="material-symbols-outlined text-[64px]">emoji_events</span>
              </div>
              <div className="flex justify-between items-end z-10">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Melhor Mês</span>
                  <span className="text-sm font-bold text-slate-800">Dezembro</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  + Bônus Anual
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-center col-span-2">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Pior Mês</span>
                  <span className="text-sm font-bold text-slate-800">Janeiro</span>
                </div>
                <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                  Altos Descontos
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs flex-1 flex flex-col overflow-hidden max-h-[380px]">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50 sticky top-0 z-10">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histórico Mensal</h3>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2 space-y-1.5 custom-scrollbar">
              {analysedList.map((item, idx) => {
                const isPositive = item.valores.salario_liquido! > 4000;
                
                return (
                  <div 
                    key={idx}
                    onClick={() => handleMonthClick(item.id)}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors border border-slate-100">
                        {getShortMonthName(item.competencia.mes)}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">
                          {item.competencia.mes} {item.competencia.ano}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.valores.bonus ? "Incluso Bônus" : "Competência Regular"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs font-bold ${isPositive ? 'text-emerald-800' : 'text-slate-800'}`}>
                        {formatCurrency(item.valores.salario_liquido || 0)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
