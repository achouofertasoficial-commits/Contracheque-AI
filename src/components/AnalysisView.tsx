import React from 'react';
import { ContrachequeAnalise } from '../types';

interface AnalysisViewProps {
  currentAnalysis: any; // newly computed JSON
  onConfirm: (finalAnalysis: ContrachequeAnalise) => void;
  onDiscard: () => void;
}

export default function AnalysisView({ currentAnalysis, onConfirm, onDiscard }: AnalysisViewProps) {
  if (!currentAnalysis) return null;

  // Format currency
  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return "R$ 0,00";
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleConfirmClick = () => {
    // Scaffold final analytical schema
    const finalData: ContrachequeAnalise = {
      id: "analysed-" + Date.now(),
      uploadedAt: new Date().toISOString(),
      fileName: (window as any).__tempUploadedFile?.fileName || "holerite_analisado.pdf",
      trabalhador: {
        nome: currentAnalysis.trabalhador?.nome || "Trabalhador",
        tipo: currentAnalysis.trabalhador?.tipo || "mensalista"
      },
      empresa: {
        nome: currentAnalysis.empresa?.nome || "Empresa Clt Ltda",
        cnpj: currentAnalysis.empresa?.cnpj || null
      },
      competencia: {
        mes: currentAnalysis.competencia?.mes || "Mês Corrente",
        ano: currentAnalysis.competencia?.ano || "2024"
      },
      valores: {
        salario_bruto: currentAnalysis.valores?.salario_bruto ?? 0,
        salario_liquido: currentAnalysis.valores?.salario_liquido ?? 0,
        total_descontos: currentAnalysis.valores?.total_descontos ?? 0,
        total_adicionais: currentAnalysis.valores?.total_adicionais ?? 0,
        inss: currentAnalysis.valores?.inss ?? null,
        fgts: currentAnalysis.valores?.fgts ?? null,
        horas_extras_valor: currentAnalysis.valores?.horas_extras_valor ?? null,
        adicional_noturno_valor: currentAnalysis.valores?.adicional_noturno_valor ?? null,
        bonus: currentAnalysis.valores?.bonus ?? null
      },
      trabalho: {
        dias_trabalhados: currentAnalysis.trabalho?.dias_trabalhados ?? 22,
        horas_trabalhadas: currentAnalysis.trabalho?.horas_trabalhadas ?? 176,
        horas_extras: currentAnalysis.trabalho?.horas_extras ?? 0,
        horas_noturnas: currentAnalysis.trabalho?.horas_noturnas ?? null,
        media_por_dia: currentAnalysis.trabalho?.media_por_dia ?? 0,
        media_por_hora: currentAnalysis.trabalho?.media_por_hora ?? 0
      },
      itens: currentAnalysis.itens || [],
      alertas: currentAnalysis.alertas || [],
      resumo_ia: currentAnalysis.resumo_ia || ""
    };

    onConfirm(finalData);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4">
      {/* Header section */}
      <section className="flex flex-col gap-1 text-left">
        <h1 className="text-2xl font-bold text-slate-900">Análise concluída</h1>
        <p className="text-sm text-slate-500">Revisamos os dados do seu contracheque. Abaixo está o resumo financeiro.</p>
      </section>

      {/* Worker info card */}
      <section className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col md:flex-row gap-4 md:items-center justify-between shadow-xs">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 border border-slate-200 shadow-xs">
            <span className="material-symbols-outlined">badge</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">{currentAnalysis.trabalhador?.nome || "João Silva"}</h2>
            <p className="text-xs text-slate-400">{currentAnalysis.empresa?.nome || "Tech Solutions S.A."}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-slate-500">calendar_month</span>
            <span className="text-[10px] font-bold text-slate-500">
              {currentAnalysis.competencia?.mes || "Outubro"} / {currentAnalysis.competencia?.ano || "2023"}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-slate-500">work</span>
            <span className="text-[10px] font-bold text-slate-500 capitalize">
              {currentAnalysis.trabalhador?.tipo || "Mensalista"}
            </span>
          </div>
        </div>
      </section>

      {/* Financial summary bento grids */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Salário Bruto */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-32 shadow-xs text-left">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Salário Bruto</span>
            <span className="material-symbols-outlined text-slate-400 text-lg">payments</span>
          </div>
          <span className="text-xl font-bold text-slate-800">
            {formatCurrency(currentAnalysis.valores?.salario_bruto)}
          </span>
        </div>

        {/* Salário Líquido (Highlight) */}
        <div className="bg-emerald-800 text-white rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden shadow-sm text-left">
          <div className="absolute -right-4 -top-4 opacity-10">
            <span className="material-symbols-outlined text-[100px]">account_balance_wallet</span>
          </div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wide">Salário Líquido</span>
            <span className="material-symbols-outlined text-emerald-100 text-lg">account_balance_wallet</span>
          </div>
          <span className="text-2xl font-bold text-white relative z-10">
            {formatCurrency(currentAnalysis.valores?.salario_liquido)}
          </span>
        </div>

        {/* Descontos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-32 shadow-xs text-left">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Descontos Totais</span>
            <span className="material-symbols-outlined text-red-500 text-lg">trending_down</span>
          </div>
          <span className="text-xl font-bold text-red-500">
            - {formatCurrency(currentAnalysis.valores?.total_descontos)}
          </span>
        </div>

        {/* Adicionais */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-32 shadow-xs text-left">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Adicionais</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">trending_up</span>
          </div>
          <span className="text-xl font-bold text-emerald-600">
            + {formatCurrency(currentAnalysis.valores?.total_adicionais)}
          </span>
        </div>

        {/* Horas Extras */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-32 shadow-xs text-left">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Horas Extras</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">schedule</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-bold text-emerald-600">
              {currentAnalysis.valores?.horas_extras_valor ? `+ ${formatCurrency(currentAnalysis.valores.horas_extras_valor)}` : "R$ 0,00"}
            </span>
            {currentAnalysis.trabalho?.horas_extras && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                {currentAnalysis.trabalho.horas_extras} hrs
              </span>
            )}
          </div>
        </div>

        {/* Adicional Noturno */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-32 shadow-xs text-left">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Adicional Noturno</span>
            <span className="material-symbols-outlined text-slate-800 text-lg">dark_mode</span>
          </div>
          <span className="text-xl font-bold text-slate-600">
            {formatCurrency(currentAnalysis.valores?.adicional_noturno_valor)}
          </span>
        </div>
      </section>

      {/* Warnings section */}
      {currentAnalysis.alertas && currentAnalysis.alertas.length > 0 && (
        <section className="bg-red-50/50 rounded-2xl p-5 border border-red-100 flex flex-col gap-4 shadow-xs text-left">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-lg">warning</span>
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">Alertas de possíveis descontos incomuns</h3>
          </div>
          <div className="flex flex-col gap-2">
            {currentAnalysis.alertas.map((alerta: any, idx: number) => (
              <div 
                key={idx} 
                className="flex gap-3 bg-white p-4 rounded-xl border border-rose-100 shadow-xs"
              >
                <div className="mt-0.5">
                  <span className="material-symbols-outlined text-rose-300 text-lg">info</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Possível Inconsistência</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alerta.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Explanation Summary */}
      <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs text-left">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Resumo Narrativo da IA</h3>
        <p className="text-xs leading-relaxed text-slate-600 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
          "{currentAnalysis.resumo_ia}"
        </p>
      </section>

      {/* Actions */}
      <section className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
        <button 
          onClick={onDiscard}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-full transition-colors active:scale-95"
        >
          Descartar holerite
        </button>
        <button 
          onClick={handleConfirmClick}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>Confirmar e Salvar dados</span>
          <span className="material-symbols-outlined text-sm">check_circle</span>
        </button>
      </section>
    </div>
  );
}
