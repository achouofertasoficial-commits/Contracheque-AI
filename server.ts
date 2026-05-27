import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Native CORS middleware configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper function to extract text or fall back to mock
function getMockPayload(fileName: string, mimeType?: string): any {
  const normName = (fileName || "").toLowerCase();
  
  if (normName.includes('janeiro') || normName.includes('ana') || normName.includes('intermitente')) {
    return {
      trabalhador: {
        nome: "Ana Silva",
        tipo: "intermitente"
      },
      empresa: {
        nome: "Tech Solutions S.A.",
        cnpj: "12.345.678/0001-99"
      },
      competencia: {
        mes: "Janeiro",
        ano: "2024"
      },
      valores: {
        salario_bruto: 4500.00,
        salario_liquido: 3390.00,
        total_descontos: 630.00,
        total_adicionais: 820.00,
        inss: 480.00,
        fgts: 360.00,
        horas_extras_valor: 320.00,
        adicional_noturno_valor: 0.00,
        bonus: 500.00
      },
      trabalho: {
        dias_trabalhados: 22,
        horas_trabalhadas: 176,
        horas_extras: 14.5,
        horas_noturnas: null,
        media_por_dia: 185.50,
        media_por_hora: 23.18
      },
      itens: [
        { nome: "Salário Base (CLT 160h)", tipo: "provento", valor: 3200.00, referencia: "160h" },
        { nome: "Horas Extras 50% (14.5h)", tipo: "provento", valor: 320.00, referencia: "14.5h" },
        { nome: "Bônus de Performance Q1", tipo: "provento", valor: 500.00, referencia: "Metas" },
        { nome: "Inposto de Renda Retido", tipo: "desconto", valor: 480.00, referencia: "Estimativa" },
        { nome: "Seguro de Saúde Coletivo", tipo: "desconto", valor: 150.00, referencia: "Plano" }
      ],
      alertas: [
        {
          tipo: "info",
          mensagem: "MoM Growth positivo! Crescimento de +R$ 450,00 em relação ao mês anterior motivado por bônus de performance."
        },
        {
          tipo: "atenção",
          mensagem: "Desconto de Seguro de Saúde estável. Desconto por imposto de renda retido na fonte proporcional ao bônus."
        }
      ],
      resumo_ia: "A análise de Janeiro de 2024 aponta uma excelente evolução de rendimentos para Ana Silva. Com um salário base bruto de R$ 3.200,00 acrescido de horas extras e um bônus de metas de R$ 500,00, o salário líquido atingiu R$ 3.390,00. As retenções do INSS e IRPF estão em conformidade legal.",
      campos_ausentes: []
    };
  }

  // Fallback or October Outubro 2023 (Screenshot matching)
  return {
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
    resumo_ia: "O salário bruto do João Silva referente à competência Outubro/2023 foi de R$ 4.500,00. Foram identificados adicionais de R$ 150,00 (10 horas extras). Houve descontos totalizando R$ 679,50, resultando em um excelente salário líquido de R$ 3.820,50.",
    campos_ausentes: []
  };
}

// REST route for Analysis
app.post('/api/analisar-contracheque', async (req, res) => {
  const { fileData, fileName, mimeType, files } = req.body;
  const incomingFiles = files || [];

  if (incomingFiles.length === 0 && fileData) {
    incomingFiles.push({
      fileData,
      name: fileName,
      mimeType,
      simulated: fileData === "simulated-test-data"
    });
  }

  if (incomingFiles.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`[Contracheque AI Server] Recebida requisição de análise para ${incomingFiles.length} arquivos.`);

  const analyzedResults = [];

  const aiSchema = {
    type: Type.OBJECT,
    properties: {
      trabalhador: {
        type: Type.OBJECT,
        properties: {
          nome: { type: Type.STRING, description: "Nome do trabalhador" },
          tipo: { type: Type.STRING, description: "mensalista ou intermitente" }
        }
      },
      empresa: {
        type: Type.OBJECT,
        properties: {
          nome: { type: Type.STRING },
          cnpj: { type: Type.STRING }
        }
      },
      competencia: {
        type: Type.OBJECT,
        properties: {
          mes: { type: Type.STRING, description: "Mês por extenso, ej: Outubro" },
          ano: { type: Type.STRING }
        }
      },
      valores: {
        type: Type.OBJECT,
        properties: {
          salario_bruto: { type: Type.NUMBER },
          salario_liquido: { type: Type.NUMBER },
          total_descontos: { type: Type.NUMBER },
          total_adicionais: { type: Type.NUMBER },
          inss: { type: Type.NUMBER },
          fgts: { type: Type.NUMBER },
          horas_extras_valor: { type: Type.NUMBER },
          adicional_noturno_valor: { type: Type.NUMBER },
          bonus: { type: Type.NUMBER }
        }
      },
      trabalho: {
        type: Type.OBJECT,
        properties: {
          dias_trabalhados: { type: Type.NUMBER },
          horas_trabalhadas: { type: Type.NUMBER },
          horas_extras: { type: Type.NUMBER },
          horas_noturnas: { type: Type.NUMBER },
          media_por_dia: { type: Type.NUMBER },
          media_por_hora: { type: Type.NUMBER }
        }
      },
      itens: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            nome: { type: Type.STRING },
            tipo: { type: Type.STRING, description: "provento ou desconto" },
            valor: { type: Type.NUMBER },
            referencia: { type: Type.STRING }
          }
        }
      },
      alertas: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            tipo: { type: Type.STRING, description: "atenção, info, perigo" },
            mensagem: { type: Type.STRING }
          }
        }
      },
      resumo_ia: { type: Type.STRING },
      campos_ausentes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista de campos ausentes identificados (ex: 'trabalhador.nome', 'trabalho.dias_trabalhados', etc.)"
      },
      validacao_multipla: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING },
          motivo: { type: Type.STRING },
          mesma_competencia: { type: Type.BOOLEAN },
          mesma_empresa: { type: Type.BOOLEAN },
          mesmo_trabalhador: { type: Type.BOOLEAN },
          documentos_relacionados: { type: Type.BOOLEAN },
          deve_consolidar: { type: Type.BOOLEAN },
          tipo_consolidacao: { type: Type.STRING }
        },
        required: ["status", "motivo", "mesma_competencia", "mesma_empresa", "mesmo_trabalhador", "documentos_relacionados", "deve_consolidar", "tipo_consolidacao"]
      }
    },
    required: ["trabalhador", "empresa", "competencia", "valores", "trabalho", "itens", "alertas", "resumo_ia"]
  };

  const modelPrompt = `Analise este arquivo de contracheque (pode ser imagem ou PDF) e extraia todas as informações financeiras.
Retorne um objeto JSON estritamente compatível com o seguinte de acordo com o padrão CLT brasileiro:
- trabalhador (nome, tipo ('mensalista' ou 'intermitente'))
- empresa (nome, cnpj)
- competencia (mes - em extenso em português ex: 'Outubro', ano)
- valores (salario_bruto, salario_liquido, total_descontos, total_adicionais (soma dos proventos além do salário bruto comum), inss, fgts, horas_extras_valor, adicional_noturno_valor, bonus)
- trabalho (dias_trabalhados, horas_trabalhadas, horas_extras, horas_noturnas, media_por_dia (liquido dividido por dias_trabalhados), media_por_hora (liquido dividido por horas_trabalhadas))
- itens (lista de cada linha no contracheque: { nome, tipo ('provento' ou 'desconto'), valor, referencia })
- alertas (lista de objetos { tipo ('atenção', 'info', 'perigo'), mensagem } alertando sobre descontos acentuados, imposto proporcional alto, ou comparado a médias)
- resumo_ia (uma explicação global e simples de entender para o trabalhador entender suas contas)
- campos_ausentes (uma lista de strings indicando os campos específicos que não foram encontrados ou estão ausentes/nulos, ex: ["empresa.nome", "trabalho.dias_trabalhados", "valores.salario_liquido"])
- validacao_multipla (um objeto avaliando se os documentos pertencem ao mesmo mês, trabalhador e pagamento, com: status='ok', motivo='Apenas um holerite', mesma_competencia=true, mesma_empresa=true, mesmo_trabalhador=true, documentos_relacionados=true, deve_consolidar=true, tipo_consolidacao='unica')

Importante: Não invente dados. Se não encontrar dias trabalhados, horas trabalhadas, empresa, salário líquido ou qualquer outro campo, retorne null. Não use valores padrão como 22 dias ou 176 horas. Os valores devem ser numéricos.`;

  for (const file of incomingFiles) {
    if (!file.fileData) continue;

    if (file.simulated) {
      console.log(`[Contracheque AI Server] Processando arquivo simulado: ${file.name}`);
      const mockResult = getMockPayload(file.name, file.mimeType);
      mockResult.validacao_multipla = {
        status: "ok",
        motivo: "Apenas um arquivo processado.",
        mesma_competencia: true,
        mesma_empresa: true,
        mesmo_trabalhador: true,
        documentos_relacionados: true,
        deve_consolidar: true,
        tipo_consolidacao: "unica"
      };
      analyzedResults.push(mockResult);
    } else if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.log(`[Contracheque AI Server] Sem chave API. Simulando processo para arquivo real: ${file.name}`);
      const mockResult = getMockPayload(file.name, file.mimeType);
      mockResult.validacao_multipla = {
        status: "ok",
        motivo: "Sem chave API real, decodificação em modo de demonstração simulado.",
        mesma_competencia: true,
        mesma_empresa: true,
        mesmo_trabalhador: true,
        documentos_relacionados: true,
        deve_consolidar: true,
        tipo_consolidacao: "unica"
      };
      analyzedResults.push(mockResult);
    } else {
      try {
        console.log(`[Contracheque AI Server] Enviando ${file.name} ao Gemini API...`);
        let rawBase64 = file.fileData;
        if (file.fileData.includes('base64,')) {
          rawBase64 = file.fileData.split('base64,')[1];
        }

        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const parsedMime = file.mimeType || "image/png";

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            {
              inlineData: {
                mimeType: parsedMime,
                data: rawBase64
              }
            },
            modelPrompt
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: aiSchema
          }
        });

        const parsedStr = response.text?.trim() || "";
        const resultObj = JSON.parse(parsedStr);
        resultObj.id = `pc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        if (!resultObj.validacao_multipla) {
          resultObj.validacao_multipla = {
            status: "ok",
            motivo: "Arquivo processado individualmente.",
            mesma_competencia: true,
            mesma_empresa: true,
            mesmo_trabalhador: true,
            documentos_relacionados: true,
            deve_consolidar: true,
            tipo_consolidacao: "unica"
          };
        }
        analyzedResults.push(resultObj);
      } catch (err: any) {
        console.error(`[Contracheque AI Server] Erro ao analisar ${file.name} via Gemini API:`, err);
        const fallback = getMockPayload(file.name, file.mimeType);
        fallback.alertas.unshift({
          tipo: "atenção",
          mensagem: `Aviso: Análise simulada gerada como fallback devido ao erro: ${err.message}`
        });
        fallback.id = `pc-fallback-${Date.now()}`;
        fallback.validacao_multipla = {
          status: "ok",
          motivo: `Simulada devido ao erro da API: ${err.message}`,
          mesma_competencia: true,
          mesma_empresa: true,
          mesmo_trabalhador: true,
          documentos_relacionados: true,
          deve_consolidar: true,
          tipo_consolidacao: "unica"
        };
        analyzedResults.push(fallback);
      }
    }
  }

  // Ensure every payload has a valid ID
  analyzedResults.forEach((resItem, index) => {
    if (!resItem.id) {
      resItem.id = `pc-${Date.now()}-${index}`;
    }
  });

  // Perform rigid multi-file validation
  if (analyzedResults.length <= 1) {
    const singleResult = analyzedResults[0];
    return res.json({
      validacao_multipla: singleResult?.validacao_multipla || {
        status: "ok",
        motivo: "Apenas um arquivo processado.",
        mesma_competencia: true,
        mesma_empresa: true,
        mesmo_trabalhador: true,
        documentos_relacionados: true,
        deve_consolidar: true,
        tipo_consolidacao: "unica"
      },
      result: singleResult,
      results: analyzedResults
    });
  }

  const first = analyzedResults[0];

  // 1. Compare Competency (Month and Year)
  const competenciaMesFirst = String(first.competencia?.mes || "").toLowerCase().trim();
  const competenciaAnoFirst = String(first.competencia?.ano || "").toLowerCase().trim();
  const sameCompetencia = analyzedResults.every(r => 
    String(r.competencia?.mes || "").toLowerCase().trim() === competenciaMesFirst &&
    String(r.competencia?.ano || "").toLowerCase().trim() === competenciaAnoFirst
  );

  if (!sameCompetencia) {
    console.log(`[Contracheque AI Server] Validação falhou: Meses diferentes detetados.`);
    return res.json({
      validacao_multipla: {
        status: "erro",
        motivo: "Os holerites enviados pertencem a meses diferentes. Envie apenas holerites da mesma competência para gerar uma análise consolidada.",
        mesma_competencia: false,
        mesma_empresa: true,
        mesmo_trabalhador: true,
        documentos_relacionados: false,
        deve_consolidar: false,
        tipo_consolidacao: "nao_consolidar"
      },
      results: analyzedResults
    });
  }

  // 2. Compare Empresa (CNPJ or Name)
  const sameEmpresa = analyzedResults.every(r => {
    const cnpj1 = String(first.empresa?.cnpj || "").replace(/\D/g, "");
    const cnpj2 = String(r.empresa?.cnpj || "").replace(/\D/g, "");
    if (cnpj1 && cnpj2 && cnpj1.length >= 8 && cnpj2.length >= 8) {
      return cnpj1 === cnpj2;
    }
    const nome1 = String(first.empresa?.nome || "").toLowerCase().trim();
    const nome2 = String(r.empresa?.nome || "").toLowerCase().trim();
    return nome1 === nome2 || nome1.includes(nome2) || nome2.includes(nome1);
  });

  if (!sameEmpresa) {
    console.log(`[Contracheque AI Server] Validação falhou: Empresas diferentes detetadas.`);
    return res.json({
      validacao_multipla: {
        status: "erro",
        motivo: "Os holerites enviados pertencem a empresas diferentes. Para evitar cálculos incorretos, envie apenas holerites da mesma empresa e do mesmo mês.",
        mesma_competencia: true,
        mesma_empresa: false,
        mesmo_trabalhador: true,
        documentos_relacionados: false,
        deve_consolidar: false,
        tipo_consolidacao: "nao_consolidar"
      },
      results: analyzedResults
    });
  }

  // 3. Compare Trabalhador (Nome)
  const sameTrabalhador = analyzedResults.every(r => {
    const nome1 = String(first.trabalhador?.nome || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const nome2 = String(r.trabalhador?.nome || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return nome1 === nome2 || nome1.includes(nome2) || nome2.includes(nome1);
  });

  if (!sameTrabalhador) {
    console.log(`[Contracheque AI Server] Validação falhou: Trabalhadores diferentes detetados.`);
    return res.json({
      validacao_multipla: {
        status: "erro",
        motivo: "Os holerites enviados pertencem a trabalhadores diferentes.",
        mesma_competencia: true,
        mesma_empresa: true,
        mesmo_trabalhador: false,
        documentos_relacionados: false,
        deve_consolidar: false,
        tipo_consolidacao: "nao_consolidar"
      },
      results: analyzedResults
    });
  }

  // 4. Detecção de Documentos Relacionados (Caso 1 de Adiantamento Folha) vs Pagamento Complementar (Caso 4)
  let adiantamentoFound = false;
  let matchesAmount = false;
  let exactAdiantamentoValue = 0;

  // Search if any item is "Adiantamento" or "Antecipação" matching corresponding liquid
  analyzedResults.forEach(r => {
    r.itens?.forEach((it: any) => {
      const name = String(it.nome).toLowerCase();
      if ((name.includes("adiantamento") || name.includes("antecipa") || name.includes("folha") || name.includes("via folha")) && it.tipo === "desconto") {
        adiantamentoFound = true;
        exactAdiantamentoValue = it.valor;
      }
    });
  });

  // Calculate if any other payslip's net salary (salario_liquido) matches that discount or if gross/net are highly close
  analyzedResults.forEach((r1, idx1) => {
    analyzedResults.forEach((r2, idx2) => {
      if (idx1 === idx2) return;
      const liq1 = r1.valores?.salario_liquido || 0;
      const gross1 = r1.valores?.salario_bruto || 0;
      const gross2 = r2.valores?.salario_bruto || 0;

      if (exactAdiantamentoValue > 0 && Math.abs(liq1 - exactAdiantamentoValue) < 10) {
        matchesAmount = true;
      }
      if (Math.abs(gross1 - gross2) < 5 && ((r1.valores?.salario_liquido === 0) || (r2.valores?.salario_liquido === 0))) {
        matchesAmount = true;
      }
    });
  });

  if (adiantamentoFound || matchesAmount) {
    console.log(`[Contracheque AI Server] CASO 1: Consolidando Adiantamento + Fechamento.`);
    let mainFechamento = analyzedResults.find(r => 
      r.itens?.some((it: any) => String(it.nome).toLowerCase().includes("adiantamento") && it.tipo === "desconto")
    ) || first;

    const resultObj = JSON.parse(JSON.stringify(mainFechamento));
    resultObj.id = `pc-consolidated-${Date.now()}`;
    
    const nonZeroLiquidDoc = analyzedResults.find(r => (r.valores?.salario_liquido || 0) > 0);
    if (nonZeroLiquidDoc) {
      resultObj.valores.salario_liquido = nonZeroLiquidDoc.valores.salario_liquido;
    }

    resultObj.validacao_multipla = {
      status: "ok",
      motivo: "Holerites de adiantamento e fechamento unificados eletronicamente com sucesso.",
      mesma_competencia: true,
      mesma_empresa: true,
      mesmo_trabalhador: true,
      documentos_relacionados: true,
      deve_consolidar: true,
      tipo_consolidacao: "adiantamento_fechamento"
    };

    const existingItemKeys = new Set(resultObj.itens?.map((it: any) => `${it.nome}-${it.tipo}-${it.valor}`.toLowerCase()) || []);
    analyzedResults.forEach(r => {
      if (r === mainFechamento) return;
      r.itens?.forEach((it: any) => {
        const key = `${it.nome}-${it.tipo}-${it.valor}`.toLowerCase();
        if (!existingItemKeys.has(key)) {
          existingItemKeys.add(key);
          if (!resultObj.itens) resultObj.itens = [];
          resultObj.itens.push(it);
        }
      });
    });

    resultObj.alertas = resultObj.alertas || [];
    if (!resultObj.alertas.some((a: any) => a.mensagem.includes("adiantamento"))) {
      resultObj.alertas.unshift({
        tipo: "info",
        mensagem: "Consolidação Inteligente: Identificamos holerites de Adiantamento e Fechamento. Os valores foram consolidados de forma correta, impedindo a duplicação indevida de salários."
      });
    }

    resultObj.resumo_ia = `Análise consolidada da competência de ${resultObj.competencia.mes}/${resultObj.competencia.ano} para ${resultObj.trabalhador.nome}.\n` +
      `Identificamos que os documentos enviados referem-se ao mesmo período de pagamento (Adiantamento + Fechamento Mensal).\n` +
      `Por isso, os valores não foram duplicados para evitar erros.\n` +
      `Salário Bruto real: R$ ${resultObj.valores.salario_bruto?.toFixed(2)}.\n` +
      `Valor líquido real de fato recebido na conta: R$ ${resultObj.valores.salario_liquido?.toFixed(2)} (já descontado o adiantamento de forma legal).`;

    return res.json({
      validacao_multipla: resultObj.validacao_multipla,
      result: resultObj,
      results: analyzedResults
    });
  }

  // Check for duplicate identical file uploads
  const isDuplicateFiles = analyzedResults.every(r => 
    Math.abs((r.valores?.salario_bruto || 0) - (first.valores?.salario_bruto || 0)) < 1 &&
    Math.abs((r.valores?.salario_liquido || 0) - (first.valores?.salario_liquido || 0)) < 1
  );

  if (isDuplicateFiles) {
    console.log(`[Contracheque AI Server] Unificando arquivos de holerites idênticos.`);
    const resultObj = JSON.parse(JSON.stringify(first));
    resultObj.id = `pc-consolidated-${Date.now()}`;
    resultObj.validacao_multipla = {
      status: "ok",
      motivo: "Arquivos idênticos de holerite unificados para evitar duplicidade de salário.",
      mesma_competencia: true,
      mesma_empresa: true,
      mesmo_trabalhador: true,
      documentos_relacionados: true,
      deve_consolidar: true,
      tipo_consolidacao: "unica"
    };
    return res.json({
      validacao_multipla: resultObj.validacao_multipla,
      result: resultObj,
      results: analyzedResults
    });
  }

  // CASO 4: Mesmo mês, mesma empresa, mas valores diferentes. Pedir confirmação.
  console.log(`[Contracheque AI Server] CASO 4: Mesmo mês e mesma empresa, mas valores diferentes. Pedindo confirmação.`);
  return res.json({
    validacao_multipla: {
      status: "confirmacao_necessaria",
      motivo: "Encontramos holerites do mesmo mês e da mesma empresa, mas com valores diferentes. Deseja analisar como pagamento complementar?",
      mesma_competencia: true,
      mesma_empresa: true,
      mesmo_trabalhador: true,
      documentos_relacionados: false,
      deve_consolidar: false,
      tipo_consolidacao: "pagamento_complementar"
    },
    results: analyzedResults
  });
});

// Vite Middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Contracheque AI Server] Executando em http://localhost:${PORT}`);
  });
}

startServer();
