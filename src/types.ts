export interface Trabalhador {
  nome: string | null;
  tipo: "mensalista" | "intermitente" | null;
}

export interface Empresa {
  nome: string | null;
  cnpj: string | null;
}

export interface Competencia {
  mes: string | null;
  ano: string | null;
  data_credito?: string | null;
  tipo_processamento?: string | null;
}

export interface Valores {
  salario_bruto: number | null;
  salario_liquido: number | null;
  total_descontos: number | null;
  total_adicionais: number | null;
  inss: number | null;
  fgts: number | null;
  horas_extras_valor: number | null;
  adicional_noturno_valor: number | null;
  bonus: number | null;
  total_proventos?: number | null;
  dsr_valor?: number | null;
  ferias_valor?: number | null;
  terco_ferias_valor?: number | null;
  decimo_terceiro_valor?: number | null;
  vale_transporte_valor?: number | null;
  seguro_vida_valor?: number | null;
  saldo_devedor_valor?: number | null;
  adiantamento_valor?: number | null;
}

export interface Trabalho {
  dias_trabalhados: number | null;
  horas_trabalhadas: number | null;
  horas_extras: number | null;
  horas_noturnas: number | null;
  media_por_dia: number | null;
  media_por_hora: number | null;
  horas_dsr_intermitente?: number | null;
}

export interface ItemContracheque {
  nome: string;
  tipo: "provento" | "desconto";
  valor: number;
  referencia: string | null;
}

export interface Alerta {
  tipo: "atenção" | "info" | "perigo";
  mensagem: string;
}

export interface ValidacaoMultipla {
  status: "ok" | "erro" | "confirmacao_necessaria";
  motivo: string;
  mesma_competencia: boolean;
  mesma_empresa: boolean;
  mesmo_trabalhador: boolean;
  documentos_relacionados: boolean;
  deve_consolidar: boolean;
  tipo_consolidacao: "unica" | "adiantamento_fechamento" | "pagamento_complementar" | "nao_consolidar";
}

export interface ContrachequeAnalise {
  id: string;
  uploadedAt: string;
  fileName: string;
  trabalhador: Trabalhador;
  empresa: Empresa;
  competencia: Competencia;
  valores: Valores;
  trabalho: Trabalho;
  itens: ItemContracheque[];
  alertas: Alerta[];
  resumo_ia: string;
  validacao_multipla?: ValidacaoMultipla;
  metricas_calculadas?: {
    ganho_por_dia?: number | null;
    ganho_por_hora?: number | null;
    desconto_por_dia?: number | null;
    adicional_por_dia?: number | null;
    adicional_noturno_por_hora?: number | null;
    horas_extras_por_hora?: number | null;
    dsr_por_hora?: number | null;
  };
  observacoes_trabalhador?: string | null;
}

export type Screen =
  | "welcome"
  | "auth"
  | "dashboard"
  | "upload"
  | "analysis"
  | "complement-analysis"
  | "month_details"
  | "calendar"
  | "history"
  | "settings";

export interface User {
  nome: string;
  email: string;
}

export interface ComplementaryAnalysisData {
  dias_trabalhados?: number | null;
  horas_trabalhadas?: number | null;
  horas_extras?: number | null;
  horas_noturnas?: number | null;
  salario_liquido_recebido?: number | null;
  empresa_nome?: string | null;
  tipo_trabalhador?: "mensalista" | "intermitente" | null;
  observacoes?: string | null;
  horas_dsr_intermitente?: number | null;
}

