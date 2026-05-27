import React, { useState } from 'react';
import { ComplementaryAnalysisData } from '../types';
import DecimalHoursHint from './DecimalHoursHint';

interface ComplementAnalysisViewProps {
  currentAnalysis: any;
  onConfirm: (complements: ComplementaryAnalysisData) => void;
  onDiscard: () => void;
}

export default function ComplementAnalysisView({ currentAnalysis, onConfirm, onDiscard }: ComplementAnalysisViewProps) {
  if (!currentAnalysis) return null;

  // Pre-populate with values extracted by AI so the user can easily confirm them
  const [complements, setComplements] = useState<Required<ComplementaryAnalysisData>>({
    dias_trabalhados: currentAnalysis.trabalho?.dias_trabalhados ?? null,
    horas_trabalhadas: currentAnalysis.trabalho?.horas_trabalhadas ?? null,
    horas_extras: currentAnalysis.trabalho?.horas_extras ?? null,
    horas_noturnas: currentAnalysis.trabalho?.horas_noturnas ?? null,
    salario_liquido_recebido: currentAnalysis.valores?.salario_liquido ?? null,
    empresa_nome: currentAnalysis.empresa?.nome ?? '',
    tipo_trabalhador: currentAnalysis.trabalhador?.tipo ?? 'mensalista',
    observacoes: '',
    horas_dsr_intermitente: currentAnalysis.trabalho?.horas_dsr_intermitente ?? null,
  });

  // Local state as string for uncontrolled user typing before parses
  const [salLiqText, setSalLiqText] = useState(() => {
    const val = currentAnalysis.valores?.salario_liquido;
    if (val === null || val === undefined) return '';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  });

  const [diasText, setDiasText] = useState(() => {
    return currentAnalysis.trabalho?.dias_trabalhados?.toString() || '';
  });

  const [horasText, setHorasText] = useState(() => {
    return currentAnalysis.trabalho?.horas_trabalhadas?.toString() || '';
  });

  const [extrasText, setExtrasText] = useState(() => {
    return currentAnalysis.trabalho?.horas_extras?.toString() || '';
  });

  const [noturnasText, setNoturnasText] = useState(() => {
    return currentAnalysis.trabalho?.horas_noturnas?.toString() || '';
  });

  const [dsrText, setDsrText] = useState(() => {
    return currentAnalysis.trabalho?.horas_dsr_intermitente?.toString() || '';
  });

  const [empresaText, setEmpresaText] = useState(() => {
    return currentAnalysis.empresa?.nome || '';
  });

  const [tipoTrab, setTipoTrab] = useState<"mensalista" | "intermitente">(() => {
    return (currentAnalysis.trabalhador?.tipo as "mensalista" | "intermitente") || 'mensalista';
  });

  const [obsText, setObsText] = useState('');

  // Currency parser
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

  const handleRecalculate = () => {
    const parsedSalLiq = parseBrazilianCurrency(salLiqText);
    const parsedDias = diasText ? parseInt(diasText, 10) : null;
    const parsedHoras = horasText ? parseFloat(horasText.replace(',', '.')) : null;
    const parsedExtras = extrasText ? parseFloat(extrasText.replace(',', '.')) : null;
    const parsedNoturnas = noturnasText ? parseFloat(noturnasText.replace(',', '.')) : null;
    const parsedDsr = dsrText ? parseFloat(dsrText.replace(',', '.')) : null;

    const data: ComplementaryAnalysisData = {
      dias_trabalhados: isNaN(Number(parsedDias)) ? null : parsedDias,
      horas_trabalhadas: isNaN(Number(parsedHoras)) ? null : parsedHoras,
      horas_extras: isNaN(Number(parsedExtras)) ? null : parsedExtras,
      horas_noturnas: isNaN(Number(parsedNoturnas)) ? null : parsedNoturnas,
      salario_liquido_recebido: parsedSalLiq,
      empresa_nome: empresaText.trim() || null,
      tipo_trabalhador: tipoTrab || null,
      observacoes: obsText.trim() || null,
      horas_dsr_intermitente: isNaN(Number(parsedDsr)) ? null : parsedDsr
    };

    onConfirm(data);
  };

  const hasDsrItem = currentAnalysis.itens?.some((item: any) => {
    const name = (item.nome || "").toLowerCase();
    return name.includes("dsr") || name.includes("descanso") || name.includes("r.s.d.") || name.includes("rsd");
  }) || false;

  const showDsrField = tipoTrab === 'intermitente' || hasDsrItem;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6 animate-fadeIn pb-16">
      {/* Step Banner */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          <span className="material-symbols-outlined text-[14px]">checklist</span> Passo 2 de 3: Confirmar Dados
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Completar dados do holerite</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          A IA interpretou os dados do documento. Revise e preencha as informações abaixo para que possamos calcular as médias, rendimentos e estatísticas precisas.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        
        {/* Helper Note */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/50 flex gap-3 text-left">
          <span className="material-symbols-outlined text-emerald-700 text-xl shrink-0 mt-0.5">info</span>
          <div>
            <p className="text-xs font-bold text-emerald-950">Mais transparência nas suas contas</p>
            <p className="text-[11px] text-emerald-800/90 mt-0.5 mt-1 leading-relaxed">
              Quanto mais dados você preencher, mais completa será sua análise. Campo sob revisão ou ausente na digitalização pode ser corrigido diretamente abaixo.
            </p>
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-6 text-left">
          
          {/* Highlighted Field: Dias Trabalhados */}
          <div className="p-5 bg-gradient-to-tr from-emerald-50/30 to-emerald-50/70 border-2 border-emerald-600/40 rounded-2xl space-y-2 relative shadow-xs">
            <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Uso Essencial
            </div>
            
            <label className="block text-xs font-extrabold text-slate-900 flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-emerald-700">calendar_today</span>
              Dias trabalhados no mês
            </label>
            <p className="text-[10px] text-slate-500 leading-normal">
              Este campo é fundamental! Se não for informado ou estiver incorreto, não conseguiremos calcular seu ganho real por dia trabalhado, seus adicionais diários e futuros comparativos.
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ex: 22"
              value={diasText}
              onChange={(e) => setDiasText(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-white border-2 border-emerald-600/20 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all max-w-[150px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Liquid Salary received */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-emerald-800">payments</span>
                Valor líquido realmente recebido
              </label>
              <input
                type="text"
                placeholder="Ex: R$ 2.779,25"
                value={salLiqText}
                onChange={(e) => setSalLiqText(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
              />
              <span className="text-[9px] text-slate-400">
                Seu salário líquido final que cai na conta bancária.
              </span>
            </div>

            {/* Total Hours worked in month */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-slate-500">schedule</span>
                Horas trabalhadas no mês
              </label>
              <input
                type="text"
                placeholder="Ex: 176"
                value={horasText}
                onChange={(e) => setHorasText(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
              />
              <span className="text-[9px] text-slate-400">
                Carga horária total (ex: 176 horas ou 220 horas).
              </span>
              <DecimalHoursHint />
            </div>

            {/* Extra Hours Quantity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-amber-500 font-bold">add_time</span>
                Horas extras realizadas
              </label>
              <input
                type="text"
                placeholder="Ex: 12"
                value={extrasText}
                onChange={(e) => setExtrasText(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
              />
              <span className="text-[9px] text-slate-400">
                Soma da quantidade de horas extras trabalhadas no mês.
              </span>
              <DecimalHoursHint />
            </div>

            {/* Night shift hours Quantity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-slate-800">dark_mode</span>
                Horas de adicional noturno realizadas
              </label>
              <input
                type="text"
                placeholder="Ex: 35"
                value={noturnasText}
                onChange={(e) => setNoturnasText(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
              />
              <span className="text-[9px] text-slate-400">
                Muitos holerites mostram apenas o valor, declare as horas se souber!
              </span>
              <DecimalHoursHint />
            </div>

            {/* DSR Intermitente Hours */}
            {showDsrField && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-indigo-500">beach_access</span>
                  Horas de DSR Intermitente
                </label>
                <input
                  type="text"
                  placeholder="Ex: 12,50"
                  value={dsrText}
                  onChange={(e) => setDsrText(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                />
                <span className="text-[9px] text-slate-400">
                  Horas referentes ao Descanso Semanal Remunerado.
                </span>
                <DecimalHoursHint />
              </div>
            )}

            {/* Company name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-slate-500">domain</span>
                Nome da empresa
              </label>
              <input
                type="text"
                placeholder="Aparece no cabeçalho"
                value={empresaText}
                onChange={(e) => setEmpresaText(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
              />
              <span className="text-[9px] text-slate-400">
                Razão social ou nome fantasia do empregador.
              </span>
            </div>

            {/* Worker Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-slate-500">work</span>
                Regime do trabalhador
              </label>
              <select
                value={tipoTrab}
                onChange={(e) => setTipoTrab(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
              >
                <option value="mensalista">Mensalista CLT (Fixo Mensal)</option>
                <option value="intermitente">Intermitente CLT (Por Período/Hora)</option>
              </select>
              <span className="text-[9px] text-slate-400">
                O regime define a base de proventos futuros.
              </span>
            </div>

          </div>

          {/* Worker Observations (observacoes) */}
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-slate-500">notes</span>
              Observações ou anotações pessoais
            </label>
            <textarea
              placeholder="Digite aqui as particularidades deste mês (ex: 'Recebi bonificação especial por bater meta', 'Descontaram atrasos indevidos')"
              rows={3}
              value={obsText}
              onChange={(e) => setObsText(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all resize-none"
            />
            <span className="text-[9px] text-slate-400">
              Essas notas ficarão registradas no detalhe do seu histórico do holerite.
            </span>
          </div>

        </div>

        {/* Action triggers */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDiscard}
            className="flex-1 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-600 text-xs font-bold py-3 px-4 rounded-xl transition-all"
          >
            Descartar holerite
          </button>
          
          <button
            onClick={handleRecalculate}
            className="flex-1 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            Recalcular análise
          </button>
        </div>

      </div>
    </div>
  );
}
