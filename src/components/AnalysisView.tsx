import React from 'react';
import { ContrachequeAnalise } from '../types';

interface AnalysisViewProps {
  currentAnalysis: ContrachequeAnalise | null;
  onConfirm: (finalAnalysis: ContrachequeAnalise) => void;
  onDiscard: () => void;
}

export default function AnalysisView({ currentAnalysis, onConfirm, onDiscard }: AnalysisViewProps) {
  if (!currentAnalysis) return null;

  // Extract variables safely
  const trabalhadorNome = currentAnalysis.trabalhador?.nome || "Trabalhador";
  const empresaNome = currentAnalysis.empresa?.nome || "Empresa não informada";
  const competenciaMes = currentAnalysis.competencia?.mes || "Mês Corrente";
  const competenciaAno = currentAnalysis.competencia?.ano || "Ano";
  const trabalhadorTipo = currentAnalysis.trabalhador?.tipo || "mensalista";

  const salBruto = currentAnalysis.valores?.salario_bruto || 0;
  const salLiq = currentAnalysis.valores?.salario_liquido || 0;
  const totDescontos = currentAnalysis.valores?.total_descontos || 0;
  const totAdicionais = currentAnalysis.valores?.total_adicionais || 0;
  
  const diasTrabalhados = currentAnalysis.trabalho?.dias_trabalhados || null;
  const horasTrabalhadas = currentAnalysis.trabalho?.horas_trabalhadas || null;
  
  const inssValor = currentAnalysis.valores?.inss || null;
  const fgtsValor = currentAnalysis.valores?.fgts || null;
  
  const extrasQtd = currentAnalysis.trabalho?.horas_extras || null;
  const extrasValor = currentAnalysis.valores?.horas_extras_valor || null;
  
  const noturnasQtd = currentAnalysis.trabalho?.horas_noturnas || null;
  const noturnasValor = currentAnalysis.valores?.adicional_noturno_valor || null;

  // Find DSR Proventos
  const dsrItems = currentAnalysis.itens?.filter((item: any) => {
    const name = (item.nome || "").toLowerCase();
    return name.includes("dsr") || name.includes("descanso") || name.includes("r.s.d.") || name.includes("rsd");
  }) || [];
  const dsrValor = dsrItems.reduce((acc: number, item: any) => {
    if (item.tipo === "provento") {
      return acc + (item.valor || 0);
    }
    return acc;
  }, 0);

  const horasDsrIntermitente = currentAnalysis.trabalho?.horas_dsr_intermitente || null;
  const dsrPorHora = currentAnalysis.metricas_calculadas?.dsr_por_hora ?? 
    ((dsrValor && horasDsrIntermitente && horasDsrIntermitente > 0) ? dsrValor / horasDsrIntermitente : null);

  // Calculated metrics from complements or fallbacks
  const ganhoPorDia = currentAnalysis.metricas_calculadas?.ganho_por_dia ?? 
    ((salLiq && diasTrabalhados) ? salLiq / diasTrabalhados : null);
  const ganhoPorHora = currentAnalysis.metricas_calculadas?.ganho_por_hora ?? 
    ((salLiq && horasTrabalhadas) ? salLiq / horasTrabalhadas : null);
  const descontoPorDia = currentAnalysis.metricas_calculadas?.desconto_por_dia ?? 
    ((totDescontos && diasTrabalhados) ? totDescontos / diasTrabalhados : null);
  const adicionalPorDia = currentAnalysis.metricas_calculadas?.adicional_por_dia ?? 
    ((totAdicionais && diasTrabalhados) ? totAdicionais / diasTrabalhados : null);
  const adicionalNoturnoPorHora = currentAnalysis.metricas_calculadas?.adicional_noturno_por_hora ?? 
    ((noturnasValor && noturnasQtd) ? noturnasValor / noturnasQtd : null);
  const horasExtrasPorHora = currentAnalysis.metricas_calculadas?.horas_extras_por_hora ?? 
    ((extrasValor && extrasQtd) ? extrasValor / extrasQtd : null);

  // Currency Formatter Format: R$ 2.779,25
  const formatBRL = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "---";
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Percent Formatter
  const formatPercent = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "---";
    return `${val.toFixed(1)}%`;
  };

  // Filter items
  const descontosItens = currentAnalysis.itens?.filter(i => i.tipo === 'desconto') || [];
  const adicionaisItens = currentAnalysis.itens?.filter(i => i.tipo === 'provento') || [];

  // Helper smart advice for discounts
  const getDescontoExplanation = (nome: string, valor: number) => {
    const term = nome.toLowerCase();
    if (term.includes('inss') || term.includes('previdencia') || term.includes('previdência')) {
      return "Contribuição previdenciária oficial obrigatória. Esse desconto garante benefícios como aposentadoria, auxílio-doença e licenças maternidade.";
    }
    if (term.includes('irrf') || term.includes('imposto de renda') || term.includes('imposto')) {
      return "Imposto de Renda Retido na Fonte. O valor do desconto é progressivo conforme as regras anuais vigentes da Receita Federal.";
    }
    if (term.includes('adiantamento') || term.includes('vale')) {
      return "Refere-se ao valor adiantado na quinzena do mês corrente. Não é um encargo, mas sim uma antecipação de salário já recebida.";
    }
    if (term.includes('refeicao') || term.includes('alimentacao') || term.includes('vr') || term.includes('va') || term.includes('sodexo') || term.includes('ticket')) {
      return "Participação do trabalhador no benefício do vale-refeição ou alimentação. Verifique o limite de desconto que é de no máximo 20% do salário.";
    }
    if (term.includes('transporte') || term.includes('vt') || term.includes('passes')) {
      return "Participação no fornecimento do vale-transporte mensal. Por lei, o empregador pode descontar no máximo até 6% do seu salário básico.";
    }
    if (term.includes('atraso') || term.includes('falta') || term.includes('ausencia')) {
      return "Desconto de faltas ou atrasos não justificados. Esse valor reduz as horas produtivas computadas e merece conferência rigorosa.";
    }
    if (term.includes('plano de saude') || term.includes('medico') || term.includes('odontologico')) {
      return "Coparticipação em plano de saúde ou odontológico oferecido pela empresa. Confirme os valores de dependentes e consultas com o RH.";
    }
    // Default smart prompt advises of caution/warning
    if (valor > (salBruto * 0.1)) {
      return "Este desconto é expressivo (acima de 10% do seu salário bruto). Confirme o lançamento direto com o departamento de RH para dirimir dúvidas.";
    }
    return "Lançamento de desconto operacional. Verifique o descritivo ou confirme com o RH se as taxas praticadas estão corretas.";
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6 animate-fadeIn pb-24 text-left">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end border-b border-slate-100 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
            Análise Concluída com Sucesso
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Estatísticas do Holerite</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualizações, médias horárias, cálculo por dia produtivo e detalhamento minucioso de cada provento.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onDiscard}
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            Descartar
          </button>
          <button 
            onClick={() => onConfirm(currentAnalysis)}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[15px]">cloud_upload</span>
            Salvar e Confirmar
          </button>
        </div>
      </div>

      {/* Narrative Worker Overview and Competence */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Worker Badge */}
        <div className="md:col-span-2 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">badge</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/55 px-2 py-0.5 rounded-full capitalize">
              Regime {trabalhadorTipo}
            </span>
            <h3 className="text-lg font-extrabold text-slate-930 tracking-tight">{trabalhadorNome}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">domain</span> {empresaNome}
            </p>
          </div>
        </div>

        {/* Competence Year */}
        <div className="flex flex-row md:flex-col justify-between items-center md:items-end md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0 gap-1">
          <div className="text-left md:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Competência</span>
            <span className="text-lg font-extrabold text-slate-800">{competenciaMes} de {competenciaAno}</span>
          </div>
          <span className="material-symbols-outlined text-slate-300 md:block hidden">calendar_month</span>
        </div>

      </div>

      {/* Monthly Summary block (Resumo do Mês) */}
      <div className="bg-[#021F17] text-emerald-105 rounded-3xl p-6 border border-emerald-900 overflow-hidden relative shadow-md">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-6 translate-y-6">
          <span className="material-symbols-outlined text-[140px] text-emerald-300">verified_user</span>
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-emerald-450">
            <span className="material-symbols-outlined text-[20px] font-bold">query_stats</span>
            <span className="text-xs font-bold uppercase tracking-wider">Resumo Comportamental do Mês</span>
          </div>
          <p className="text-sm md:text-base text-emerald-50 font-medium leading-relaxed">
            Você informou <strong className="text-emerald-300 font-extrabold">{diasTrabalhados || "---"} dias trabalhados</strong> e <strong className="text-emerald-300 font-extrabold">{horasTrabalhadas || "---"} horas</strong> no mês. Com salário líquido de <strong className="text-white font-extrabold">{formatBRL(salLiq)}</strong>, sua média foi de <strong className="text-emerald-300 font-bold">{formatBRL(ganhoPorDia)}</strong> por dia trabalhado e <strong className="text-emerald-300 font-bold">{formatBRL(ganhoPorHora)}</strong> por hora trabalhada.
          </p>
          {currentAnalysis.observacoes_trabalhador && (
            <div className="mt-3 pt-3 border-t border-emerald-950 text-xs text-emerald-400">
              <span className="font-bold text-emerald-250">Sua observação registrada:</span> "{currentAnalysis.observacoes_trabalhador}"
            </div>
          )}
        </div>
      </div>

      {/* Main Financial Cards Grid (Bruto, Liquido, Descontos, Adicionais) */}
      <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider block">Principais Resultados Financeiros</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Salário Bruto */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-32 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salário Bruto</span>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">payments</span>
          </div>
          <span className="text-xl font-black text-slate-900">
            {formatBRL(salBruto)}
          </span>
        </div>

        {/* Salário Líquido */}
        <div className="bg-emerald-800 text-white rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-3 translate-y-3">
            <span className="material-symbols-outlined text-[70px]">account_balance_wallet</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Salário Líquido</span>
            <span className="material-symbols-outlined text-emerald-200 text-[18px]">account_balance_wallet</span>
          </div>
          <span className="text-2xl font-black text-white">
            {formatBRL(salLiq)}
          </span>
        </div>

        {/* Descontos Totais */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-32 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descontos Totais</span>
            <span className="material-symbols-outlined text-rose-500 text-[18px]">trending_down</span>
          </div>
          <span className="text-xl font-black text-rose-600">
            - {formatBRL(totDescontos)}
          </span>
        </div>

        {/* Adicionais proventos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-32 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adicionais</span>
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">trending_up</span>
          </div>
          <span className="text-xl font-black text-emerald-700">
            + {formatBRL(totAdicionais)}
          </span>
        </div>

      </div>

      {/* NEW CALCULATED CARDS FOR COMPLEMENT VALUES */}
      <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider block">Médias Diárias e Tarifárias em Detalhe</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Ganho por dia trabalhado */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col justify-between h-28 shadow-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Rendimento</span>
            <span className="text-[10px] font-extrabold text-slate-700 tracking-tight leading-tight">Ganho por Dia</span>
          </div>
          <span className="text-lg font-black text-slate-900">
            {formatBRL(ganhoPorDia)}
          </span>
        </div>

        {/* Ganho por hora */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col justify-between h-28 shadow-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Rendimento</span>
            <span className="text-[10px] font-extrabold text-slate-700 tracking-tight leading-tight">Ganho por Hora</span>
          </div>
          <span className="text-lg font-black text-slate-900">
            {formatBRL(ganhoPorHora)}
          </span>
        </div>

        {/* Desconto médio por dia */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col justify-between h-28 shadow-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider">Perda Média</span>
            <span className="text-[10px] font-extrabold text-slate-700 tracking-tight leading-tight">Desconto / Dia</span>
          </div>
          <span className="text-lg font-black text-red-650">
            - {formatBRL(descontoPorDia)}
          </span>
        </div>

        {/* Adicional médio por dia */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col justify-between h-28 shadow-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Acréscimo</span>
            <span className="text-[10px] font-extrabold text-slate-700 tracking-tight leading-tight">Adicional / Dia</span>
          </div>
          <span className="text-lg font-black text-emerald-700">
            + {formatBRL(adicionalPorDia)}
          </span>
        </div>

        {/* Hora adicional noturno */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col justify-between h-28 shadow-xs col-span-2 md:col-span-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Adic. Noturno</span>
            <span className="text-[10px] font-extrabold text-slate-700 tracking-tight leading-tight">Valor por Hora</span>
          </div>
          <span className="text-lg font-black text-slate-700">
            {formatBRL(adicionalNoturnoPorHour(adicionalNoturnoPorHora, noturnasValor))}
          </span>
        </div>

        {/* DSR Intermitente por Hora Card */}
        {horasDsrIntermitente !== null && dsrPorHora !== null && (
          <div className="bg-indigo-50/40 rounded-2xl p-4 border border-indigo-100 flex flex-col justify-between h-28 shadow-xs col-span-2 md:col-span-1 animate-fadeIn">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider">DSR Intermitente</span>
              <span className="text-[10px] font-extrabold text-slate-700 tracking-tight leading-tight">Valor por Hora</span>
            </div>
            <span className="text-lg font-black text-indigo-900">
              {formatBRL(dsrPorHora)}
            </span>
          </div>
        )}

      </div>

      {/* DSR Intermitente Callout Alert */}
      {horasDsrIntermitente !== null && dsrPorHora !== null && (
        <div className="bg-indigo-50 border border-indigo-100/70 rounded-2xl p-4 flex gap-3 text-left w-full animate-fadeIn shadow-2xs">
          <span className="material-symbols-outlined text-indigo-700 select-none text-xl animate-pulse">beach_access</span>
          <div>
            <p className="text-xs font-bold text-indigo-950">Descanso Semanal Remunerado (DSR Intermitente)</p>
            <p className="text-xs text-indigo-900 mt-1">
              Você recebeu aproximadamente <strong className="text-indigo-950 font-extrabold">{formatBRL(dsrPorHora)}</strong> por hora de DSR intermitente.
            </p>
          </div>
        </div>
      )}

      {/* ADVANCED CHARTING SECTION */}
      <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider block">Mapeamento Visual do seu Bolso</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Proventos vs Descontos Breakdown (Total scale) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-left space-y-4">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-700">compare_arrows</span> Proventos vs Descontos
          </h3>
          <p className="text-[11px] text-slate-400">Distribuição percentual de quanto do seu salário bruto virou desconto em relação aos acréscimos.</p>
          
          <div className="space-y-4 pt-1">
            {/* Horizontal stack chart */}
            <div className="w-full bg-slate-100 h-8 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${Math.max(15, Math.min(85, (salLiq / (salBruto || 1)) * 100))}%` }}
                className="bg-emerald-700 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all shadow-inner"
              >
                Líquido {((salLiq / (salBruto || 1)) * 100).toFixed(0)}%
              </div>
              <div 
                style={{ width: `${Math.max(15, Math.min(85, (totDescontos / (salBruto || 1)) * 100))}%` }}
                className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all shadow-inner"
              >
                Descontos {((totDescontos / (salBruto || 1)) * 100).toFixed(0)}%
              </div>
            </div>

            {/* Explanatory legend table */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-50 text-[11px]">
              <div>
                <span className="block text-slate-400 text-[10px]">Salário Bruto</span>
                <span className="font-bold text-slate-700">{formatBRL(salBruto)}</span>
              </div>
              <div>
                <span className="block text-emerald-700 text-[10px]">Saldo Recebido</span>
                <span className="font-bold text-emerald-800">{formatBRL(salLiq)}</span>
              </div>
              <div>
                <span className="block text-rose-500 text-[10px]">Total Retido</span>
                <span className="font-bold text-rose-600">{formatBRL(totDescontos)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Visual Segmented Donut Bar (Descontos composition) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-left space-y-4">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-red-500">pie_chart</span> Composição do Saldo de Descontos
          </h3>
          <p className="text-[11px] text-slate-400">Proporção individual de perda sobre o valor bruto total de descontos.</p>
          
          <div className="space-y-4 pt-1">
            <div className="w-full bg-slate-50 h-5 rounded-full overflow-hidden flex border border-slate-100">
              {descontosItens.length === 0 ? (
                <div className="bg-slate-200 w-full h-full flex items-center justify-center text-[9px] text-slate-400">Nenhum desconto identificado</div>
              ) : (
                descontosItens.map((item, idx) => {
                  const share = (item.valor / (totDescontos || 1)) * 100;
                  const bgColors = ["bg-rose-500", "bg-orange-400", "bg-amber-400", "bg-pink-400", "bg-purple-400"];
                  const color = bgColors[idx % bgColors.length];
                  return (
                    <div 
                      key={idx}
                      style={{ width: `${share}%` }} 
                      className={`${color} h-full tracking-wide shadow-neutral-100 shadow-inner`}
                      title={`${item.nome}: ${formatBRL(item.valor)} (${share.toFixed(1)}%)`}
                    />
                  );
                })
              )}
            </div>

            {/* Custom Bullet list */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px]">
              {descontosItens.map((item, idx) => {
                const share = (item.valor / (totDescontos || 1)) * 100;
                const bgColors = ["bg-rose-500", "bg-orange-400", "bg-amber-400", "bg-pink-400", "bg-purple-400"];
                const dotColor = bgColors[idx % bgColors.length];
                return (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
                    <span className="text-slate-500 font-medium truncate max-w-[120px]">{item.nome}</span>
                    <span className="text-slate-800 font-bold">{share.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* DETALHAMENTO DE DESCONTOS: PARA ONDE FORAM SEUS DESCONTOS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm text-left space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Para onde foram seus descontos</h3>
          <p className="text-xs text-slate-500 mt-1">
            Lista detalhada de cada abatimento deduzido de sua folha de pagamento, com as respectivas médias diárias e representação tributária.
          </p>
        </div>

        <div className="space-y-4">
          {descontosItens.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs text-medium">
              Nenhum desconto registrado neste holerite.
            </div>
          ) : (
            descontosItens.sort((a,b) => b.valor - a.valor).map((item, idx) => {
              const percOfGross = (item.valor / (salBruto || 1)) * 100;
              const avgPerDayItem = diasTrabalhados ? item.valor / diasTrabalhados : null;
              
              // Warning classification: if discount is INSS, IRRF, or small it's normal. If other, warn.
              const isNormalTribute = item.nome.toLowerCase().includes('inss') || item.nome.toLowerCase().includes('irrf') || item.nome.toLowerCase().includes('previdencia') || item.nome.toLowerCase().includes('aditanto') || item.nome.toLowerCase().includes('vale');
              const feedbackBadgeClass = isNormalTribute 
                ? "bg-slate-100 text-slate-600 border border-slate-200"
                : item.valor > (salBruto * 0.05) 
                  ? "bg-rose-50 text-red-700 border border-red-100" 
                  : "bg-amber-50 text-amber-700 border border-amber-150";
              const feedbackMsg = isNormalTribute
                ? "Encargo ordinário"
                : item.valor > (salBruto * 0.05)
                  ? "Esse valor merece atenção"
                  : "Verifique este desconto";

              return (
                <div 
                  key={idx}
                  className="bg-slate-50/50 hover:bg-slate-50 border border-slate-150/45 p-5 rounded-2xl flex flex-col md:flex-row gap-4 justify-between transition-all"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 tracking-tight">{item.nome}</span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${feedbackBadgeClass}`}>
                        {feedbackMsg}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                      {getDescontoExplanation(item.nome, item.valor)}
                    </p>
                  </div>

                  {/* Financial item statistics values */}
                  <div className="flex flex-wrap sm:flex-nowrap md:flex-col gap-6 md:gap-1.5 md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 shrink-0 text-left md:text-right">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Desconto Total</span>
                      <span className="text-sm font-extrabold text-red-650">{formatBRL(item.valor)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Média por dia</span>
                      <span className="text-xs font-bold text-slate-700">{formatBRL(avgPerDayItem)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Peso no salário bruto</span>
                      <span className="text-xs font-bold text-slate-500">{formatPercent(percOfGross)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* DETALHAMENTO DE ADICIONAIS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm text-left space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Detalhamento dos adicionais</h3>
          <p className="text-xs text-slate-500 mt-1">
            Veja as verbas remuneratórias que inflaram seu pagamento acima do básico neste mês comercial.
          </p>
        </div>

        <div className="space-y-4">
          {adicionaisItens.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-105 rounded-2xl text-slate-400 text-xs text-medium">
              Nenhuma verba adicional identificada.
            </div>
          ) : (
            adicionaisItens.sort((a,b) => b.valor - a.valor).map((item, idx) => {
              const avgPerDayItem = diasTrabalhados ? item.valor / diasTrabalhados : null;
              const avgPerHourItem = horasTrabalhadas ? item.valor / horasTrabalhadas : null;
              
              return (
                <div 
                  key={idx}
                  className="bg-emerald-50/15 hover:bg-emerald-50/25 border border-emerald-100/30 p-5 rounded-2xl flex flex-col md:flex-row gap-4 justify-between transition-all"
                >
                  <div className="flex-1 space-y-1">
                    <span className="font-extrabold text-xs text-slate-900 block">{item.nome}</span>
                    <p className="text-[11px] text-slate-400">
                      Provento recebido. Acrescenta diretamente {formatBRL(item.valor)} ao seu salário base e ajuda a compor a base de cálculo tributária.
                    </p>
                  </div>

                  {/* Financial additions info */}
                  <div className="grid grid-cols-3 gap-4 md:flex md:flex-col md:gap-1.5 md:items-end md:justify-center border-t md:border-t-0 md:border-l border-emerald-100/20 pt-3 md:pt-0 md:pl-5 shrink-0 text-left md:text-right text-xs">
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wide">Valor Total</span>
                      <span className="font-extrabold text-emerald-800 text-sm">{formatBRL(item.valor)}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wide">Média/Dia</span>
                      <span className="font-bold text-slate-700">{formatBRL(avgPerDayItem)}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wide">Média/Hora</span>
                      <span className="font-bold text-slate-700">{formatBRL(avgPerHourItem)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ADICIONAL NOTURNO SPECIAL ADVICE CALLOUT */}
      {noturnasValor && noturnasValor > 0 && noturnasQtd && noturnasQtd > 0 && (
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border-l-4 border-emerald-500 shadow-sm text-left flex gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-950 text-emerald-450 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">dark_mode</span>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Métrica de Horas Noturnas</h4>
            <p className="text-sm font-medium text-slate-200">
              Você recebeu aproximadamente <strong className="text-white font-extrabold">{formatBRL(adicionalNoturnoPorHora)} por hora</strong> de adicional noturno realizada.
            </p>
            <p className="text-[11px] text-slate-400">
              O adicional noturno regulamentar deve ser pago com acréscimo de no mínimo 20% sobre a hora diurna convencional para trabalhadores urbanos das 22h às 5h.
            </p>
          </div>
        </div>
      )}

      {/* SYSTEM WARNING LABELS AND COMPLIANCE */}
      {currentAnalysis.alertas && currentAnalysis.alertas.length > 0 && (
        <section className="bg-red-50/50 rounded-3xl p-6 border border-rose-100 flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2 text-rose-850">
            <span className="material-symbols-outlined text-red-505 font-black">gavel</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">Inconsistências e Linhas de Verificação Recomendadas</h3>
          </div>
          <p className="text-xs text-red-650/80 -mt-2 leading-relaxed">
            Nossa inteligência artificial identificou descontos incomuns ou retenções acima da média convencional. Use as orientações com reserva profissional e confirme sempre com seu RH.
          </p>
          <div className="flex flex-col gap-3">
            {currentAnalysis.alertas.map((alerta: any, idx: number) => (
              <div 
                key={idx} 
                className="bg-white p-4 rounded-2xl border border-rose-100/60 shadow-xs flex gap-3"
              >
                <span className="material-symbols-outlined text-rose-500 shrink-0 mt-0.5">info</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-slate-900">Alerta de Atenção</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{alerta.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SUMMARY EXPLANATORY NARRATIVE */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm text-left space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest block">Análise Contextualizada pela IA</h4>
        <p className="text-xs leading-relaxed text-slate-600 bg-slate-50/85 p-5 rounded-2xl border border-slate-100/50 italic whitespace-pre-line select-none">
          "{currentAnalysis.resumo_ia}"
        </p>
      </section>

      {/* FINAL VIEW FOOTER ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <button 
          onClick={onDiscard}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-205 text-slate-700 font-bold text-xs rounded-xl transition-colors shrink-0 active:scale-95"
        >
          Descartar holerite
        </button>
        <button 
          onClick={() => onConfirm(currentAnalysis)}
          className="px-8 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 tracking-wide shrink-0 active:scale-95"
        >
          <span>Confirmar e Salvar no Histórico</span>
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
        </button>
      </div>

    </div>
  );
}

// Private helpers
function adicionalNoturnoPorHour(metricVal: number | null, rawVal: number | null) {
  if (metricVal !== null && metricVal > 0) return metricVal;
  return null;
}
