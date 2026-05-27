import { ContrachequeAnalise } from './types';

export const INITIAL_ANALYSED_LIST: ContrachequeAnalise[] = [
  {
    id: "item-1",
    uploadedAt: "2023-11-01T10:00:00Z",
    fileName: "contracheque_dezembro_2023.pdf",
    trabalhador: {
      nome: "João Silva",
      tipo: "mensalista"
    },
    empresa: {
      nome: "Tech Solutions S.A.",
      cnpj: "12.345.678/0001-90"
    },
    competencia: {
      mes: "Dezembro",
      ano: "2023"
    },
    valores: {
      salario_bruto: 8500.00,
      salario_liquido: 6240.00,
      total_descontos: 2260.00,
      total_adicionais: 770.00, // 350 adicional + 420 extras
      inss: 750.00,
      fgts: 680.00,
      horas_extras_valor: 420.00,
      adicional_noturno_valor: 350.00,
      bonus: 1500.00 // 13º e outros
    },
    trabalho: {
      dias_trabalhados: 22,
      horas_trabalhadas: 176,
      horas_extras: 12.0,
      horas_noturnas: 30.0,
      media_por_dia: 283.63,
      media_por_hora: 35.45
    },
    itens: [
      { nome: "Salário Base", tipo: "provento", valor: 8500.00, referencia: null },
      { nome: "Adicional Noturno", tipo: "provento", valor: 350.00, referencia: "30h" },
      { nome: "Horas Extras (50%)", tipo: "provento", valor: 420.00, referencia: "12h" },
      { nome: "Dedução Vale Transporte", tipo: "desconto", valor: 220.00, referencia: "6%" },
      { nome: "INSS", tipo: "desconto", valor: 750.00, referencia: null },
      { nome: "IRRF Retido na Fonte", tipo: "desconto", valor: 1290.00, referencia: null }
    ],
    alertas: [
      { tipo: "info", mensagem: "Inclusão de bônus natalino e 13º salário aumentou o rendimento líquido do mês significativamente." }
    ],
    resumo_ia: "Mês de excelente faturamento contendo bônus, adicional noturno e horas extras de João Silva, resultando em R$ 6.240,00 líquidos."
  },
  {
    id: "item-2",
    uploadedAt: "2023-10-31T18:00:00Z",
    fileName: "contracheque_outubro_2023.pdf",
    trabalhador: {
      nome: "João Silva",
      tipo: "mensalista"
    },
    empresa: {
      nome: "Tech Solutions S.A.",
      cnpj: "12.345.678/0001-90"
    },
    competencia: {
      mes: "Outubro",
      ano: "2023"
    },
    valores: {
      salario_bruto: 4500.00,
      salario_liquido: 3820.50,
      total_descontos: 679.50,
      total_adicionais: 150.00,
      inss: 420.00,
      fgts: 360.00,
      horas_extras_valor: 150.00,
      adicional_noturno_valor: 0.00,
      bonus: 0.00
    },
    trabalho: {
      dias_trabalhados: 22,
      horas_trabalhadas: 176,
      horas_extras: 10.0,
      horas_noturnas: null,
      media_por_dia: 283.63,
      media_por_hora: 35.45
    },
    itens: [
      { nome: "Salário Base Base", tipo: "provento", valor: 4500.00, referencia: null },
      { nome: "Horas Extras 50% (10h)", tipo: "provento", valor: 150.00, referencia: "10h" },
      { nome: "INSS", tipo: "desconto", valor: 420.00, referencia: null },
      { nome: "Dedução Vale Transporte", tipo: "desconto", valor: 120.00, referencia: "6%" },
      { nome: "Desconto Assistência Médica", tipo: "desconto", valor: 250.00, referencia: null }
    ],
    alertas: [
      {
        tipo: "atenção",
        mensagem: "Desconto Assistência Médica Elevado: O valor descontado para assistência médica (R$ 250,00) está 15% acima da média dos meses anteriores. Verifique com o RH se houve reajuste no plano."
      },
      {
        tipo: "info",
        mensagem: "Dedução Vale Transporte: O desconto de 6% sobre o salário base foi aplicado corretamente, mas note que houve dias de falta injustificada que podem ter impactado o cálculo proporcional."
      }
    ],
    resumo_ia: "O salário bruto do João Silva referente à competência Outubro/2023 foi de R$ 4.500,00. Foram identificados adicionais de R$ 150,00 (10 horas extras). Houve descontos totalizando R$ 679,50, resultando em um excelente salário líquido de R$ 3.820,50."
  },
  {
    id: "item-3",
    uploadedAt: "2023-09-30T10:00:00Z",
    fileName: "contracheque_setembro_2023.pdf",
    trabalhador: {
      nome: "João Silva",
      tipo: "mensalista"
    },
    empresa: {
      nome: "Tech Solutions S.A.",
      cnpj: "12.345.678/0001-90"
    },
    competencia: {
      mes: "Setembro",
      ano: "2023"
    },
    valores: {
      salario_bruto: 4500.00,
      salario_liquido: 3820.50,
      total_descontos: 679.50,
      total_adicionais: 150.00,
      inss: 420.00,
      fgts: 360.00,
      horas_extras_valor: 150.00,
      adicional_noturno_valor: 0.00,
      bonus: 0.00
    },
    trabalho: {
      dias_trabalhados: 22,
      horas_trabalhadas: 176,
      horas_extras: 10.0,
      horas_noturnas: null,
      media_por_dia: 173.65,
      media_por_hora: 21.70
    },
    itens: [
      { nome: "Salário Base", tipo: "provento", valor: 4500.00, referencia: null },
      { nome: "Horas Extras 50% (10h)", tipo: "provento", valor: 150.00, referencia: "10h" },
      { nome: "INSS", tipo: "desconto", valor: 420.00, referencia: null },
      { nome: "Dedução Vale Transporte", tipo: "desconto", valor: 120.00, referencia: "6%" },
      { nome: "Desconto Assistência Médica", tipo: "desconto", valor: 250.00, referencia: null }
    ],
    alertas: [],
    resumo_ia: "Competência Setembro regular sem ocorrências significativas. Salário líquido de R$ 3.820,50."
  }
];

export const CALENDAR_EVENTS = [
  { day: 2, label: "Trabalhado", type: "work" },
  { day: 3, label: "Trabalhado", type: "work" },
  { day: 4, label: "Trabalhado", type: "work" },
  { day: 5, label: "Trabalhado", type: "work" },
  { day: 6, label: "Cancelado", type: "cancelled" },
  { day: 7, label: "Folga", type: "rest" },
  { day: 9, label: "Trabalhado", type: "work" },
  { day: 10, label: "Trabalhado", type: "work" },
  { day: 11, label: "Trabalhado", type: "work" },
  { day: 12, label: "Feriado", type: "holiday", detail: "Nossa Senhora Aparecida" },
  { day: 13, label: "Trabalhado", type: "work" },
  { day: 16, label: "Trabalhado", type: "work" },
  { day: 17, label: "Trabalhado", type: "work" },
  { day: 18, label: "Trabalhado", type: "work" },
  { day: 19, label: "Trabalhado", type: "work" },
  { day: 20, label: "Trabalhado", type: "work" },
  { day: 23, label: "Trabalhado", type: "work" },
  { day: 24, label: "Trabalhado", type: "work" },
  { day: 25, label: "Trabalhado", type: "work" },
  { day: 26, label: "Trabalhado", type: "work" },
  { day: 27, label: "Pagamento", type: "payment" },
  { day: 30, label: "Trabalhado", type: "work" },
  { day: 31, label: "Trabalhado", type: "work" }
];
