import React, { useState } from 'react';
import { ContrachequeAnalise } from '../types';

interface AnalysisViewProps {
  currentAnalysis: any; // newly computed JSON
  onConfirm: (finalAnalysis: ContrachequeAnalise) => void;
  onDiscard: () => void;
}

// Robust helper to parse Brazilian currency format (e.g. 2739,25; R$ 2.739,25; 2739.25)
function parseBrazilianCurrency(value: string): number | null {
  if (!value) return null;
  let clean = value.replace(/R\$\s?/gi, '').trim();
  if (!clean) return null;
  
  if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }
  
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? null : parsed;
}

export default function AnalysisView({ currentAnalysis, onConfirm, onDiscard }: AnalysisViewProps) {
  if (!currentAnalysis) return null;

  // Initialize input complements state
  const [userComplements, setUserComplements] = useState({
    trabalhador_nome: '',
    trabalhador_tipo: '' as "mensalista" | "intermitente" | '',
    empresa_nome: '',
    empresa_cnpj: '',
    competencia_mes: '',
    competencia_ano: '',
    dias_trabalhados: '',
    horas_trabalhadas: '',
    horas_extras: '',
    horas_noturnas: '',
    salario_bruto: '',
    salario_liquido: '',
    total_descontos: '',
    total_adicionais: '',
    horas_extras_valor: '',
    adicional_noturno_valor: '',
    bonus: '',
  });

  // Helper check for missing fields
  const isMissing = (val: any) => {
    return val === null || val === undefined || val === "" || val === 0;
  };

  const missings = {
    trabalhador_nome: isMissing(currentAnalysis.trabalhador?.nome),
    trabalhador_tipo: isMissing(currentAnalysis.trabalhador?.tipo),
    empresa_nome: isMissing(currentAnalysis.empresa?.nome),
    empresa_cnpj: isMissing(currentAnalysis.empresa?.cnpj),
    competencia_mes: isMissing(currentAnalysis.competencia?.mes),
    competencia_ano: isMissing(currentAnalysis.competencia?.ano),
    dias_trabalhados: isMissing(currentAnalysis.trabalho?.dias_trabalhados),
    horas_trabalhadas: isMissing(currentAnalysis.trabalho?.horas_trabalhadas),
    horas_extras: isMissing(currentAnalysis.trabalho?.horas_extras),
    horas_noturnas: isMissing(currentAnalysis.trabalho?.horas_noturnas),
    salario_bruto: isMissing(currentAnalysis.valores?.salario_bruto),
    salario_liquido: isMissing(currentAnalysis.valores?.salario_liquido),
    total_descontos: isMissing(currentAnalysis.valores?.total_descontos),
    total_adicionais: isMissing(currentAnalysis.valores?.total_adicionais),
    horas_extras_valor: isMissing(currentAnalysis.valores?.horas_extras_valor),
    adicional_noturno_valor: isMissing(currentAnalysis.valores?.adicional_noturno_valor),
    bonus: isMissing(currentAnalysis.valores?.bonus)
  };

  const hasAnyMissing = Object.values(missings).some(m => m === true);

  // Helper to parse values reactively or from form
  const getDisplayValue = (fieldKey: keyof typeof userComplements, aiVal: any, isCurrency = true) => {
    const typedVal = userComplements[fieldKey];
    if (typedVal !== '') {
      if (isCurrency) {
        return parseBrazilianCurrency(typedVal);
      } else {
        const parsed = parseFloat(typedVal);
        return isNaN(parsed) ? null : parsed;
      }
    }
    return aiVal;
  };

  // Format currency helper
  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "---";
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleConfirmClick = () => {
    const parseNum = (val: any): number | null => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'number') return val;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    };

    // Calculate merged worker fields
    const mergedTrabalhador = {
      nome: userComplements.trabalhador_nome.trim() || currentAnalysis.trabalhador?.nome || null,
      tipo: (userComplements.trabalhador_tipo || currentAnalysis.trabalhador?.tipo || null) as "mensalista" | "intermitente" | null
    };

    const mergedEmpresa = {
      nome: userComplements.empresa_nome.trim() || currentAnalysis.empresa?.nome || null,
      cnpj: userComplements.empresa_cnpj.trim() || currentAnalysis.empresa?.cnpj || null
    };

    const mergedCompetencia = {
      mes: userComplements.competencia_mes || currentAnalysis.competencia?.mes || null,
      ano: userComplements.competencia_ano.trim() || currentAnalysis.competencia?.ano || null
    };

    // Resolve financial figures (use typed complements if filled, else take raw AI value or keep null)
    const userSalBruto = userComplements.salario_bruto ? parseBrazilianCurrency(userComplements.salario_bruto) : null;
    const userSalLiq = userComplements.salario_liquido ? parseBrazilianCurrency(userComplements.salario_liquido) : null;
    const userTotDescontos = userComplements.total_descontos ? parseBrazilianCurrency(userComplements.total_descontos) : null;
    const userTotAdicionais = userComplements.total_adicionais ? parseBrazilianCurrency(userComplements.total_adicionais) : null;
    const userHorasExtrasVal = userComplements.horas_extras_valor ? parseBrazilianCurrency(userComplements.horas_extras_valor) : null;
    const userAdicNoturnoVal = userComplements.adicional_noturno_valor ? parseBrazilianCurrency(userComplements.adicional_noturno_valor) : null;
    const userBonusVal = userComplements.bonus ? parseBrazilianCurrency(userComplements.bonus) : null;

    const mergedValores = {
      salario_bruto: userSalBruto !== null ? userSalBruto : parseNum(currentAnalysis.valores?.salario_bruto),
      salario_liquido: userSalLiq !== null ? userSalLiq : parseNum(currentAnalysis.valores?.salario_liquido),
      total_descontos: userTotDescontos !== null ? userTotDescontos : parseNum(currentAnalysis.valores?.total_descontos),
      total_adicionais: userTotAdicionais !== null ? userTotAdicionais : parseNum(currentAnalysis.valores?.total_adicionais),
      inss: parseNum(currentAnalysis.valores?.inss),
      fgts: parseNum(currentAnalysis.valores?.fgts),
      horas_extras_valor: userHorasExtrasVal !== null ? userHorasExtrasVal : parseNum(currentAnalysis.valores?.horas_extras_valor),
      adicional_noturno_valor: userAdicNoturnoVal !== null ? userAdicNoturnoVal : parseNum(currentAnalysis.valores?.adicional_noturno_valor),
      bonus: userBonusVal !== null ? userBonusVal : parseNum(currentAnalysis.valores?.bonus)
    };

    // Resolve labor indicators
    const userDias = userComplements.dias_trabalhados !== '' ? parseNum(userComplements.dias_trabalhados) : null;
    const userHoras = userComplements.horas_trabalhadas !== '' ? parseNum(userComplements.horas_trabalhadas) : null;
    const userHorasExt = userComplements.horas_extras !== '' ? parseNum(userComplements.horas_extras) : null;
    const userHorasNot = userComplements.horas_noturnas !== '' ? parseNum(userComplements.horas_noturnas) : null;

    const baseDias = userDias !== null ? userDias : parseNum(currentAnalysis.trabalho?.dias_trabalhados);
    const baseHoras = userHoras !== null ? userHoras : parseNum(currentAnalysis.trabalho?.horas_trabalhadas);

    // Compute metrics
    let calcMediaDia: number | null = null;
    let calcMediaHora: number | null = null;

    const finalSalLiq = mergedValores.salario_liquido;

    if (finalSalLiq !== null && finalSalLiq > 0) {
      if (baseDias !== null && baseDias > 0) {
        calcMediaDia = Number((finalSalLiq / baseDias).toFixed(2));
      }
      if (baseHoras !== null && baseHoras > 0) {
        calcMediaHora = Number((finalSalLiq / baseHoras).toFixed(2));
      }
    }

    const mergedTrabalho = {
      dias_trabalhados: baseDias,
      horas_trabalhadas: baseHoras,
      horas_extras: userHorasExt !== null ? userHorasExt : parseNum(currentAnalysis.trabalho?.horas_extras),
      horas_noturnas: userHorasNot !== null ? userHorasNot : parseNum(currentAnalysis.trabalho?.horas_noturnas),
      media_por_dia: calcMediaDia,
      media_por_hora: calcMediaHora
    };

    // Append user observation to resumo_ia if any input was filled
    const userFilledAnything = Object.values(userComplements).some(v => v !== '');
    let finalResumoIa = currentAnalysis.resumo_ia || "";
    if (userFilledAnything) {
      finalResumoIa += "\nA análise foi complementada com informações informadas pelo trabalhador.";
    }

    const finalData: ContrachequeAnalise = {
      id: "analysed-" + Date.now(),
      uploadedAt: new Date().toISOString(),
      fileName: (window as any).__tempUploadedFile?.fileName || "holerite_analisado.pdf",
      trabalhador: mergedTrabalhador,
      empresa: mergedEmpresa,
      competencia: mergedCompetencia,
      valores: mergedValores,
      trabalho: mergedTrabalho,
      itens: currentAnalysis.itens || [],
      alertas: currentAnalysis.alertas || [],
      resumo_ia: finalResumoIa
    };

    onConfirm(finalData);
  };

  // Determine reactive view values
  const viewTrabalhadorNome = userComplements.trabalhador_nome.trim() || currentAnalysis.trabalhador?.nome || "Nome não identificado";
  const viewEmpresaNome = userComplements.empresa_nome.trim() || currentAnalysis.empresa?.nome || "Empresa não identificada";
  const viewCompetenciaMes = userComplements.competencia_mes || currentAnalysis.competencia?.mes || "Mês";
  const viewCompetenciaAno = userComplements.competencia_ano.trim() || currentAnalysis.competencia?.ano || "Ano";
  const viewTrabalhadorTipo = userComplements.trabalhador_tipo || currentAnalysis.trabalhador?.tipo || "Regime não informado";

  const viewSalBruto = getDisplayValue('salario_bruto', currentAnalysis.valores?.salario_bruto);
  const viewSalLiq = getDisplayValue('salario_liquido', currentAnalysis.valores?.salario_liquido);
  const viewTotDescontos = getDisplayValue('total_descontos', currentAnalysis.valores?.total_descontos);
  const viewTotAdicionais = getDisplayValue('total_adicionais', currentAnalysis.valores?.total_adicionais);
  const viewHorasExtrasVal = getDisplayValue('horas_extras_valor', currentAnalysis.valores?.horas_extras_valor);
  const viewHorasExtrasQtd = getDisplayValue('horas_extras', currentAnalysis.trabalho?.horas_extras, false);
  const viewAdicionalNoturnoVal = getDisplayValue('adicional_noturno_valor', currentAnalysis.valores?.adicional_noturno_valor);

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
            <h2 className="text-sm font-bold text-slate-800">{viewTrabalhadorNome}</h2>
            <p className="text-xs text-slate-400">{viewEmpresaNome}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-slate-500">calendar_month</span>
            <span className="text-[10px] font-bold text-slate-500">
              {viewCompetenciaMes} / {viewCompetenciaAno}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-slate-500">work</span>
            <span className="text-[10px] font-bold text-slate-500 capitalize">
              {viewTrabalhadorTipo}
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
            {formatCurrency(viewSalBruto)}
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
            {formatCurrency(viewSalLiq)}
          </span>
        </div>

        {/* Descontos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-32 shadow-xs text-left">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Descontos Totais</span>
            <span className="material-symbols-outlined text-red-500 text-lg">trending_down</span>
          </div>
          <span className="text-xl font-bold text-red-500">
            - {formatCurrency(viewTotDescontos)}
          </span>
        </div>

        {/* Adicionais */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-32 shadow-xs text-left">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Adicionais</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">trending_up</span>
          </div>
          <span className="text-xl font-bold text-emerald-600">
            + {formatCurrency(viewTotAdicionais)}
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
              {viewHorasExtrasVal ? `+ ${formatCurrency(viewHorasExtrasVal)}` : "R$ 0,00"}
            </span>
            {viewHorasExtrasQtd !== null && viewHorasExtrasQtd !== 0 && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                {viewHorasExtrasQtd} hrs
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
            {formatCurrency(viewAdicionalNoturnoVal)}
          </span>
        </div>
      </section>

      {/* Completion Section for Missing / Incomplete info */}
      {hasAnyMissing && (
        <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-left space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-emerald-800 font-bold">edit_note</span>
              <h3 className="text-sm font-bold text-slate-900">Completar informações da análise</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              A IA não encontrou algumas informações no holerite. Preencher estes campos é opcional, mas ajuda a gerar gráficos e médias mais completas.
            </p>
          </div>

          {/* Special rule: salario_liquido is 0 or null */}
          {missings.salario_liquido && (
            <div className="p-4 bg-emerald-50/55 border border-emerald-100 rounded-xl space-y-2">
              <label className="text-xs font-bold text-emerald-900 block leading-relaxed">
                Seu holerite mostra salário líquido zerado. Informe aqui quanto você realmente recebeu, se desejar.
              </label>
              <div className="relative max-w-sm">
                <span className="absolute left-3 top-2 text-xs font-bold text-emerald-700">R$</span>
                <input
                  type="text"
                  placeholder="Ex: 2.739,25"
                  value={userComplements.salario_liquido}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, salario_liquido: e.target.value }))}
                  className="w-full bg-white border border-emerald-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Form grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {missings.trabalhador_nome && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nome do trabalhador</label>
                <input
                  type="text"
                  placeholder="Nome do colaborador"
                  value={userComplements.trabalhador_nome}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, trabalhador_nome: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.trabalhador_tipo && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tipo de trabalhador</label>
                <select
                  value={userComplements.trabalhador_tipo}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, trabalhador_tipo: e.target.value as any }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                >
                  <option value="">Selecione...</option>
                  <option value="mensalista">Mensalista</option>
                  <option value="intermitente">Intermitente</option>
                </select>
              </div>
            )}

            {missings.empresa_nome && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nome da empresa</label>
                <input
                  type="text"
                  placeholder="Nome corporativo"
                  value={userComplements.empresa_nome}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, empresa_nome: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.empresa_cnpj && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">CNPJ da empresa</label>
                <input
                  type="text"
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  value={userComplements.empresa_cnpj}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, empresa_cnpj: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.competencia_mes && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Mês de competência</label>
                <select
                  value={userComplements.competencia_mes}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, competencia_mes: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                >
                  <option value="">Escolha o mês</option>
                  {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {missings.competencia_ano && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ano de competência</label>
                <input
                  type="text"
                  placeholder="Ex: 2024"
                  value={userComplements.competencia_ano}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, competencia_ano: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.dias_trabalhados && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Dias trabalhados</label>
                <input
                  type="number"
                  placeholder="Quantidade de dias"
                  value={userComplements.dias_trabalhados}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, dias_trabalhados: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.horas_trabalhadas && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Horas trabalhadas</label>
                <input
                  type="number"
                  placeholder="Quantidade de horas"
                  value={userComplements.horas_trabalhadas}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, horas_trabalhadas: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.horas_extras && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Horas extras (Quantidade)</label>
                <input
                  type="number"
                  placeholder="Ex: 10"
                  value={userComplements.horas_extras}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, horas_extras: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.horas_noturnas && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Horas noturnas (Quantidade)</label>
                <input
                  type="number"
                  placeholder="Ex: 20"
                  value={userComplements.horas_noturnas}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, horas_noturnas: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.salario_bruto && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Salário bruto</label>
                <input
                  type="text"
                  placeholder="Ex: 4.500,00"
                  value={userComplements.salario_bruto}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, salario_bruto: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.total_descontos && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total de descontos</label>
                <input
                  type="text"
                  placeholder="Ex: 679.50"
                  value={userComplements.total_descontos}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, total_descontos: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.total_adicionais && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total de adicionais</label>
                <input
                  type="text"
                  placeholder="Ex: 150.00"
                  value={userComplements.total_adicionais}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, total_adicionais: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.horas_extras_valor && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Valor de horas extras</label>
                <input
                  type="text"
                  placeholder="Ex: 150.00"
                  value={userComplements.horas_extras_valor}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, horas_extras_valor: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.adicional_noturno_valor && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Valor de adicional noturno</label>
                <input
                  type="text"
                  placeholder="Ex: 80.00"
                  value={userComplements.adicional_noturno_valor}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, adicional_noturno_valor: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            {missings.bonus && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Bônus, prêmios ou dilações</label>
                <input
                  type="text"
                  placeholder="Ex: 500.00"
                  value={userComplements.bonus}
                  onChange={(e) => setUserComplements(prev => ({ ...prev, bonus: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

          </div>
        </section>
      )}

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
        <p className="text-xs leading-relaxed text-slate-600 italic bg-slate-50 p-4 rounded-xl border border-slate-100 h-auto whitespace-pre-line">
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

